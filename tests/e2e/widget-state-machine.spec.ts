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

test('keeps the widget resting during lazy wait, switches to working on scroll, then settles back to resting after done', async () => {
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
      const payload = route.request().postDataJSON() as {
        messages?: Array<{ role?: string; content?: string }>;
      };
      const fragments = JSON.parse(
        payload.messages?.find((message) => message.role === 'user')?.content || '[]',
      ) as string[];

      if (fragments[0] === 'Below the fold.') {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 900));
      }

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
    const page = await context.newPage();
    const targetUrl = `${fixtureServer.origin}/lazy-widget.html`;

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');

    await seedExtensionSettings(serviceWorker, {
      provider: 'openrouter',
      apiKey: 'test-key',
      model: 'google/gemini-3.1-flash-lite-preview',
      targetLanguage: 'ja',
      style: 'auto',
      translateFullPage: false,
      cacheEnabled: true,
    });

    const response = (await sendContentMessageWithRetry(serviceWorker, targetUrl, {
      type: 'START_TRANSLATION',
      settings: {
        provider: 'openrouter',
        apiKey: 'test-key',
        model: 'google/gemini-3.1-flash-lite-preview',
        targetLanguage: 'ja',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
      scope: 'main',
    })) as { ok?: boolean; message?: string };

    expect(response.ok).toBe(true);
    await expect(page.locator('#visible')).toContainText('[ja]');
    await expectWidgetState(page, 'resting');

    await page.locator('#below').scrollIntoViewIfNeeded();
    await expectWidgetState(page, 'working');
    await expect(page.locator('#below')).toContainText('[ja]');
    await expectWidgetState(page, 'done');
    await expectWidgetState(page, 'resting');
  } finally {
    await context?.close();
    await rm(userDataDir, { recursive: true, force: true });
  }
});

async function expectWidgetState(page: Page, state: string): Promise<void> {
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const host = document.querySelector(
          '[data-ai-web-translator-widget="true"]',
        ) as HTMLDivElement | null;
        return host?.dataset.widgetState ?? null;
      });
    })
    .toBe(state);
}

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
