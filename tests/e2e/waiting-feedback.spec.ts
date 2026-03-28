import { expect, test, chromium, type BrowserContext, type Page, type Worker } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { startFixtureServer, type FixtureServer } from './fixture-server';

let fixtureServer: FixtureServer;

test.beforeAll(async () => {
  fixtureServer = await startFixtureServer();
});

test.afterAll(async () => {
  await fixtureServer.close();
});

test('shows a waiting notice before a slow provider response eventually completes', async () => {
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

    await context.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 6500));
      const payload = route.request().postDataJSON() as {
        messages?: Array<{ role?: string; content?: string }>;
      };
      const fragments = JSON.parse(
        payload.messages?.find((message) => message.role === 'user')?.content || '[]',
      ) as string[];

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  translations: fragments.map((fragment) => `${fragment} [ja]`),
                }),
              },
            },
          ],
        }),
      });
    });

    const serviceWorker = await waitForExtensionServiceWorker(context);
    await seedExtensionSettings(serviceWorker, {
      provider: 'openrouter',
      apiKey: 'test-key',
      model: 'google/gemini-3.1-flash-lite-preview',
      targetLanguage: 'ja',
      style: 'auto',
      translateFullPage: false,
      cacheEnabled: true,
    });

    const page = await context.newPage();
    const targetUrl = `${fixtureServer.origin}/waiting-widget.html`;

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');

    await expect.poll(() => getWidgetState(page)).toBe('off');

    await page.evaluate(() => {
      const host = document.querySelector(
        '[data-ai-web-translator-widget="true"]',
      ) as HTMLDivElement | null;
      const mascot = host?.shadowRoot?.querySelector('.mascot') as HTMLDivElement | null;
      mascot?.click();
    });

    await expect.poll(() => getBubbleText(page)).toContain('日本語で読みますか');
    const promptBubbleBox = await getBubbleBox(page);
    expect(promptBubbleBox).not.toBeNull();
    expect(promptBubbleBox?.width ?? 0).toBeGreaterThan(150);
    expect(promptBubbleBox?.height ?? 0).toBeLessThan(90);

    await page.evaluate(() => {
      const host = document.querySelector(
        '[data-ai-web-translator-widget="true"]',
      ) as HTMLDivElement | null;
      const mascot = host?.shadowRoot?.querySelector('.mascot') as HTMLDivElement | null;
      mascot?.click();
    });

    await expect.poll(() => getBubbleText(page)).toContain('AI の応答を待っています');
    await expect(page.locator('#waiting-paragraph')).toContainText('[ja]');
    await expect
      .poll(async () => {
        const state = await getWidgetState(page);
        return state === 'error' ? 'error' : state === 'working' ? 'working' : 'settled';
      })
      .toBe('settled');
  } finally {
    await context?.close();
    await rm(userDataDir, { recursive: true, force: true });
  }
});

async function getBubbleText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const host = document.querySelector(
      '[data-ai-web-translator-widget="true"]',
    ) as HTMLDivElement | null;
    const bubbleText = host?.shadowRoot?.querySelector('.bubble-text');
    return bubbleText?.textContent?.trim() ?? '';
  });
}

async function getBubbleBox(
  page: Page,
): Promise<{ width: number; height: number } | null> {
  return page.evaluate(() => {
    const host = document.querySelector(
      '[data-ai-web-translator-widget="true"]',
    ) as HTMLDivElement | null;
    const bubble = host?.shadowRoot?.querySelector('.bubble') as HTMLDivElement | null;
    if (!bubble) {
      return null;
    }

    const rect = bubble.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
    };
  });
}

async function getWidgetState(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const host = document.querySelector(
      '[data-ai-web-translator-widget="true"]',
    ) as HTMLDivElement | null;
    return host?.dataset.widgetState ?? null;
  });
}

async function waitForExtensionServiceWorker(context: BrowserContext): Promise<Worker> {
  const existing = context.serviceWorkers();
  if (existing.length > 0) {
    return existing[0];
  }

  return context.waitForEvent('serviceworker');
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
