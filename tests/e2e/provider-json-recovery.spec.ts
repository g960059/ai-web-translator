import { expect, test, chromium, type BrowserContext, type ConsoleMessage, type Worker } from '@playwright/test';
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

test('recovers when the provider returns valid JSON followed by trailing text', async () => {
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

    const consoleMessages: ConsoleMessage[] = [];
    context.on('console', (message) => {
      consoleMessages.push(message);
    });

    await context.route('https://openrouter.ai/api/v1/chat/completions', async (route) => {
      const payload = route.request().postDataJSON() as {
        messages?: Array<{ role?: string; content?: string }>;
      };
      const fragments = JSON.parse(payload.messages?.find((message) => message.role === 'user')?.content || '[]') as string[];
      const translations = fragments.map((fragment) =>
        fragment.includes('<') ? `${fragment}<span data-e2e-ja="1">訳</span>` : `${fragment} 訳`,
      );

      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [
            {
              message: {
                content: `${JSON.stringify({ translations })}\nThe JSON payload is above.`,
              },
            },
          ],
          usage: {
            prompt_tokens: 120,
            completion_tokens: 80,
            total_tokens: 200,
          },
        }),
      });
    });

    const serviceWorker = await waitForExtensionServiceWorker(context);
    const page = await context.newPage();
    const targetUrl = `${fixtureServer.origin}/wikipedia-representation-theory.html`;

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('networkidle');

    const seededSettings = {
      provider: 'openrouter',
      apiKey: 'test-key',
      model: 'google/gemini-3.1-flash-lite-preview',
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
    await expect(page.locator('body')).toContainText('訳');

    const consoleText = consoleMessages.map((message) => message.text());
    expect(
      consoleText.filter(
        (message) =>
          message.includes('Unexpected non-whitespace character after JSON') ||
          message.includes('Cannot find menu item with id') ||
          message.includes('duplicate id') ||
          message.includes('runtime.lastError'),
      ),
    ).toEqual([]);
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
