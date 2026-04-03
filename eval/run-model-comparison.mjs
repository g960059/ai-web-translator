/**
 * Run full-page translation with multiple models for comparison.
 * Uses the actual Chrome extension via Playwright.
 */
import dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

dotenv.config();

const apiKey = process.env.E2E_OPENROUTER_API_KEY;
const targetUrl = 'https://en.wikipedia.org/wiki/Representation_theory';

const MODELS = [
  'google/gemini-3-flash-preview',
  'moonshotai/kimi-k2-0905',
  'deepseek/deepseek-v3.2',
  'google/gemini-2.5-flash-lite',
  'meta-llama/llama-4-scout',
  'google/gemini-3.1-flash-lite-preview',
];

if (!apiKey) throw new Error('Missing E2E_OPENROUTER_API_KEY.');

const extensionPath = resolve(process.cwd(), 'dist');
const outputDir = resolve(process.cwd(), 'eval', 'model-comparison');
await mkdir(outputDir, { recursive: true });

function toSlug(modelId) {
  return modelId.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
}

async function translateWithModel(modelId) {
  const slug = toSlug(modelId);
  const userDataDir = await mkdtemp(join(tmpdir(), `aiwt-${slug}-`));
  let context = null;
  let closing = false;
  const requests = [];

  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chromium',
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
      viewport: { width: 1440, height: 1800 },
    });

    await context.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
      try {
        const response = await route.fetch({ timeout: 180_000 });
        const payload = await response.json();
        requests.push({ usage: payload.usage });
        await route.fulfill({ response, json: payload });
      } catch (error) {
        if (closing) return;
        throw error;
      }
    });

    const serviceWorker =
      context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
    const page = await context.newPage();

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.waitForTimeout(3_000);

    const seededSettings = {
      provider: 'openrouter',
      apiKey,
      model: modelId,
      targetLanguage: 'ja',
      style: 'auto',
      translateFullPage: false,
      cacheEnabled: false,
    };

    await serviceWorker.evaluate(async (s) => {
      await chrome.storage.local.set({ settings_v2: s });
    }, seededSettings);

    const startedAt = Date.now();
    const translationResponse = await sendMsg(serviceWorker, targetUrl, {
      type: 'START_TRANSLATION',
      settings: seededSettings,
      scope: 'main',
    });

    if (!translationResponse?.ok) {
      return { modelId, error: `Start failed: ${JSON.stringify(translationResponse)}` };
    }

    await page.waitForFunction(() => {
      const root = document.querySelector('.mw-parser-output') ?? document.body;
      return /[ぁ-んァ-ン一-龯]/.test(root.textContent || '');
    }, { timeout: 180_000 });

    const finalState = await scrollUntilDone(page, serviceWorker, targetUrl);
    const elapsedMs = Date.now() - startedAt;

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(500);

    // Extract translated text
    const translatedText = await page.evaluate(() => {
      const root = document.querySelector('.mw-parser-output') ?? document.body;
      const lines = [];
      const skip = '.reflist, .references, .navbox, .sidebar, .infobox, .mw-editsection, .toc, .catlinks, style, script, .noprint';
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let node = walker.currentNode;
      while (node) {
        if (node.matches?.(skip) || node.closest?.(skip)) { node = walker.nextNode(); if (!node) break; continue; }
        const tag = node.tagName?.toLowerCase();
        if (/^h[1-6]$/.test(tag)) {
          const text = node.textContent?.replace(/\[edit\]/g, '').trim();
          if (text) lines.push('\n' + '#'.repeat(parseInt(tag[1])) + ' ' + text + '\n');
        } else if (tag === 'p') {
          const text = node.textContent?.trim();
          if (text && text.length > 10) lines.push(text + '\n');
        }
        node = walker.nextNode();
      }
      return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    });

    const promptTokens = requests.reduce((s, r) => s + (r.usage?.prompt_tokens || 0), 0);
    const completionTokens = requests.reduce((s, r) => s + (r.usage?.completion_tokens || 0), 0);

    await writeFile(join(outputDir, `${slug}.md`), translatedText, 'utf8');

    return {
      modelId, slug, elapsedMs,
      requestCount: requests.length,
      promptTokens, completionTokens,
      status: finalState?.status || 'unknown',
      textLength: translatedText.length,
    };
  } finally {
    closing = true;
    try { await context?.unrouteAll?.({ behavior: 'ignoreErrors' }); } catch {}
    await context?.close();
    await rm(userDataDir, { recursive: true, force: true });
  }
}

async function sendMsg(sw, url, msg) {
  for (let i = 0; i < 40; i++) {
    const r = await sw.evaluate(async ({ url, m }) => {
      const tabs = await chrome.tabs.query({});
      const t = tabs.find(t => t.url === url);
      if (!t?.id) return { ok: false, retry: true };
      try { return await chrome.tabs.sendMessage(t.id, m); }
      catch (e) { return { ok: false, retry: true, message: e.message }; }
    }, { url, m: msg });
    if (r?.retry) { await delay(250); continue; }
    return r;
  }
  throw new Error('Content script not ready');
}

async function scrollUntilDone(page, sw, url) {
  const timeout = Date.now() + 10 * 60_000;
  let lastKey = '', lastAt = Date.now();
  while (Date.now() < timeout) {
    const state = await sendMsg(sw, url, { type: 'GET_SESSION_SNAPSHOT' });
    if (!state?.ok) { await delay(500); continue; }
    const s = state.snapshot;
    if (s?.status === 'failed') throw new Error(s.lastError || 'Failed');
    if (s?.status === 'completed' || s?.status === 'completed_with_warnings') return s;
    const key = `${s?.status}:${s?.progressPercent}`;
    if (key !== lastKey) { lastKey = key; lastAt = Date.now(); }
    const scroll = await page.evaluate(() => ({
      top: window.scrollY, vh: window.innerHeight, sh: document.documentElement.scrollHeight
    }));
    if (scroll.top + scroll.vh < scroll.sh - 48) {
      await page.evaluate(vh => { window.scrollBy({ top: Math.max(320, vh * 0.82), behavior: 'instant' }); window.dispatchEvent(new Event('scroll')); }, scroll.vh);
    }
    if (Date.now() - lastAt > 90_000) throw new Error(`Stalled at ${s?.progressPercent}%`);
    await delay(650);
  }
  throw new Error('Timeout');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Run sequentially
console.log(`Testing ${MODELS.length} models on ${targetUrl}\n`);
const results = [];
for (const modelId of MODELS) {
  console.log(`\n--- ${modelId} ---`);
  try {
    const r = await translateWithModel(modelId);
    console.log(`  ${r.elapsedMs}ms | ${r.requestCount} reqs | ${r.promptTokens}p/${r.completionTokens}c | ${r.status} | ${r.textLength} chars`);
    results.push(r);
  } catch (error) {
    console.log(`  ERROR: ${error.message}`);
    results.push({ modelId, error: error.message });
  }
}

// Summary
console.log('\n' + '='.repeat(100));
console.log('SUMMARY');
console.log('='.repeat(100));
const summary = results.map(r => r.error
  ? `${r.modelId}: ERROR - ${r.error}`
  : `${r.modelId}: ${r.elapsedMs}ms | ${r.requestCount} reqs | ${r.status} | ${r.textLength} chars`
).join('\n');
console.log(summary);
await writeFile(join(outputDir, 'summary.json'), JSON.stringify(results, null, 2), 'utf8');
console.log('\nResults saved to eval/model-comparison/');
