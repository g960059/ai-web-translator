import dotenv from 'dotenv';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

dotenv.config();

const apiKey = process.env.E2E_OPENROUTER_API_KEY;
const modelIds = process.argv.slice(2).filter(Boolean);

if (!apiKey) {
  throw new Error('Missing E2E_OPENROUTER_API_KEY.');
}

const models = modelIds.length > 0
  ? modelIds
  : [
      'google/gemini-3.1-flash-lite-preview',
      'deepseek/deepseek-chat-v3.1',
      'mistralai/mistral-small-2603',
      'qwen/qwen3.5-35b-a3b',
      'qwen/qwen3.5-flash-02-23',
    ];

const extensionPath = resolve(process.cwd(), 'dist');
const outputDir = resolve(process.cwd(), 'test-results', 'model-evals');
await mkdir(outputDir, { recursive: true });

const fixtureServer = await startFixtureServer();
const targetUrl = `${fixtureServer.origin}/wikipedia-representation-theory.html`;

const summary = {
  scenarioId: 'wikipedia-representation-theory-fixture-main-ja',
  targetUrl,
  generatedAt: new Date().toISOString(),
  provider: 'openrouter',
  style: 'auto',
  scope: 'main',
  targetLanguage: 'ja',
  cacheEnabled: false,
  models: [],
};

try {
  for (const modelId of models) {
    const result = await runSingleModelEvaluation({
      apiKey,
      modelId,
      extensionPath,
      outputDir,
      targetUrl,
    });
    summary.models.push(result);
  }
} finally {
  await fixtureServer.close();
}

const summaryPath = resolve(outputDir, 'wikipedia-representation-theory-summary.json');
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(summary, null, 2));

