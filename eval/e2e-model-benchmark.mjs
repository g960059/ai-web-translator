/**
 * E2E model benchmark: translates real Wikipedia pages using the actual
 * Chrome extension pipeline (Playwright + Chromium), then extracts the
 * rendered translation for evaluation.
 */
import { chromium } from 'playwright';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.E2E_OPENROUTER_API_KEY;
if (!API_KEY) throw new Error('Missing E2E_OPENROUTER_API_KEY');

const MODELS = [
  'google/gemma-4-31b-it',
  'google/gemini-3.1-flash-lite-preview',
  'qwen/qwen3.5-35b-a3b',
];

const PAGES = [
  'https://en.wikipedia.org/wiki/Representation_theory_of_finite_groups',
  'https://en.wikipedia.org/wiki/Representation_theory',
];

const EXTENSION_PATH = resolve(process.cwd(), 'dist');
const OUT_DIR = resolve(process.cwd(), 'eval', 'e2e-benchmark');
mkdirSync(OUT_DIR, { recursive: true });

const TRANSLATION_TIMEOUT = 300_000; // 5 min max per page
const QWEN_FAIL_THRESHOLD = 5; // Stop qwen after 5 consecutive errors

async function runBenchmark() {
  const results = [];

  for (const modelId of MODELS) {
    for (const pageUrl of PAGES) {
      const slug = pageUrl.split('/').pop();
      const fileKey = `${slug}_${modelId.replace(/\//g, '_')}`;

      // Skip if already done
      if (existsSync(join(OUT_DIR, `${fileKey}.json`))) {
        console.log(`\n--- SKIP ${modelId} on ${slug} (already done) ---`);
        continue;
      }

      console.log(`\n=== ${modelId} on ${slug} ===`);
      const startMs = Date.now();
      let userDataDir;

      try {
        userDataDir = await mkdtemp(join(tmpdir(), 'aiwt-e2e-'));
        const context = await chromium.launchPersistentContext(userDataDir, {
          channel: 'chromium',
          headless: true,
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--no-first-run',
            '--disable-gpu',
          ],
        });

        // Wait for service worker
        const sw = await waitForServiceWorker(context);

        // Seed settings
        await sw.evaluate(async ({ apiKey, model }) => {
          await chrome.storage.local.set({
            settings_v2: {
              provider: 'openrouter',
              apiKey,
              model,
              modelPreset: 'fast',
              targetLanguage: 'ja',
              style: 'auto',
              translateFullPage: false,
              cacheEnabled: false,
              showOriginalOnHover: true,
            },
          });
        }, { apiKey: API_KEY, model: modelId });

        // Navigate to page
        const page = await context.newPage();
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

        // Trigger translation
        const startTranslation = await sendContentMessage(sw, pageUrl, {
          type: 'START_TRANSLATION',
          settings: {
            provider: 'openrouter',
            apiKey: API_KEY,
            model: modelId,
            modelPreset: 'fast',
            targetLanguage: 'ja',
            style: 'auto',
            translateFullPage: false,
            cacheEnabled: false,
            showOriginalOnHover: true,
          },
          scope: 'main',
        });

        if (!startTranslation?.ok) {
          throw new Error(`START_TRANSLATION failed: ${startTranslation?.message || 'unknown'}`);
        }

        console.log('  Translation started, scrolling page for full translation...');

        // Scroll the page progressively to trigger lazy loading
        await autoScrollPage(page);

        // Wait for completion with Qwen early abort
        const completionResult = await waitForCompletion(sw, pageUrl, modelId, TRANSLATION_TIMEOUT);
        const elapsedMs = Date.now() - startMs;

        if (completionResult.aborted) {
          console.log(`  ABORTED: ${completionResult.reason} (${(elapsedMs / 1000).toFixed(1)}s)`);
          results.push({ model: modelId, page: slug, error: completionResult.reason, elapsedMs });
          await context.close();
          await rm(userDataDir, { recursive: true, force: true });
          continue;
        }

        console.log(`  Status: ${completionResult.status} (${(elapsedMs / 1000).toFixed(1)}s)`);

        // Extract translated content — strip invisible MathML annotations first
        const extracted = await page.evaluate(() => {
          document.querySelectorAll('annotation, .mwe-math-mathml-a11y').forEach(a => a.remove());
          const blocks = document.querySelectorAll('[data-aiwt-warning], p, h1, h2, h3, h4, h5, h6, li');
          const items = [];
          const seen = new Set();
          blocks.forEach(el => {
            const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (text.length < 5 || seen.has(text)) return;
            seen.add(text);
            const warning = el.getAttribute('data-aiwt-warning');
            items.push({
              tag: el.tagName.toLowerCase(),
              text: text.slice(0, 300),
              warning: warning || null,
            });
          });
          return items;
        });

        // Count Japanese content
        const jpPattern = /[ぁ-んァ-ン一-龯]/;
        const translatedBlocks = extracted.filter(b => jpPattern.test(b.text));
        const fallbackBlocks = extracted.filter(b => b.warning === 'fallback-source');
        const warningBlocks = extracted.filter(b => b.warning && b.warning !== 'fallback-source');

        console.log(`  Blocks: ${extracted.length} total, ${translatedBlocks.length} translated, ${fallbackBlocks.length} fallback, ${warningBlocks.length} warnings`);

        // Sample translations for evaluation
        const sample = translatedBlocks
          .filter(b => b.tag === 'p' && b.text.length > 30)
          .slice(0, 20)
          .map(b => b.text);

        const result = {
          model: modelId,
          page: slug,
          elapsedMs,
          status: completionResult.status,
          totalBlocks: extracted.length,
          translatedBlocks: translatedBlocks.length,
          fallbackBlocks: fallbackBlocks.length,
          warningBlocks: warningBlocks.length,
          sample,
          metrics: completionResult.metrics,
        };

        results.push(result);
        await writeFile(join(OUT_DIR, `${fileKey}.json`), JSON.stringify(result, null, 2));
        console.log(`  Saved: ${fileKey}.json`);

        await context.close();
        await rm(userDataDir, { recursive: true, force: true });
      } catch (err) {
        const elapsedMs = Date.now() - startMs;
        console.error(`  ERROR: ${err.message} (${(elapsedMs / 1000).toFixed(1)}s)`);
        results.push({ model: modelId, page: slug, error: err.message, elapsedMs });
        if (userDataDir) await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
      }
    }
  }

  // Save summary
  await writeFile(join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2));

  // Generate sample files for evaluation
  for (const r of results) {
    if (r.error || !r.sample?.length) continue;
    const slug = r.page;
    const fileKey = `${slug}_${r.model.replace(/\//g, '_')}`;
    const sampleText = [
      `# Model: ${r.model}`,
      `# Page: ${slug}`,
      `# Pipeline: Chrome extension E2E (actual pipeline)`,
      `# Time: ${(r.elapsedMs / 1000).toFixed(1)}s`,
      `# Blocks: ${r.totalBlocks} total, ${r.translatedBlocks} translated, ${r.fallbackBlocks} fallback`,
      '',
      ...r.sample.map((t, i) => `${i + 1}. ${t}`),
    ].join('\n');
    await writeFile(join(OUT_DIR, `sample_${fileKey}.txt`), sampleText);
  }

  console.log('\n=== Summary ===');
  for (const r of results) {
    if (r.error) {
      console.log(`${r.model} | ${r.page} | ERROR: ${r.error}`);
    } else {
      console.log(`${r.model} | ${r.page} | ${(r.elapsedMs / 1000).toFixed(1)}s | ${r.translatedBlocks}/${r.totalBlocks} translated | ${r.fallbackBlocks} fallback`);
    }
  }
}

