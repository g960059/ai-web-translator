/**
 * Run the real extension against a live URL, capture:
 * - Full-page screenshot (translated)
 * - Translated text extracted from the DOM
 * - Original text (before translation)
 * - Metrics JSON
 *
 * Based on tests/e2e/run-live-page-metrics.mjs
 */
import dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

dotenv.config();

const apiKey = process.env.E2E_OPENROUTER_API_KEY;
const modelId = process.env.E2E_TRANSLATION_MODEL || 'google/gemini-2.5-flash';
const targetUrl = process.argv[2] || 'https://en.wikipedia.org/wiki/Representation_theory';

if (!apiKey) {
  throw new Error('Missing E2E_OPENROUTER_API_KEY.');
}

const extensionPath = resolve(process.cwd(), 'dist');
const outputDir = resolve(process.cwd(), 'eval');
await mkdir(outputDir, { recursive: true });

const requests = [];
let context = null;
let closing = false;

try {
  const userDataDir = await mkdtemp(join(tmpdir(), 'ai-web-translator-eval-'));

  context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    viewport: { width: 1440, height: 1800 },
  });

  // Intercept OpenRouter requests for metrics
  await context.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    try {
      const requestJson = route.request().postDataJSON();
      const response = await route.fetch({ timeout: 180_000 });
      const payload = await response.json();
      requests.push({ request: requestJson, response: payload });
      await route.fulfill({ response, json: payload });
    } catch (error) {
      if (closing) return;
      throw error;
    }
  });

  const serviceWorker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  const page = await context.newPage();

  console.log(`Loading ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForTimeout(3_000);

  // Extract original text BEFORE translation
  console.log('Extracting original text...');
  const originalText = await extractArticleText(page);
  await writeFile(join(outputDir, 'original_from_page.md'), originalText, 'utf8');

  // Seed extension settings
  const seededSettings = {
    provider: 'openrouter',
    apiKey,
    model: modelId,
    targetLanguage: 'ja',
    style: 'auto',
    translateFullPage: false,
    cacheEnabled: false,
  };

  await serviceWorker.evaluate(async (nextSettings) => {
    await chrome.storage.local.set({ settings_v2: nextSettings });
  }, seededSettings);

  console.log(`Starting translation with model: ${modelId}...`);
  const startedAt = Date.now();

  const translationResponse = await sendContentMessageWithRetry(serviceWorker, targetUrl, {
    type: 'START_TRANSLATION',
    settings: seededSettings,
    scope: 'main',
  });

  if (!translationResponse?.ok) {
    throw new Error(`Translation failed to start: ${JSON.stringify(translationResponse)}`);
  }

  // Wait for first Japanese text to appear
  await page.waitForFunction(() => {
    const root =
      document.querySelector('main, article, [role="main"], #mw-content-text, .mw-parser-output') ??
      document.body;
    return /[ぁ-んァ-ン一-龯]/.test(root.textContent || '');
  }, { timeout: 180_000 });

  console.log(`First translation visible at ${Date.now() - startedAt}ms`);

  // Scroll and wait for completion
  const finalState = await scrollUntilTranslated(page, serviceWorker, targetUrl);
  const completedAt = Date.now();
  console.log(`Translation completed in ${completedAt - startedAt}ms. Status: ${finalState?.status}`);

  // Scroll back to top and take screenshot
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(1_000);
  await page.screenshot({
    path: join(outputDir, 'translated_screenshot.png'),
    fullPage: true,
  });
  console.log('Screenshot saved.');

  // Extract translated text
  console.log('Extracting translated text...');
  const translatedText = await extractArticleText(page);
  await writeFile(join(outputDir, 'translated_ja_from_page.md'), translatedText, 'utf8');

  // Build comparison document
  const originalSections = splitBySections(originalText);
  const translatedSections = splitBySections(translatedText);

  let comparison = `# Translation Evaluation: Representation Theory\n\n`;
  comparison += `- **URL**: ${targetUrl}\n`;
  comparison += `- **Model**: ${modelId}\n`;
  comparison += `- **Style**: auto (fluent expository prose)\n`;
  comparison += `- **Register**: dearu\n`;
  comparison += `- **Elapsed**: ${completedAt - startedAt}ms\n`;
  comparison += `- **API Requests**: ${requests.length}\n`;

  const promptTokens = requests.reduce(
    (sum, e) => sum + Number(e.response?.usage?.prompt_tokens || 0), 0);
  const completionTokens = requests.reduce(
    (sum, e) => sum + Number(e.response?.usage?.completion_tokens || 0), 0);
  comparison += `- **Tokens**: prompt=${promptTokens}, completion=${completionTokens}\n\n`;
  comparison += `---\n\n`;

  // Interleave original and translated sections
  const maxSections = Math.max(originalSections.length, translatedSections.length);
  for (let i = 0; i < maxSections; i++) {
    comparison += `## Section ${i + 1}\n\n`;
    if (originalSections[i]) {
      comparison += `### Original (English)\n\n${originalSections[i]}\n\n`;
    }
    if (translatedSections[i]) {
      comparison += `### Translation (Japanese)\n\n${translatedSections[i]}\n\n`;
    }
    comparison += `---\n\n`;
  }

  await writeFile(join(outputDir, 'comparison.md'), comparison, 'utf8');

  // Save metrics
  const metrics = {
    targetUrl,
    modelId,
    elapsedMs: completedAt - startedAt,
    requestCount: requests.length,
    usage: { promptTokens, completionTokens },
    finalState,
  };
  await writeFile(join(outputDir, 'metrics.json'), JSON.stringify(metrics, null, 2), 'utf8');

  console.log('\nAll outputs saved to eval/ directory:');
  console.log('  - original_from_page.md');
  console.log('  - translated_ja_from_page.md');
  console.log('  - comparison.md');
  console.log('  - translated_screenshot.png');
  console.log('  - metrics.json');

} finally {
  closing = true;
  try { await context?.unrouteAll?.({ behavior: 'ignoreErrors' }); } catch {}
  await context?.close();
}

