import { expect, test, chromium, type BrowserContext, type Page, type Worker } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { startFixtureServer, type FixtureServer } from './fixture-server';

const API_KEY = process.env.E2E_OPENROUTER_API_KEY ?? '';
const TEST_MODEL = process.env.E2E_TRANSLATION_MODEL ?? 'google/gemini-3.1-flash-lite-preview';
const SHOULD_RUN_LIVE = process.env.RUN_LIVE_E2E === '1';

const liveTest = SHOULD_RUN_LIVE && API_KEY ? test : test.skip;

let fixtureServer: FixtureServer;

test.beforeAll(async () => {
  fixtureServer = await startFixtureServer();
});

test.afterAll(async () => {
  await fixtureServer.close();
});

liveTest('translates the Wikipedia-derived math fixture while preserving formulas and diagram markup', async () => {
  const extensionPath = resolve(process.cwd(), 'dist');
  const userDataDir = await mkdtemp(join(tmpdir(), 'ai-web-translator-e2e-'));

  let context: BrowserContext | null = null;

  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chromium',
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    const serviceWorker = await waitForExtensionServiceWorker(context);
    const page = await context.newPage();
    const targetUrl = `${fixtureServer.origin}/wikipedia-representation-theory.html`;

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');

    const beforeCounts = await collectCounts(page);

    const seededSettings = {
      provider: 'openrouter',
      apiKey: API_KEY,
      model: TEST_MODEL,
      targetLanguage: 'ja',
      style: 'source-like',
      translateFullPage: false,
      cacheEnabled: true,
    };
    await seedExtensionSettings(serviceWorker, seededSettings);

    const translationResponse = (await sendContentMessageWithRetry(serviceWorker, targetUrl, {
      type: 'START_TRANSLATION',
      settings: seededSettings,
      scope: seededSettings.translateFullPage ? 'page' : 'main',
    })) as { ok?: boolean; message?: string };

    expect(translationResponse?.ok).toBe(true);

    await expect(page.locator('#linear-representation')).toContainText(/[ぁ-んァ-ン一-龯]/);
    await expect(page.locator('#diagram-paragraph')).toContainText('図式');

    const afterCounts = await collectCounts(page);
    expect(afterCounts.mathElements).toBe(beforeCounts.mathElements);
    expect(afterCounts.fallbackImages).toBe(beforeCounts.fallbackImages);
    expect(afterCounts.diagramImages).toBe(beforeCounts.diagramImages);

    await expect(page.locator('#cases-block img')).toHaveAttribute(
      'alt',
      /\\begin\{cases\}/,
    );
    await expect(page.locator('#matrix-block img')).toHaveAttribute(
      'alt',
      /\\begin\{pmatrix\}/,
    );
    await expect(page.locator('#diagram-paragraph img.mw-file-element')).toHaveAttribute(
      'src',
      /Equivariant_map\.svg/,
    );
    await expect(
      page.locator('#linear-representation a[title="General linear group"]'),
    ).toBeVisible();
    await expect(page.locator('#diagram-tail a[title="Equivariant map"]')).toBeVisible();
  } finally {
    await context?.close();
    await rm(userDataDir, { recursive: true, force: true });
  }
});

async function waitForExtensionServiceWorker(context: BrowserContext): Promise<Worker> {
  const existing = context.serviceWorkers();
  if (existing.length > 0) {
    return existing[0];
  }

  return context.waitForEvent('serviceworker');
}

async function sendContentMessageWithRetry(
  serviceWorker: Worker,
  targetUrl: string,
  message: Record<string, unknown> & { type: string },
): Promise<unknown> {
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

    if (
      response &&
      typeof response === 'object' &&
      'retry' in response &&
      (response as { retry?: boolean }).retry
    ) {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
      continue;
    }

    return response;
  }

  throw new Error('Content script did not become ready in time.');
}

async function collectCounts(page: Page): Promise<{
  mathElements: number;
  fallbackImages: number;
  diagramImages: number;
}> {
  return page.evaluate(() => ({
    mathElements: document.querySelectorAll('.mwe-math-element').length,
    fallbackImages: document.querySelectorAll('.mwe-math-fallback-image-inline').length,
    diagramImages: document.querySelectorAll('#diagram-paragraph img.mw-file-element').length,
  }));
}

async function seedExtensionSettings(
  serviceWorker: Worker,
  settings: {
    provider: string;
    apiKey: string;
    model: string;
    targetLanguage: string;
    style: string;
    translateFullPage: boolean;
    cacheEnabled: boolean;
  },
): Promise<void> {
  await serviceWorker.evaluate(async (nextSettings) => {
    await chrome.storage.local.set({
      settings_v2: nextSettings,
    });
  }, settings);
}
