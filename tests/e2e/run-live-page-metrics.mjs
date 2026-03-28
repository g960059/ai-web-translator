import dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

dotenv.config();

const apiKey = process.env.E2E_OPENROUTER_API_KEY;
const modelId = process.env.E2E_TRANSLATION_MODEL || 'google/gemini-3.1-flash-lite-preview';
const outputSuffix = process.env.E2E_OUTPUT_SUFFIX?.trim();
const targetUrl = process.argv[2];

if (!apiKey) {
  throw new Error('Missing E2E_OPENROUTER_API_KEY.');
}

if (!targetUrl) {
  throw new Error('Usage: node tests/e2e/run-live-page-metrics.mjs <url>');
}

const extensionPath = resolve(process.cwd(), 'dist');
const userDataDir = await mkdtemp(join(tmpdir(), 'ai-web-translator-live-page-'));
const outputDir = resolve(process.cwd(), 'test-results');
await mkdir(outputDir, { recursive: true });

const targetSlug = toFileSlug(targetUrl);
const outputSlugSuffix = outputSuffix ? `-${toFileSlug(outputSuffix)}` : '';
const screenshotPath = resolve(outputDir, `${targetSlug}${outputSlugSuffix}-translated.png`);
const metricsPath = resolve(outputDir, `${targetSlug}${outputSlugSuffix}-metrics.json`);

const requests = [];
let context = null;
let closing = false;
let inFlightRequests = 0;
let peakInFlightRequests = 0;
let partialMetrics = {
  lastState: null,
  lastScrollMetrics: null,
  failure: null,
};

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
    const startedAt = Date.now();
    inFlightRequests += 1;
    peakInFlightRequests = Math.max(peakInFlightRequests, inFlightRequests);
    try {
      const requestJson = route.request().postDataJSON();
      const response = await route.fetch({ timeout: 180_000 });
      const payload = await response.json();
      requests.push({
        startedAt,
        finishedAt: Date.now(),
        request: requestJson,
        response: payload,
      });
      await route.fulfill({
        response,
        json: payload,
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      if (closing && text.includes('Target page, context or browser has been closed')) {
        return;
      }
      throw error;
    } finally {
      inFlightRequests = Math.max(0, inFlightRequests - 1);
    }
  });

  const serviceWorker =
    context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  const page = await context.newPage();

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForTimeout(2_500);
  const beforeQuality = await collectPageQuality(page);

  const seededSettings = {
    provider: 'openrouter',
    apiKey,
    model: modelId,
    targetLanguage: 'ja',
    style: 'auto',
    translateFullPage: true,
    cacheEnabled: false,
  };

  await serviceWorker.evaluate(async (nextSettings) => {
    await chrome.storage.local.set({
      settings_v2: nextSettings,
    });
  }, seededSettings);

  const startedAt = Date.now();
  const translationResponse = await sendContentMessageWithRetry(serviceWorker, targetUrl, {
    type: 'START_TRANSLATION',
    settings: seededSettings,
    scope: 'page',
  });

  if (!translationResponse?.ok) {
    throw new Error(`Translation failed to start: ${JSON.stringify(translationResponse)}`);
  }

  await page.waitForFunction(() => {
    const root =
      document.querySelector('main, article, [role="main"], #mw-content-text, .mw-parser-output') ??
      document.body;
    return /[ぁ-んァ-ン一-龯]/.test(root.textContent || '');
  }, { timeout: 180_000 });

  const firstVisibleTranslatedAt = Date.now();

  const finalState = await scrollUntilTranslated(page, serviceWorker, targetUrl);
  partialMetrics.lastState = finalState;
  const completedAt = Date.now();

  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(1_000);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  const promptTokens = requests.reduce(
    (sum, entry) => sum + Number(entry.response?.usage?.prompt_tokens || 0),
    0,
  );
  const completionTokens = requests.reduce(
    (sum, entry) => sum + Number(entry.response?.usage?.completion_tokens || 0),
    0,
  );
  const pricing = await fetchModelPricing(modelId);
  const estimatedCostUsd = calculateCost(pricing, promptTokens, completionTokens);
  const afterQuality = await collectPageQuality(page);
  const runtimeMetrics = finalState?.metrics ?? null;
  const metrics = {
    targetUrl,
    modelId,
    outputSuffix: outputSuffix || null,
    requestCount: requests.length,
    elapsedMs: {
      toFirstVisibleTranslation: firstVisibleTranslatedAt - startedAt,
      toFullCompletion: completedAt - startedAt,
    },
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    concurrency: {
      peakInFlightRequests,
    },
    phaseTimings: runtimeMetrics?.phaseTimings ?? null,
    retryCounts: runtimeMetrics?.retryCounts ?? null,
    cacheStats: runtimeMetrics?.cacheStats ?? null,
    requestCountsByPhase: runtimeMetrics?.requestCountsByPhase ?? null,
    costUsd: estimatedCostUsd,
    pageQuality: {
      before: beforeQuality,
      after: afterQuality,
    },
    finalState,
    screenshotPath,
    startedAt: new Date(startedAt).toISOString(),
    generatedAt: new Date().toISOString(),
  };

  await writeFile(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(metrics, null, 2));
} catch (error) {
  partialMetrics.failure = serializeError(error);
  partialMetrics.requestCount = requests.length;
  partialMetrics.usage = {
    promptTokens: requests.reduce(
      (sum, entry) => sum + Number(entry.response?.usage?.prompt_tokens || 0),
      0,
    ),
    completionTokens: requests.reduce(
      (sum, entry) => sum + Number(entry.response?.usage?.completion_tokens || 0),
      0,
    ),
  };
  partialMetrics.concurrency = {
    peakInFlightRequests,
  };
  await writeFile(metricsPath, `${JSON.stringify(partialMetrics, null, 2)}\n`, 'utf8');
  throw error;
} finally {
  closing = true;
  try {
    await context?.unrouteAll?.({ behavior: 'ignoreErrors' });
  } catch {}
  await context?.close();
  await rm(userDataDir, { recursive: true, force: true });
}