// --- Helpers ---

async function autoScrollPage(page) {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  let currentScroll = 0;
  const step = viewportHeight * 0.8;

  while (currentScroll < scrollHeight) {
    currentScroll += step;
    await page.evaluate((y) => window.scrollTo(0, y), currentScroll);
    await new Promise(r => setTimeout(r, 1500)); // Wait for lazy batch to trigger
  }

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  console.log(`  Scrolled ${Math.ceil(scrollHeight / step)} times`);
}

async function waitForServiceWorker(context) {
  const existing = context.serviceWorkers();
  for (const sw of existing) {
    if (sw.url().includes('background')) return sw;
  }
  return context.waitForEvent('serviceworker', { timeout: 15_000 });
}

async function sendContentMessage(sw, targetUrl, message) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const response = await sw.evaluate(async ({ url, msg }) => {
      const tabs = await chrome.tabs.query({});
      const tab = tabs.find(t => t.url === url);
      if (!tab?.id) return { ok: false, retry: true };
      try {
        return await chrome.tabs.sendMessage(tab.id, msg);
      } catch (e) {
        const text = e instanceof Error ? e.message : String(e);
        return { ok: false, retry: text.includes('Receiving end does not exist'), message: text };
      }
    }, { url: targetUrl, msg: message });
    if (response?.retry) {
      await new Promise(r => setTimeout(r, 500));
      continue;
    }
    return response;
  }
  throw new Error('Content script not ready');
}

async function waitForCompletion(sw, targetUrl, modelId, timeoutMs) {
  const start = Date.now();
  let consecutiveErrors = 0;
  let lastStatus = '';

  while (Date.now() - start < timeoutMs) {
    const snapshot = await sw.evaluate(async ({ url }) => {
      const tabs = await chrome.tabs.query({});
      const tab = tabs.find(t => t.url === url);
      if (!tab?.id) return null;
      try {
        return await chrome.tabs.sendMessage(tab.id, { type: 'GET_SESSION_SNAPSHOT' });
      } catch { return null; }
    }, { url: targetUrl });

    const status = snapshot?.snapshot?.status;
    if (status && status !== lastStatus) {
      console.log(`  Status: ${status} (${((Date.now() - start) / 1000).toFixed(0)}s)`);
      lastStatus = status;
    }

    // Check for Qwen-specific abort
    if (modelId.includes('qwen')) {
      const metrics = snapshot?.snapshot?.metrics;
      const retries = metrics?.retryCounts;
      if (retries && (retries.transient || 0) + (retries.batchSplits || 0) > QWEN_FAIL_THRESHOLD) {
        return { aborted: true, reason: `Too many retries (${JSON.stringify(retries)})`, status };
      }
    }

    if (status === 'completed' || status === 'completed_with_warnings') {
      return { status, metrics: snapshot?.snapshot?.metrics };
    }
    // After scrolling, lazy may persist briefly while batches process — wait longer
    if (status === 'lazy' && (Date.now() - start) > 240_000) {
      console.log('  Lazy session timeout — treating as complete');
      return { status: 'completed (lazy-timeout)', metrics: snapshot?.snapshot?.metrics };
    }
    if (status === 'failed') {
      return { aborted: true, reason: snapshot?.snapshot?.lastError || 'Translation failed', status };
    }

    // Timeout-based abort for slow models
    if (Date.now() - start > 180_000 && status === 'lazy') {
      // If still in lazy after 3 minutes, that's fine — keep waiting
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  return { aborted: true, reason: 'Timeout', status: lastStatus };
}

runBenchmark().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