// --- Helpers ---

async function extractArticleText(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.mw-parser-output') ?? document.querySelector('article') ?? document.body;
    const lines = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode;

    const skipSelectors = '.reflist, .references, .navbox, .sidebar, .infobox, .mw-editsection, .toc, .catlinks, .mw-heading .mw-editsection, style, script, .noprint';

    while (node) {
      if (node.matches?.(skipSelectors) || node.closest?.(skipSelectors)) {
        node = walker.nextSibling() || walker.parentNode() && walker.nextSibling();
        if (!node) break;
        continue;
      }

      const tag = node.tagName?.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        const level = parseInt(tag[1]);
        const text = node.textContent?.replace(/\[edit\]/g, '').trim();
        if (text) lines.push('\n' + '#'.repeat(level) + ' ' + text + '\n');
      } else if (tag === 'p') {
        const text = node.textContent?.trim();
        if (text && text.length > 10) lines.push(text + '\n');
      } else if (tag === 'li' && node.parentElement?.tagName?.toLowerCase() === 'ul') {
        const text = node.textContent?.trim();
        if (text && text.length > 5) lines.push('- ' + text);
      } else if (tag === 'li' && node.parentElement?.tagName?.toLowerCase() === 'ol') {
        const text = node.textContent?.trim();
        if (text && text.length > 5) lines.push('1. ' + text);
      }

      node = walker.nextNode();
    }
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  });
}

function splitBySections(text) {
  const lines = text.split('\n');
  const sections = [];
  let current = [];
  for (const line of lines) {
    if (/^#{1,4}\s/.test(line) && current.length > 0) {
      sections.push(current.join('\n').trim());
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) sections.push(current.join('\n').trim());
  return sections;
}

async function sendContentMessageWithRetry(serviceWorker, targetUrl, message) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const response = await serviceWorker.evaluate(
      async ({ url, nextMessage }) => {
        const tabs = await chrome.tabs.query({});
        const targetTab = tabs.find((tab) => tab.url === url);
        if (!targetTab?.id) return { ok: false, retry: true, message: 'Tab not found.' };
        try {
          return await chrome.tabs.sendMessage(targetTab.id, nextMessage);
        } catch (error) {
          const text = error instanceof Error ? error.message : String(error);
          return {
            ok: false,
            retry: text.includes('Receiving end does not exist') || text.includes('Could not establish connection'),
            message: text,
          };
        }
      },
      { url: targetUrl, nextMessage: message },
    );
    if (response?.retry) {
      await delay(250);
      continue;
    }
    return response;
  }
  throw new Error('Content script did not become ready in time.');
}

async function scrollUntilTranslated(page, serviceWorker, targetUrl) {
  const timeoutAt = Date.now() + 10 * 60_000;
  let lastProgressKey = '';
  let lastProgressAt = Date.now();

  while (Date.now() < timeoutAt) {
    const state = await sendContentMessageWithRetry(serviceWorker, targetUrl, {
      type: 'GET_SESSION_SNAPSHOT',
    });
    if (!state?.ok) { await delay(500); continue; }

    const snapshot = state.snapshot;
    if (snapshot?.status === 'failed') throw new Error(snapshot.lastError || 'Translation failed.');
    if (snapshot?.status === 'completed' || snapshot?.status === 'completed_with_warnings') {
      console.log(`  Progress: ${snapshot.progressPercent}% - ${snapshot.status}`);
      return snapshot;
    }

    const progressKey = `${snapshot?.status}:${snapshot?.progressPercent}`;
    if (progressKey !== lastProgressKey) {
      if (snapshot?.progressPercent % 10 === 0 || snapshot?.progressPercent > 90) {
        console.log(`  Progress: ${snapshot?.progressPercent}% - ${snapshot?.status}`);
      }
      lastProgressKey = progressKey;
      lastProgressAt = Date.now();
    }

    const scrollMetrics = await page.evaluate(() => ({
      scrollTop: window.scrollY,
      viewportHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    }));

    const isNearBottom = scrollMetrics.scrollTop + scrollMetrics.viewportHeight >= scrollMetrics.scrollHeight - 48;
    if (!isNearBottom) {
      await page.evaluate((vh) => {
        window.scrollBy({ top: Math.max(320, Math.floor(vh * 0.82)), behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      }, scrollMetrics.viewportHeight);
    }

    if (Date.now() - lastProgressAt > 180_000) {
      throw new Error(`Translation stalled at ${snapshot?.progressPercent}%`);
    }

    await delay(650);
  }
  throw new Error('Timed out waiting for translation.');
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