async function sendContentMessageWithRetry(serviceWorker, targetUrl, message) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
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
      await delay(250);
      continue;
    }

    return response;
  }

  throw new Error('Content script did not become ready in time.');
}

async function scrollUntilTranslated(page, serviceWorker, targetUrl) {
  const timeoutAt = Date.now() + 15 * 60_000;
  let lastProgressKey = '';
  let lastProgressAt = Date.now();

  while (Date.now() < timeoutAt) {
    const state = await sendContentMessageWithRetry(serviceWorker, targetUrl, {
      type: 'GET_SESSION_SNAPSHOT',
    });
    if (!state?.ok) {
      await delay(500);
      continue;
    }

    const snapshot = state.snapshot;
    partialMetrics.lastState = snapshot ?? null;
    if (snapshot?.status === 'failed') {
      throw new Error(snapshot.lastError || 'Full-page translation failed.');
    }

    if (snapshot?.status === 'completed') {
      return snapshot;
    }

    const scrollMetrics = await page.evaluate(() => ({
      scrollTop: window.scrollY,
      viewportHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    partialMetrics.lastScrollMetrics = scrollMetrics;

    const progressKey = [
      snapshot?.status || 'unknown',
      snapshot?.progressPercent || 0,
      scrollMetrics.scrollTop,
      scrollMetrics.scrollHeight,
    ].join(':');

    if (progressKey !== lastProgressKey) {
      lastProgressKey = progressKey;
      lastProgressAt = Date.now();
    }

    const isNearBottom =
      scrollMetrics.scrollTop + scrollMetrics.viewportHeight >= scrollMetrics.scrollHeight - 48;

    if (!isNearBottom) {
      await page.evaluate((viewportHeight) => {
        window.scrollBy({
          top: Math.max(320, Math.floor(viewportHeight * 0.82)),
          left: 0,
          behavior: 'instant',
        });
        window.dispatchEvent(new Event('scroll'));
      }, scrollMetrics.viewportHeight);
    } else if (Date.now() - lastProgressAt > 4_000) {
      await page.evaluate(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      });
    }

    if (Date.now() - lastProgressAt > 45_000) {
      throw new Error(
        `Translation stalled. status=${snapshot?.status ?? 'unknown'} progress=${snapshot?.progressPercent ?? 0}`,
      );
    }

    await delay(650);
  }

  throw new Error('Timed out waiting for full-page translation to complete.');
}

async function fetchModelPricing(modelId) {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) {
    return null;
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

async function collectPageQuality(page) {
  return page.evaluate(() => {
    const root =
      document.querySelector('.mw-parser-output, #mw-content-text, article, main, [role="main"]') ??
      document.body;

    const normalize = (text) => text.replace(/\s+/g, ' ').trim();
    const paragraphs = Array.from(root.querySelectorAll('p'))
      .map((element) => normalize(element.textContent || ''))
      .filter((text) => text.length >= 40)
      .slice(0, 4);

    return {
      title: document.title,
      mathElements: root.querySelectorAll('.mwe-math-element').length,
      fallbackImages: root.querySelectorAll('.mwe-math-fallback-image-inline').length,
      mediaImages: root.querySelectorAll('img.mw-file-element').length,
      sampleParagraphs: paragraphs,
    };
  });
}

function calculateCost(pricing, promptTokens, completionTokens) {
  if (!pricing) {
    return null;
  }

  return promptTokens * pricing.prompt + completionTokens * pricing.completion;
}

function toFileSlug(input) {
  try {
    const url = new URL(input);
    const pathPart = basename(url.pathname) || 'page';
    return `${url.hostname}-${pathPart}`
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  } catch {
    return input.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  }
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function serializeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}
