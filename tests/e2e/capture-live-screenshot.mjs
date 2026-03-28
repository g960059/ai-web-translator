import dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

dotenv.config();

const apiKey = process.env.E2E_OPENROUTER_API_KEY;
const model = process.env.E2E_TRANSLATION_MODEL || 'google/gemini-3.1-flash-lite-preview';

if (!apiKey) {
  throw new Error('Missing E2E_OPENROUTER_API_KEY.');
}

const fixturePath = resolve(
  process.cwd(),
  'tests/fixtures/wikipedia-representation-theory.html',
);
const fixtureHtml = await readFile(fixturePath, 'utf8');
const screenshotDir = resolve(process.cwd(), 'test-results');
await mkdir(screenshotDir, { recursive: true });
const screenshotPath = resolve(screenshotDir, 'live-translation-after.png');

const server = createServer((request, response) => {
  if (request.url === '/wikipedia-representation-theory.html') {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    response.end(fixtureHtml);
    return;
  }

  response.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  response.end('Not found');
});

await new Promise((resolveStart) => {
  server.listen(0, '127.0.0.1', () => resolveStart());
});

const address = server.address();
if (!address || typeof address === 'string') {
  throw new Error('Failed to start screenshot server.');
}

const targetUrl = `http://127.0.0.1:${address.port}/wikipedia-representation-theory.html`;
const extensionPath = resolve(process.cwd(), 'dist');
const userDataDir = await mkdtemp(join(tmpdir(), 'ai-web-translator-shot-'));

let context = null;

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

  const serviceWorker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  const page = await context.newPage();

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  const seededSettings = {
    provider: 'openrouter',
    apiKey,
    model,
    targetLanguage: 'ja',
    style: 'source-like',
    translateFullPage: false,
    cacheEnabled: true,
  };

  await serviceWorker.evaluate(async (nextSettings) => {
    await chrome.storage.local.set({
      settings_v2: nextSettings,
    });
  }, seededSettings);

  const translationResponse = await sendContentMessageWithRetry(serviceWorker, targetUrl, {
    type: 'START_TRANSLATION',
    settings: seededSettings,
    scope: seededSettings.translateFullPage ? 'page' : 'main',
  });

  if (!translationResponse?.ok) {
    throw new Error(
      `Translation failed while capturing screenshot: ${JSON.stringify(translationResponse)}`,
    );
  }

  await page.waitForFunction(() => {
    const text = document.querySelector('#linear-representation')?.textContent || '';
    return /[ぁ-んァ-ン一-龯]/.test(text);
  }, { timeout: 45_000 });

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  console.log(screenshotPath);
} finally {
  await context?.close();
  await rm(userDataDir, { recursive: true, force: true });
  await new Promise((resolveClose) => {
    server.close(() => resolveClose());
  });
}

async function sendContentMessageWithRetry(serviceWorker, targetUrl, message) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await serviceWorker.evaluate(
      async ({ url, nextMessage }) => {
        const tabs = await chrome.tabs.query({});
        const targetTab = tabs.find((tab) => tab.url === url);
        if (!targetTab?.id) {
          return {
            ok: false,
            retry: true,
            message: 'Target tab not found yet.',
          };
        }

        try {
          return await chrome.tabs.sendMessage(targetTab.id, nextMessage);
        } catch (error) {
          const text = error instanceof Error ? error.message : String(error);
          return {
            ok: false,
            retry:
              text.includes('Receiving end does not exist') ||
              text.includes('Could not establish connection'),
            message: text,
          };
        }
      },
      { url: targetUrl, nextMessage: message },
    );

    if (response?.retry) {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
      continue;
    }

    return response;
  }

  throw new Error('Content script did not become ready in time.');
}