async function runSingleModelEvaluation({
  apiKey,
  modelId,
  extensionPath,
  outputDir,
  targetUrl,
}) {
  const userDataDir = await mkdtemp(join(tmpdir(), 'ai-web-translator-model-eval-'));
  const requests = [];
  const startedAtIso = new Date().toISOString();
  const modelSlug = toFileSlug(modelId);
  const screenshotPath = resolve(outputDir, `${modelSlug}-translated.png`);
  const detailsPath = resolve(outputDir, `${modelSlug}.json`);

  let context = null;
  let closing = false;
  let inFlightRequests = 0;
  let peakInFlightRequests = 0;

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

    const beforeCounts = await collectCounts(page);
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
      await chrome.storage.local.set({
        settings_v2: nextSettings,
      });
    }, seededSettings);

    const startedAt = Date.now();
    const translationResponse = await sendContentMessageWithRetry(serviceWorker, targetUrl, {
      type: 'START_TRANSLATION',
      settings: seededSettings,
      scope: 'main',
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
    const finalState = await waitUntilCompleted(page, serviceWorker, targetUrl);
    const completedAt = Date.now();

    await page.evaluate(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const afterCounts = await collectCounts(page);
    const extracted = await extractFixtureDetails(page);
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

    const result = {
      modelId,
      startedAt: startedAtIso,
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
      pricing: pricing ?? null,
      estimatedCostUsd,
      finalState,
      preservation: {
        beforeCounts,
        afterCounts,
        mathElementsPreserved: beforeCounts.mathElements === afterCounts.mathElements,
        fallbackImagesPreserved: beforeCounts.fallbackImages === afterCounts.fallbackImages,
        diagramImagesPreserved: beforeCounts.diagramImages === afterCounts.diagramImages,
        casesAltPreserved: extracted.casesAlt.includes('\\begin{cases}'),
        matrixAltPreserved: extracted.matrixAlt.includes('\\begin{pmatrix}'),
        diagramImagePreserved: /Equivariant_map\.svg/.test(extracted.diagramImageSrc),
        generalLinearLinkPreserved: extracted.generalLinearLinkVisible,
        equivariantLinkPreserved: extracted.equivariantLinkVisible,
      },
      extracted,
      screenshotPath,
    };

    await writeFile(detailsPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    return result;
  } catch (error) {
    const failure = {
      modelId,
      startedAt: startedAtIso,
      requestCount: requests.length,
      usage: {
        promptTokens: requests.reduce(
          (sum, entry) => sum + Number(entry.response?.usage?.prompt_tokens || 0),
          0,
        ),
        completionTokens: requests.reduce(
          (sum, entry) => sum + Number(entry.response?.usage?.completion_tokens || 0),
          0,
        ),
      },
      concurrency: {
        peakInFlightRequests,
      },
      failure: serializeError(error),
    };
    await writeFile(detailsPath, `${JSON.stringify(failure, null, 2)}\n`, 'utf8');
    return failure;
  } finally {
    closing = true;
    try {
      await context?.unrouteAll?.({ behavior: 'ignoreErrors' });
    } catch {}
    await context?.close();
    await rm(userDataDir, { recursive: true, force: true });
  }
}

async function waitUntilCompleted(page, serviceWorker, targetUrl) {
  const timeoutAt = Date.now() + 10 * 60_000;
  while (Date.now() < timeoutAt) {
    const state = await sendContentMessageWithRetry(serviceWorker, targetUrl, {
      type: 'GET_SESSION_SNAPSHOT',
    });
    if (!state?.ok) {
      await delay(400);
      continue;
    }

    const snapshot = state.snapshot;
    if (snapshot?.status === 'failed') {
      throw new Error(snapshot.lastError || 'Translation failed.');
    }

    if (snapshot?.status === 'completed') {
      return snapshot;
    }

    await delay(400);
  }

  throw new Error('Timed out waiting for translation to complete.');
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

async function collectCounts(page) {
  return page.evaluate(() => ({
    mathElements: document.querySelectorAll('.mwe-math-element').length,
    fallbackImages: document.querySelectorAll('.mwe-math-fallback-image-inline').length,
    diagramImages: document.querySelectorAll('#diagram-paragraph img.mw-file-element').length,
  }));
}

async function extractFixtureDetails(page) {
  return page.evaluate(() => {
    const text = (selector) => document.querySelector(selector)?.textContent?.trim() || '';
    const attr = (selector, name) => document.querySelector(selector)?.getAttribute(name) || '';
    const isVisible = (selector) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) {
        return false;
      }
      return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    };

    return {
      linearRepresentation: text('#linear-representation'),
      casesLead: text('#cases-lead'),
      matrixLead: text('#matrix-lead'),
      diagramParagraph: text('#diagram-paragraph'),
      diagramTail: text('#diagram-tail'),
      casesAlt: attr('#cases-block img', 'alt'),
      matrixAlt: attr('#matrix-block img', 'alt'),
      diagramImageSrc: attr('#diagram-paragraph img.mw-file-element', 'src'),
      generalLinearLinkVisible: isVisible('#linear-representation a[title=\"General linear group\"]'),
      equivariantLinkVisible: isVisible('#diagram-tail a[title=\"Equivariant map\"]'),
    };
  });
}

async function fetchModelPricing(modelId) {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const model = Array.isArray(payload?.data)
    ? payload.data.find((entry) => entry.id === modelId)
    : null;
  if (!model?.pricing?.prompt || !model?.pricing?.completion) {
    return null;
  }

  return {
    prompt: Number(model.pricing.prompt),
    completion: Number(model.pricing.completion),
  };
}

function calculateCost(pricing, promptTokens, completionTokens) {
  if (!pricing) {
    return null;
  }

  return Number(
    (
      pricing.prompt * promptTokens +
      pricing.completion * completionTokens
    ).toFixed(6),
  );
}

function serializeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack || null,
    };
  }

  return {
    name: 'Error',
    message: String(error),
    stack: null,
  };
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function toFileSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function startFixtureServer() {
  const fixturePath = resolve(process.cwd(), 'tests/fixtures/wikipedia-representation-theory.html');
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
    throw new Error('Failed to start fixture server.');
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise((resolveClose, rejectClose) => {
        server.close((error) => {
          if (error) {
            rejectClose(error);
            return;
          }
          resolveClose();
        });
      });
    },
  };
}
