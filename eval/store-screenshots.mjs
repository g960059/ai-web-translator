/**
 * Generate Chrome Web Store screenshots using Playwright.
 * Captures: translated page with widget, popup UI, bilingual mode, math preserved.
 */
import { chromium } from 'playwright';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.E2E_OPENROUTER_API_KEY;
if (!API_KEY) throw new Error('Missing E2E_OPENROUTER_API_KEY');

const EXTENSION_PATH = resolve(process.cwd(), 'dist');
const OUT_DIR = resolve(process.cwd(), 'docs', 'store', 'screenshots');

const SETTINGS = {
  provider: 'openrouter',
  apiKey: API_KEY,
  model: 'google/gemini-3.1-flash-lite-preview',
  modelPreset: 'standard',
  targetLanguage: 'ja',
  style: 'auto',
  translateFullPage: true,
  cacheEnabled: true,
  showOriginalOnHover: true,
  customModelId: '',
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const userDataDir = await mkdtemp(join(tmpdir(), 'fibo-ss-'));

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-first-run',
      '--window-size=1440,900',
    ],
    viewport: { width: 1440, height: 900 },
  });

  const sw = await waitForServiceWorker(context);
  await sw.evaluate(async ({ settings }) => {
    await chrome.storage.local.set({ settings_v2: settings });
  }, { settings: SETTINGS });

  const page = await context.newPage();

  // --- Navigate and translate ---
  console.log('Navigating to Wikipedia...');
  await page.goto('https://en.wikipedia.org/wiki/Representation_theory_of_finite_groups', {
    waitUntil: 'networkidle', timeout: 30000,
  });
  await page.waitForTimeout(2000);

  console.log('Starting translation...');
  await sendContentMessage(sw, page.url(), {
    type: 'START_TRANSLATION', settings: SETTINGS, scope: 'page',
  });

  // Wait for visible blocks
  await waitForStatus(sw, page.url(), ['completed', 'completed_with_warnings', 'lazy'], 120000);
  await page.waitForTimeout(3000);

  // --- Screenshot 1: Translated page with widget visible ---
  console.log('Screenshot 1: Translated page with widget...');
  await page.screenshot({
    path: join(OUT_DIR, '01-translated-with-widget.png'),
    fullPage: false,
  });

  // --- Screenshot 2: Math section preserved ---
  console.log('Screenshot 2: Math formulas preserved...');
  await page.evaluate(() => {
    // Scroll to definitions section with math
    const h2s = document.querySelectorAll('h2');
    for (const h2 of h2s) {
      if (h2.textContent?.includes('線形表現') || h2.textContent?.includes('Linear') || h2.textContent?.includes('定義')) {
        h2.scrollIntoView({ behavior: 'instant', block: 'start' });
        return;
      }
    }
    // Fallback: scroll down a bit
    window.scrollBy(0, 600);
  });
  await page.waitForTimeout(5000); // Wait for lazy blocks to translate
  await page.screenshot({
    path: join(OUT_DIR, '02-math-preserved.png'),
    fullPage: false,
  });

  // --- Screenshot 3: Bilingual mode ---
  console.log('Screenshot 3: Bilingual mode...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await sendContentMessage(sw, page.url(), { type: 'SET_DISPLAY_MODE', mode: 'bilingual' });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: join(OUT_DIR, '03-bilingual-mode.png'),
    fullPage: false,
  });

  // Switch back to translated
  await sendContentMessage(sw, page.url(), { type: 'SET_DISPLAY_MODE', mode: 'translated' });
  await page.waitForTimeout(1000);

  // --- Screenshot 4: Popup UI (ready state on a different page) ---
  console.log('Screenshot 4: Popup UI...');
  // Open a new page that hasn't been translated yet
  const page2 = await context.newPage();
  await page2.goto('https://en.wikipedia.org/wiki/Representation_theory', {
    waitUntil: 'networkidle', timeout: 30000,
  });
  await page2.waitForTimeout(2000);

  // Get the extension ID
  const extensionId = await sw.evaluate(() => chrome.runtime.id);
  const popupUrl = `chrome-extension://${extensionId}/src/popup/index.html`;

  // Open popup as a page to screenshot it
  const popupPage = await context.newPage();
  await popupPage.goto(popupUrl, { waitUntil: 'networkidle', timeout: 10000 });
  await popupPage.waitForTimeout(2000);
  await popupPage.setViewportSize({ width: 400, height: 600 });
  await popupPage.screenshot({
    path: join(OUT_DIR, '04-popup-ready.png'),
    fullPage: true,
  });
  await popupPage.close();

  // --- Screenshot 5: Translated second page ---
  console.log('Screenshot 5: Second page translated...');
  await sendContentMessage(sw, page2.url(), {
    type: 'START_TRANSLATION', settings: SETTINGS, scope: 'page',
  });
  await waitForStatus(sw, page2.url(), ['completed', 'completed_with_warnings', 'lazy'], 120000);
  await page2.waitForTimeout(3000);
  await page2.screenshot({
    path: join(OUT_DIR, '05-rep-theory-translated.png'),
    fullPage: false,
  });

  console.log(`\n✅ Screenshots saved to ${OUT_DIR}`);
  console.log('Files:');
  console.log('  01-translated-with-widget.png — Translated page with widget');
  console.log('  02-math-preserved.png — Math formulas preserved after translation');
  console.log('  03-bilingual-mode.png — Bilingual (対訳) display mode');
  console.log('  04-popup-ready.png — Popup UI (ready state)');
  console.log('  05-rep-theory-translated.png — Second page translated');

  await context.close();
  await rm(userDataDir, { recursive: true, force: true });
}

// --- Helpers ---
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
      try { return await chrome.tabs.sendMessage(tab.id, msg); }
      catch (e) { return { ok: false, retry: true, message: String(e) }; }
    }, { url: targetUrl, msg: message });
    if (response?.retry) { await new Promise(r => setTimeout(r, 500)); continue; }
    return response;
  }
  throw new Error('Content script not ready');
}

async function waitForStatus(sw, targetUrl, targetStatuses, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const snapshot = await sw.evaluate(async ({ url }) => {
      const tabs = await chrome.tabs.query({});
      const tab = tabs.find(t => t.url === url);
      if (!tab?.id) return null;
      try { return await chrome.tabs.sendMessage(tab.id, { type: 'GET_SESSION_SNAPSHOT' }); } catch { return null; }
    }, { url: targetUrl });
    const status = snapshot?.snapshot?.status;
    if (status && targetStatuses.includes(status)) {
      console.log(`  Status: ${status} (${((Date.now() - start) / 1000).toFixed(0)}s)`);
      return status;
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log('  Timeout waiting for status');
  return null;
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
