import dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

dotenv.config();

const apiKey = process.env.E2E_OPENROUTER_API_KEY;
const modelId = process.env.E2E_TRANSLATION_MODEL || 'google/gemini-3.1-flash-lite-preview';

if (!apiKey) {
  throw new Error('Missing E2E_OPENROUTER_API_KEY.');
}

const fixturePath = resolve(
  process.cwd(),
  'tests/fixtures/wikipedia-representation-theory.html',
);
const fixtureHtml = await readFile(fixturePath, 'utf8');

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
  throw new Error('Failed to start estimate server.');
}

const targetUrl = `http://127.0.0.1:${address.port}/wikipedia-representation-theory.html`;
const extensionPath = resolve(process.cwd(), 'dist');
const userDataDir = await mkdtemp(join(tmpdir(), 'ai-web-translator-estimate-'));
const requests = [];
const seededSettings = {
  provider: 'openrouter',
  apiKey,
  model: modelId,
  targetLanguage: 'ja',
  style: 'source-like',
  translateFullPage: false,
  cacheEnabled: false,
};

let context = null;

try {
  context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  await context.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
    const requestJson = route.request().postDataJSON();
    const response = await route.fetch();
    const payload = await response.json();
    requests.push({
      request: requestJson,
      response: payload,
    });
    await route.fulfill({
      response,
      json: payload,
    });
  });

  const serviceWorker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  await serviceWorker.evaluate(async (nextSettings) => {
    await chrome.storage.local.set({
      settings_v2: nextSettings,
    });
  }, seededSettings);

  const analysis = await sendContentMessageWithRetry(serviceWorker, targetUrl, {
    type: 'GET_PAGE_ANALYSIS',
    settings: seededSettings,
    scope: seededSettings.translateFullPage ? 'page' : 'main',
  });

  const translateResponse = await sendContentMessageWithRetry(serviceWorker, targetUrl, {
    type: 'START_TRANSLATION',
    settings: seededSettings,
    scope: seededSettings.translateFullPage ? 'page' : 'main',
  });

  if (!translateResponse?.ok) {
    throw new Error(`Translation failed: ${JSON.stringify(translateResponse)}`);
  }

  await page.waitForFunction(() => {
    const text = document.querySelector('#linear-representation')?.textContent || '';
    return /[ぁ-んァ-ン一-龯]/.test(text);
  }, { timeout: 45_000 });

  const actualPromptTokens = requests.reduce(
    (sum, entry) => sum + Number(entry.response?.usage?.prompt_tokens || 0),
    0,
  );
  const actualCompletionTokens = requests.reduce(
    (sum, entry) => sum + Number(entry.response?.usage?.completion_tokens || 0),
    0,
  );
  const modelPricing = await fetchModelPricing(modelId);
  const estimatedCost = calculateCost(
    modelPricing,
    analysis?.analysis?.estimatedInputTokens || 0,
    analysis?.analysis?.estimatedOutputTokens || 0,
  );
  const actualCost = calculateCost(modelPricing, actualPromptTokens, actualCompletionTokens);

  console.log(
    JSON.stringify(
      {
        modelId,
        requestCount: requests.length,
        analysis,
        actualUsage: {
          promptTokens: actualPromptTokens,
          completionTokens: actualCompletionTokens,
        },
        estimatedCostUsd: estimatedCost,
        actualCostUsd: actualCost,
        promptErrorPercent: percentageDelta(
          analysis?.analysis?.estimatedInputTokens || 0,
          actualPromptTokens,
        ),
        completionErrorPercent: percentageDelta(
          analysis?.analysis?.estimatedOutputTokens || 0,
          actualCompletionTokens,
        ),
        costErrorPercent: percentageDelta(estimatedCost, actualCost),
      },
      null,
      2,
    ),
  );
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

async function fetchModelPricing(modelId) {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) {
    throw new Error(`Failed to fetch model pricing: ${response.status}`);
  }

  const payload = await response.json();
  const model = (payload.data || []).find((entry) => entry.id === modelId);
  if (!model?.pricing) {
    return null;
  }

  const prompt = Number.parseFloat(model.pricing.prompt);
  const completion = Number.parseFloat(model.pricing.completion);
  if (!Number.isFinite(prompt) || !Number.isFinite(completion)) {
    return null;
  }

  return { prompt, completion };
}

function calculateCost(pricing, promptTokens, completionTokens) {
  if (!pricing) {
    return null;
  }

  return promptTokens * pricing.prompt + completionTokens * pricing.completion;
}

function percentageDelta(estimated, actual) {
  if (!actual) {
    return null;
  }

  return ((estimated - actual) / actual) * 100;
}
