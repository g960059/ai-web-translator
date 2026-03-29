import { waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { TranslationController } from '../src/content/translation-controller';
import type { DebugBlocksResponse } from '../src/shared/messages';
import { saveSettings } from '../src/shared/settings';
import { emitIntersection, getChromeMock } from './setup';
import {
  createSettings,
  getWidgetHost,
  getWidgetShadowRoot,
  loadFixture,
  selectElementContents,
  setDocumentHtml,
} from './test-utils';

function setRect(element: HTMLElement, top: number, height = 24, width = 200): void {
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => ({
      x: 0,
      y: top,
      top,
      bottom: top + height,
      left: 0,
      right: width,
      width,
      height,
      toJSON: () => ({}),
    }),
    configurable: true,
  });
}

type DebugGroup = {
  contentMode: 'text' | 'html';
  preview: string;
  fragmentCount: number;
  skipWrapperRestore?: boolean;
  hasProtectedMarkers?: boolean;
};

describe('TranslationController', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reuses stored selection translations when toggling back on', async () => {
    setDocumentHtml(loadFixture('article.html'));
    const chromeMock = getChromeMock();
    const settings = createSettings();
    await saveSettings(settings);

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map(
                (fragment) => `<span data-translated="ja">${fragment}</span>`,
              ),
            },
          };
        }

        return { ok: true };
      },
    );

    const lead = document.getElementById('lead') as HTMLElement;
    const originalHtml = lead.innerHTML;
    const controller = new TranslationController(document);

    selectElementContents(lead);
    const translateResponse = await controller.handleMessage({
      type: 'START_SELECTION_TRANSLATION',
      settings,
    });

    expect(translateResponse.ok).toBe(true);
    expect(lead.innerHTML).toContain('data-translated="ja"');

    selectElementContents(lead);
    const restoreResponse = await controller.handleMessage({
      type: 'TOGGLE_SELECTION',
      settings,
    });

    expect(restoreResponse.ok).toBe(true);
    expect(lead.innerHTML).toBe(originalHtml);

    chromeMock.runtime.sendMessage.mockClear();
    (chromeMock.runtime.sendMessage as any).mockImplementation(async (message: { type: string }) => {
      if (message.type === 'SESSION_STATE_CHANGED') {
        return { ok: true };
      }
      throw new Error('A second provider call should not be needed.');
    });

    selectElementContents(lead);
    const toggleBackResponse = await controller.handleMessage({
      type: 'TOGGLE_SELECTION',
      settings,
    });

    expect(toggleBackResponse.ok).toBe(true);
    expect(lead.innerHTML).toContain('data-translated="ja"');
  });

  it('reuses cached analysis data when translating the page', async () => {
    setDocumentHtml(loadFixture('article.html'));

    const chromeMock = getChromeMock();
    const settings = createSettings();

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);

    const analysisResponse = await controller.handleMessage({
      type: 'GET_PAGE_ANALYSIS',
      settings,
      scope: 'main',
    });
    expect(analysisResponse.ok).toBe(true);

    const translateResponse = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });
    expect(translateResponse.ok).toBe(true);
    expect(chromeMock.storage.local.get).toHaveBeenCalledTimes(3);
  });

  it('sanitizes dangerous html returned by the provider before applying it to the page', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="rich"><a href="/safe">Original link inside a longer paragraph for translation.</a></p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ style: 'source-like' });

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return {
            ok: true,
            result: {
              translations: [
                '<a href="javascript:alert(1)" onclick="alert(1)">Translated</a><img src="x" onerror="alert(1)"><script>alert(1)</script>',
              ],
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    const rich = document.getElementById('rich') as HTMLElement;
    expect(rich.innerHTML).toContain('<a>Translated</a>');
    expect(rich.innerHTML).toContain('<img src="x">');
    expect(rich.innerHTML).not.toContain('onclick=');
    expect(rich.innerHTML).not.toContain('onerror=');
    expect(rich.innerHTML).not.toContain('javascript:');
    expect(rich.innerHTML).not.toContain('<script>');
  });

  it('keeps translating when session snapshot delivery has no receiver', async () => {
    setDocumentHtml(loadFixture('article.html'));
    const chromeMock = getChromeMock();
    const settings = createSettings();

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          throw new Error('Could not establish connection. Receiving end does not exist.');
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(document.body.textContent).toContain('[ja]');
  });

  it('cancels an in-flight page translation without surfacing a failure state', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="visible">Visible text that will be cancelled.</p>
          </main>
        </body>
      </html>
    `);
    const chromeMock = getChromeMock();
    const settings = createSettings();
    let completeProviderRequest: ((value: unknown) => void) | null = null;
    let cancelled = false;
    setRect(document.getElementById('visible') as HTMLElement, 24);

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'CANCEL_TRANSLATION') {
          cancelled = true;
          completeProviderRequest?.({
            ok: false,
            message: 'Cancelled. Start a new run when ready.',
          });
          return { ok: true, message: 'Cancelled. Start a new run when ready.' };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return new Promise((resolve) => {
            completeProviderRequest = resolve;
          });
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const translatePromise = controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    await waitFor(() => {
      expect(completeProviderRequest).not.toBeNull();
    });
    const cancelResponse = await controller.handleMessage({
      type: 'CANCEL_TRANSLATION',
    });

    expect(cancelResponse.ok).toBe(true);
    expect(cancelled).toBe(true);
    await expect(translatePromise).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        message: 'Cancelled. Start a new run when ready.',
      }),
    );
    expect(getWidgetHost().dataset.widgetState).not.toBe('error');
  });

  it('translates only visible blocks first, then lazy-loads offscreen blocks on intersection', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="visible">Visible text.</p>
            <p id="below">Below the fold.</p>
          </main>
        </body>
      </html>
    `);

    const visible = document.getElementById('visible') as HTMLElement;
    const below = document.getElementById('below') as HTMLElement;
    setRect(visible, 24);
    setRect(below, 2600);

    const chromeMock = getChromeMock();
    const settings = createSettings();
    const providerCalls: string[][] = [];
    const deferredBatch: {
      resolve: null | ((value: { ok: boolean; result: { translations: string[] } }) => void);
    } = {
      resolve: null,
    };

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          if (message.request.fragments[0] === 'Below the fold.') {
            return await new Promise<{ ok: boolean; result: { translations: string[] } }>((resolve) => {
              deferredBatch.resolve = resolve;
            });
          }

          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(response.message).toContain('load as you scroll');
    expect(providerCalls).toEqual([['Visible text.']]);
    expect(visible.textContent).toBe('Visible text. [ja]');
    expect(below.textContent).toBe('Below the fold.');
    expect(getWidgetHost().dataset.widgetState).toBe('resting');

    emitIntersection(below, true);
    await waitFor(() => {
      expect(deferredBatch.resolve).not.toBeNull();
    });
    expect(getWidgetHost().dataset.widgetState).toBe('working');
    if (deferredBatch.resolve) {
      deferredBatch.resolve({
        ok: true,
        result: {
          translations: ['Below the fold. [ja]'],
        },
      });
    }

    await waitFor(() => {
      expect(providerCalls).toEqual([['Visible text.'], ['Below the fold.']]);
      expect(below.textContent).toBe('Below the fold. [ja]');
    });

    await waitFor(() => {
      expect(getWidgetHost().dataset.widgetState).toBe('done');
    });

    await new Promise((resolve) => setTimeout(resolve, 2300));
    expect(getWidgetHost().dataset.widgetState).toBe('resting');
  });

  it('flushes remaining lazy groups when the page reaches the bottom', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="visible">Visible text.</p>
            <p id="below">Below the fold.</p>
          </main>
        </body>
      </html>
    `);

    const visible = document.getElementById('visible') as HTMLElement;
    const below = document.getElementById('below') as HTMLElement;
    setRect(visible, 24);
    setRect(below, 2600);

    Object.defineProperty(window, 'innerHeight', {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 3200,
      configurable: true,
    });

    const chromeMock = getChromeMock();
    const settings = createSettings();
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls).toEqual([['Visible text.']]);
    expect(below.textContent).toBe('Below the fold.');

    Object.defineProperty(window, 'scrollY', {
      value: 2250,
      writable: true,
      configurable: true,
    });
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(providerCalls).toEqual([['Visible text.'], ['Below the fold.']]);
      expect(below.textContent).toBe('Below the fold. [ja]');
    });
  });

  it('continues with above-the-fold lazy-visible groups immediately after the first screen', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            ${Array.from(
              { length: 9 },
              (_, index) =>
                `<p id="visible-${index}">${`Visible cluster ${index + 1} with longer text for immediate scheduling.`.repeat(3)}</p>`,
            ).join('')}
            <p id="below">Deferred paragraph after the first screen.</p>
          </main>
        </body>
      </html>
    `);

    Array.from({ length: 9 }, (_, index) => {
      setRect(document.getElementById(`visible-${index}`) as HTMLElement, 40 + index * 78, 48);
    });
    setRect(document.getElementById('below') as HTMLElement, 2600, 48);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'fr' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [fr]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.length).toBeGreaterThanOrEqual(1);

    await waitFor(() => {
      expect(
        Array.from({ length: 9 }, (_, index) =>
          (document.getElementById(`visible-${index}`) as HTMLElement).textContent,
        ).every((text) => text?.includes('[fr]')),
      ).toBe(true);
    });

    expect((document.getElementById('below') as HTMLElement).textContent).toBe(
      'Deferred paragraph after the first screen.',
    );
  });

  it('isolates the lead reading group into the first immediate request', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="lead-visible">${'Lead paragraph for first-screen isolation. '.repeat(6)}</p>
            <p id="visible-two">${'Second visible paragraph should be delayed until after the lead. '.repeat(6)}</p>
            <p id="visible-three">${'Third visible paragraph should also wait behind the lead. '.repeat(6)}</p>
          </main>
        </body>
      </html>
    `);

    setRect(document.getElementById('lead-visible') as HTMLElement, 24, 48);
    setRect(document.getElementById('visible-two') as HTMLElement, 140, 48);
    setRect(document.getElementById('visible-three') as HTMLElement, 260, 48);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.length).toBeGreaterThanOrEqual(1);
    expect(providerCalls[0]).toEqual([
      `${'Lead paragraph for first-screen isolation. '.repeat(6)}`.trim(),
    ]);

    await waitFor(() => {
      expect((document.getElementById('visible-two') as HTMLElement).textContent).toContain('[ja]');
      expect((document.getElementById('visible-three') as HTMLElement).textContent).toContain('[ja]');
    });
  });

  it('skips an oversized visible lead for the first immediate request when a safer visible group exists', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="lead-visible">${'Very large lead paragraph with many words for an oversized immediate batch. '.repeat(40)}</p>
            <p id="visible-two">${'Safer visible paragraph should start first. '.repeat(8)}</p>
            <p id="visible-three">${'Another visible paragraph can wait. '.repeat(8)}</p>
          </main>
        </body>
      </html>
    `);

    setRect(document.getElementById('lead-visible') as HTMLElement, 24, 120);
    setRect(document.getElementById('visible-two') as HTMLElement, 170, 48);
    setRect(document.getElementById('visible-three') as HTMLElement, 290, 48);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.length).toBeGreaterThanOrEqual(1);
    expect(providerCalls[0]?.[0]).toContain('Safer visible paragraph should start first.');
    expect(providerCalls[0]?.[0]).not.toContain('Very large lead paragraph');

    await waitFor(() => {
      expect((document.getElementById('lead-visible') as HTMLElement).textContent).toContain('[ja]');
      expect((document.getElementById('visible-two') as HTMLElement).textContent).toContain('[ja]');
    });
  });

  it('prefers a concise single-fragment visible block over a longer multi-fragment lead', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="lead-visible">${'Long visible lead paragraph that still fits the immediate lane but splits into multiple request fragments. '.repeat(10)}</p>
            <h2 id="heading-visible">Short heading should start first.</h2>
            <p id="visible-two">${'Supporting visible paragraph can follow after the heading. '.repeat(4)}</p>
          </main>
        </body>
      </html>
    `);

    setRect(document.getElementById('lead-visible') as HTMLElement, 24, 96);
    setRect(document.getElementById('heading-visible') as HTMLElement, 150, 36);
    setRect(document.getElementById('visible-two') as HTMLElement, 210, 48);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.length).toBeGreaterThanOrEqual(1);
    expect(providerCalls[0]).toHaveLength(1);
    expect(providerCalls[0]?.[0]).not.toContain('Long visible lead paragraph');
    expect(
      providerCalls[0]?.[0].includes('Short heading should start first.') ||
      providerCalls[0]?.[0].includes('Supporting visible paragraph can follow after the heading.'),
    ).toBe(true);

    await waitFor(() => {
      expect((document.getElementById('lead-visible') as HTMLElement).textContent).toContain('[ja]');
      expect((document.getElementById('visible-two') as HTMLElement).textContent).toContain('[ja]');
    });
  });

  it('raises deferred throughput after the lead batch by running multiple provider calls in parallel', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            ${Array.from(
              { length: 60 },
              (_, index) =>
                `<p id="parallel-${index}">${`Visible paragraph ${index + 1} for deferred concurrency measurement. `.repeat(12)}</p>`,
            ).join('')}
          </main>
        </body>
      </html>
    `);

    Array.from({ length: 60 }, (_, index) => {
      setRect(document.getElementById(`parallel-${index}`) as HTMLElement, 24 + index * 56, 48);
    });

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    let requestIndex = 0;
    let inFlight = 0;
    let peakInFlight = 0;

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          const { fragments } = message.request;
          requestIndex += 1;
          if (requestIndex === 1) {
            return {
              ok: true,
              result: {
                translations: fragments.map((fragment) => `${fragment} [ja]`),
              },
            };
          }

          inFlight += 1;
          peakInFlight = Math.max(peakInFlight, inFlight);
          return await new Promise<{ ok: boolean; result: { translations: string[] } }>((resolve) => {
            setTimeout(() => {
              inFlight -= 1;
              resolve({
                ok: true,
                result: {
                  translations: fragments.map((fragment) => `${fragment} [ja]`),
                },
              });
            }, 40);
          });
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);

    await waitFor(() => {
      expect(peakInFlight).toBeGreaterThanOrEqual(3);
    });
  });

  it('uses persistent cache when a lazy block becomes visible later', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="visible">Visible text.</p>
            <p id="below">Below the fold.</p>
          </main>
        </body>
      </html>
    `);

    const visible = document.getElementById('visible') as HTMLElement;
    const below = document.getElementById('below') as HTMLElement;
    setRect(visible, 24);
    setRect(below, 2600);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: true, targetLanguage: 'ja' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls).toEqual([['Visible text.']]);

    (chromeMock.storage.local.get as any).mockImplementationOnce(
      async (keys?: string | string[] | Record<string, unknown> | null) => {
        if (Array.isArray(keys)) {
          return keys.reduce<Record<string, unknown>>((result, key) => {
            result[key] = 'Below the fold. [cached]';
            return result;
          }, {});
        }

        if (typeof keys === 'string') {
          return { [keys]: 'Below the fold. [cached]' };
        }

        return {};
      },
    );

    emitIntersection(below, true);

    await waitFor(() => {
      expect(below.textContent).toBe('Below the fold. [cached]');
    });
    expect(providerCalls).toEqual([['Visible text.']]);
  });

  it('prefetches nearby deferred groups into the same lazy flush to avoid tiny follow-up requests', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="visible">Visible text.</p>
            <p id="near-one">Near deferred one.</p>
            <p id="near-two">Near deferred two.</p>
          </main>
        </body>
      </html>
    `);

    const visible = document.getElementById('visible') as HTMLElement;
    const nearOne = document.getElementById('near-one') as HTMLElement;
    const nearTwo = document.getElementById('near-two') as HTMLElement;
    setRect(visible, 24);
    setRect(nearOne, 2600);
    setRect(nearTwo, 2900);
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 5000,
      configurable: true,
    });
    Object.defineProperty(document.body, 'scrollHeight', {
      value: 5000,
      configurable: true,
    });

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls).toEqual([['Visible text.']]);

    emitIntersection(nearOne, true);

    await waitFor(() => {
      expect(providerCalls).toEqual([
        ['Visible text.'],
        ['Near deferred one.', 'Near deferred two.'],
      ]);
    });
  });

  it(
    'shows a waiting notice while a provider response is still pending',
    async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="visible">Visible text.</p>
          </main>
        </body>
      </html>
    `);

    const visible = document.getElementById('visible') as HTMLElement;
    setRect(visible, 24);

    const chromeMock = getChromeMock();
    const settings = createSettings();
    let resolveProvider:
      | ((value: { ok: boolean; result: { translations: string[] } }) => void)
      | undefined;

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return await new Promise<{ ok: boolean; result: { translations: string[] } }>((resolve) => {
            resolveProvider = resolve;
          });
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const responsePromise = controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    await new Promise((resolve) => setTimeout(resolve, 5200));

    expect(getWidgetHost().dataset.widgetState).toBe('working');
    expect(
      (getWidgetShadowRoot().querySelector('.bubble-text') as HTMLSpanElement).textContent,
    ).toContain('AI の応答を待っています');

    if (resolveProvider) {
      resolveProvider({
        ok: true,
        result: {
          translations: ['Visible text. [ja]'],
        },
      });
    }

    const response = await responsePromise;
    expect(response.ok).toBe(true);
    expect(visible.textContent).toBe('Visible text. [ja]');
    expect(getWidgetHost().dataset.widgetState).toBe('done');
    },
    12000,
  );

  it('dedupes rich blocks by prepared content in readable mode', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="a"><a href="/alpha">Linked theorem note.</a></p>
            <p id="b"><a href="/beta">Linked theorem note.</a></p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ style: 'readable' });
    const providerCalls: Array<{ fragments: string[]; contentMode: string }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[]; contentMode: string } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map(
                (fragment) => `<span data-ja="1">${fragment}</span>`,
              ),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.every((call) => call.contentMode === providerCalls[0]?.contentMode)).toBe(
      true,
    );
    expect(new Set(providerCalls.flatMap((call) => call.fragments)).size).toBe(1);
  });

  it('skips blocks that already look like the target language or low-value boilerplate', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p class="breadcrumbs">Home / Docs / Article</p>
            <p id="ja">これは日本語の説明です。すでに十分読めます。</p>
            <p id="en">Representation theory explains symmetry through linear actions.</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ targetLanguage: 'ja', cacheEnabled: false });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.flat()).toEqual([
      'Representation theory explains symmetry through linear actions.',
    ]);
    expect((document.getElementById('ja') as HTMLElement).textContent).toBe(
      'これは日本語の説明です。すでに十分読めます。',
    );
  });

  it('skips non-reader sections such as references and external links', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <h2>Main results</h2>
            <p id="main-text">Representation theory studies group actions on vector spaces.</p>
            <h2>References</h2>
            <p id="ref-text">Isaacs, Character Theory of Finite Groups.</p>
            <h2>External links</h2>
            <p id="link-text"><a href="/more">More resources</a></p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ targetLanguage: 'ja', cacheEnabled: false });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.flat()).toEqual([
      'Representation theory studies group actions on vector spaces.',
    ]);
    expect((document.getElementById('ref-text') as HTMLElement).textContent).toBe(
      'Isaacs, Character Theory of Finite Groups.',
    );
  });

  it('downgrades light inline formatting to text mode to reduce html overhead', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="inline"><span>Alpha</span> <em>beta</em> <strong>gamma</strong>.</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'fr' });
    const providerCalls: Array<{ fragments: string[]; contentMode: string }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[]; contentMode: string } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `[fr] ${fragment}`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls).toHaveLength(1);
    expect(providerCalls[0].contentMode).toBe('text');
    expect(providerCalls[0].fragments).toEqual(['Alpha beta gamma.']);
    expect((document.getElementById('inline') as HTMLElement).textContent).toBe(
      '[fr] Alpha beta gamma.',
    );
  });

  it('uses protected-marker text mode for inline links while restoring html markup', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="inline">
              <a href="/wiki/representation_theory">Representation theory</a> uses <em>characters</em>.
            </p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: Array<{
      fragments: string[];
      contentMode: string;
      hasProtectedMarkers?: boolean;
    }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: { fragments: string[]; contentMode: string; hasProtectedMarkers?: boolean };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) =>
                fragment
                  .replace('Representation theory', '表現論')
                  .replace('uses', 'では')
                  .replace('characters', '指標')
                  .replace('.', 'を使います。'),
              ),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls).toHaveLength(1);
    expect(providerCalls[0].contentMode).toBe('text');
    expect(providerCalls[0].hasProtectedMarkers).toBe(true);
    expect(providerCalls[0].fragments[0]).toContain('[[t');
    expect((document.querySelector('#inline a') as HTMLAnchorElement).textContent).toBe('表現論');
    expect((document.querySelector('#inline em') as HTMLElement).textContent).toBe('指標');
    expect((document.getElementById('inline') as HTMLElement).textContent).toContain(
      '表現論では指標を使います。',
    );
  });

  it('restores protected math and media html after translating surrounding text', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="hybrid">
              Let
              <span class="mwe-math-element">
                <span class="mwe-math-mathml-inline" style="display: none;"><math><mi>G</mi></math></span>
                <img
                  class="mwe-math-fallback-image-inline"
                  src="/math/G.svg"
                  alt="G"
                />
              </span>
              guide the <a href="/wiki/Representation_theory">representation theory</a> discussion.
            </p>
            <p id="diagram">
              This diagram
              <img class="mw-file-element" src="/diagram/commutes.svg" alt="commutative diagram" />
              commutes.
            </p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: Array<{
      fragments: string[];
      contentMode: string;
      hasProtectedMarkers?: boolean;
    }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: { fragments: string[]; contentMode: string; hasProtectedMarkers?: boolean };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) =>
                fragment
                  .replace('Let', 'まず')
                  .replace('guide the', 'が')
                  .replace('representation theory', '表現論')
                  .replace('discussion.', 'の議論を導きます。')
                  .replace('This diagram', 'この図式は')
                  .replace('commutes.', '可換です。'),
              ),
            },
          };
        }

        return { ok: true };
      },
    );

    const initialMathElements = document.querySelectorAll('.mwe-math-element').length;
    const initialFallbackImages = document.querySelectorAll('.mwe-math-fallback-image-inline').length;
    const initialMediaImages = document.querySelectorAll('img.mw-file-element').length;
    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.some((request) => request.hasProtectedMarkers)).toBe(true);
    expect(providerCalls.some((request) => request.contentMode === 'text')).toBe(true);
    expect(providerCalls.some((request) => request.fragments.some((fragment) => fragment.includes('[[x')))).toBe(
      true,
    );
    expect(document.querySelectorAll('.mwe-math-element')).toHaveLength(initialMathElements);
    expect(document.querySelectorAll('.mwe-math-fallback-image-inline')).toHaveLength(
      initialFallbackImages,
    );
    expect(document.querySelectorAll('img.mw-file-element')).toHaveLength(initialMediaImages);
    expect((document.querySelector('#hybrid a') as HTMLAnchorElement).textContent).toBe('表現論');
    expect((document.getElementById('hybrid') as HTMLElement).textContent).toContain(
      '表現論',
    );
    expect((document.getElementById('diagram') as HTMLElement).textContent).toContain('可換です。');
    expect((document.querySelector('#diagram img.mw-file-element') as HTMLImageElement).src).toContain(
      '/diagram/commutes.svg',
    );
  });

  it('falls back to the original protected fragment when provider output drops math markers', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="hybrid">
              Let
              <span class="mwe-math-element">
                <span class="mwe-math-mathml-inline" style="display: none;"><math><mi>G</mi></math></span>
                <img class="mwe-math-fallback-image-inline" src="/math/G.svg" alt="G" />
              </span>
              guide the <a href="/wiki/Representation_theory">representation theory</a> discussion.
            </p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    let providerCallCount = 0;

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: { fragments: string[]; hasProtectedMarkers?: boolean };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCallCount += 1;
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) =>
                fragment
                  .replace(/\[\[x\d+\]\]/g, '')
                  .replace('representation theory', '表現論')
                  .replace('guide the', 'が')
                  .replace('discussion.', 'の議論を導きます。'),
              ),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCallCount).toBe(1);
    expect(document.querySelectorAll('.mwe-math-element')).toHaveLength(1);
    expect(document.querySelectorAll('img.mwe-math-fallback-image-inline')).toHaveLength(1);
    expect((document.getElementById('hybrid') as HTMLElement).innerHTML).toContain('/math/G.svg');
  });

  it('merges short adjacent text siblings into a single parent html fragment', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <div id="cluster">
              <p>Alpha short.</p>
              <p>Beta short.</p>
              <p>Gamma short.</p>
            </div>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ style: 'source-like' });
    const providerCalls: Array<{ fragments: string[]; contentMode: string }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[]; contentMode: string } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => {
                if (fragment.includes('Alpha short.')) {
                  return message.request?.contentMode === 'html'
                    ? '<p>アルファです。</p><p>ベータです。</p><p>ガンマです。</p>'
                    : 'アルファです。';
                }

                if (fragment.includes('Beta short.')) {
                  return 'ベータです。';
                }

                if (fragment.includes('Gamma short.')) {
                  return 'ガンマです。';
                }

                return fragment;
              }),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    await waitFor(() => {
      expect(document.querySelector('#cluster p')?.textContent).toBe('アルファです。');
      expect(document.querySelectorAll('#cluster p')[2]?.textContent).toBe('ガンマです。');
    });
  });

  it('splits oversized text blocks into multiple request fragments before translating', async () => {
    const longText = Array.from(
      { length: 24 },
      (_, index) => `Sentence ${index + 1} explains a longer representation-theory detail.`,
    ).join(' ');

    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="long">${longText}</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ targetLanguage: 'fr' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map(
                (fragment, index) => `[part-${index + 1}] ${fragment}`,
              ),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.some((fragments) => fragments.length > 1)).toBe(true);
    expect((document.getElementById('long') as HTMLElement).textContent).toContain('[part-1]');
    expect((document.getElementById('long') as HTMLElement).textContent).toContain('[part-2]');
  });

  it('adapts first-screen batches so many small visible blocks use fewer, larger requests', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            ${Array.from(
              { length: 18 },
              (_, index) => `<p id="p-${index}">Visible paragraph ${index + 1} for batching.</p>`,
            ).join('')}
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'fr' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [fr]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.length).toBeLessThanOrEqual(2);
    expect(
      Array.from({ length: 18 }, (_, index) =>
        (document.getElementById(`p-${index}`) as HTMLElement).textContent,
      ).every((text) => text?.includes('[fr]')),
    ).toBe(true);
  });

  it('breaks giant inline-heavy html into multiple requests instead of one oversized batch', async () => {
    const giantInlineHtml = Array.from(
      { length: 18 },
      (_, index) =>
        `<a href="/term-${index}">Term ${index + 1} with extended inline explanation for batching.</a> followed by supporting text.`,
    ).join(' ');

    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="small">Small visible block.</p>
            <p id="giant">${giantInlineHtml}</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ style: 'source-like', cacheEnabled: false, targetLanguage: 'fr' });
    const providerCalls: Array<{ fragments: string[]; contentMode: string }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[]; contentMode: string } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment}<span data-fr="1"></span>`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    const htmlCalls = providerCalls.filter((call) => call.contentMode === 'html');
    expect(response.ok).toBe(true);
    expect(htmlCalls.length).toBeGreaterThan(0);
    expect(htmlCalls.flatMap((call) => call.fragments).length).toBeGreaterThan(1);
    expect(htmlCalls.every((call) => call.fragments.length <= 8)).toBe(true);
    expect(
      htmlCalls.flatMap((call) => call.fragments).every((fragment) => fragment.length <= 900),
    ).toBe(true);
    expect((document.getElementById('giant') as HTMLElement).innerHTML).toContain('data-fr="1"');
  });

  it('raises future analysis estimates after observing higher real token usage', async () => {
    setDocumentHtml(loadFixture('wikipedia-representation-theory.html'));

    const chromeMock = getChromeMock();
    const settings = createSettings({ style: 'source-like', cacheEnabled: false });

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment}<span data-ja="1"></span>`),
              usage: {
                promptTokens: 7000,
                completionTokens: 6200,
                totalTokens: 13200,
              },
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);

    const beforeResponse = (await controller.handleMessage({
      type: 'GET_PAGE_ANALYSIS',
      settings,
      scope: 'main',
    })) as { ok: boolean; analysis?: { estimatedInputTokens: number; estimatedOutputTokens: number } };
    expect(beforeResponse.ok).toBe(true);

    const translateResponse = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });
    expect(translateResponse.ok).toBe(true);

    const afterResponse = (await controller.handleMessage({
      type: 'GET_PAGE_ANALYSIS',
      settings,
      scope: 'main',
    })) as { ok: boolean; analysis?: { estimatedInputTokens: number; estimatedOutputTokens: number } };
    expect(afterResponse.ok).toBe(true);
    expect(afterResponse.analysis?.estimatedInputTokens).toBeGreaterThan(
      beforeResponse.analysis?.estimatedInputTokens ?? 0,
    );
    expect(afterResponse.analysis?.estimatedOutputTokens).toBeGreaterThan(
      beforeResponse.analysis?.estimatedOutputTokens ?? 0,
    );
  });

  it('emits retrying before succeeding on a transient provider failure', async () => {
    vi.useFakeTimers();
    setDocumentHtml(loadFixture('article.html'));

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false });
    const seenStatuses: string[] = [];
    let translateAttempts = 0;

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          seenStatuses.push(
            (message as unknown as { snapshot: { status: string } }).snapshot.status,
          );
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          translateAttempts += 1;
          if (translateAttempts === 1) {
            return { ok: false, message: '429 Too Many Requests' };
          }

          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const responsePromise = controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    await vi.advanceTimersByTimeAsync(1200);
    const response = await responsePromise;

    expect(response.ok).toBe(true);
    expect(translateAttempts).toBeGreaterThan(1);
    expect(seenStatuses).toContain('retrying');
  });

  it('splits a batch into smaller requests when the provider hits an output limit', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p>Alpha paragraph about representations.</p>
            <p>Beta paragraph about characters.</p>
            <p>Gamma paragraph about modules.</p>
            <p>Delta paragraph about decompositions.</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: { fragments: string[] };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          if (message.request.fragments.length > 2) {
            return {
              ok: true,
              result: {
                translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
                finishReason: 'length',
              },
            };
          }

          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
              finishReason: 'stop',
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    const largestBatch = Math.max(...providerCalls.map((fragments) => fragments.length));
    expect(largestBatch).toBeGreaterThan(2);
    expect(providerCalls.some((fragments) => fragments.length < largestBatch)).toBe(true);
    await waitFor(() => {
      expect(document.body.textContent).toContain('Alpha paragraph about representations. [ja]');
      expect(document.body.textContent).toContain('Delta paragraph about decompositions. [ja]');
    });
  });

  it('splits a single oversized fragment and recovers from an output-limit failure', async () => {
    const longParagraph = Array.from(
      { length: 6 },
      (_, index) => `Sentence ${index + 1} covers a long but still single-fragment topic.`,
    ).join(' ');

    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="long">${longParagraph}</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: { fragments: string[] };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          if (message.request.fragments.length === 1) {
            return {
              ok: true,
              result: {
                translations: ['too long'],
                finishReason: 'length',
              },
            };
          }

          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `[ja] ${fragment}`),
              finishReason: 'stop',
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.map((fragments) => fragments.length)).toEqual([1, 2]);
    expect((document.getElementById('long') as HTMLElement).textContent).toContain('[ja]');
  });

  it('falls back to the source fragment when a single-item output-limit error remains unrecoverable', async () => {
    const paragraph = Array.from(
      { length: 6 },
      (_, index) => `Sentence ${index + 1} still triggers a pathological output-limit response.`,
    ).join(' ');

    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="stuck">${paragraph}</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: { fragments: string[] };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map(() => 'still too long'),
              finishReason: 'length',
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect((document.getElementById('stuck') as HTMLElement).textContent).toBe(paragraph);
  });

  it('splits a batch into smaller requests when the provider returns the wrong fragment count', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p>Alpha paragraph about representations.</p>
            <p>Beta paragraph about characters.</p>
            <p>Gamma paragraph about modules.</p>
            <p>Delta paragraph about decompositions.</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: { fragments: string[] };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          if (message.request.fragments.length > 2) {
            return {
              ok: true,
              result: {
                translations: message.request.fragments.slice(0, 3).map((fragment) => `${fragment} [ja]`),
                finishReason: 'stop',
              },
            };
          }

          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
              finishReason: 'stop',
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    const largestBatch = Math.max(...providerCalls.map((fragments) => fragments.length));
    expect(largestBatch).toBeGreaterThan(2);
    expect(providerCalls.some((fragments) => fragments.length < largestBatch)).toBe(true);
    await waitFor(() => {
      expect(document.body.textContent).toContain('Alpha paragraph about representations. [ja]');
      expect(document.body.textContent).toContain('Delta paragraph about decompositions. [ja]');
    });
  });

  it('collapses an over-split single-fragment response instead of failing the page', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="single">Representation theory starts with group actions.</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: { fragments: string[] };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return {
            ok: true,
            result: {
              translations: ['表現論は', '群作用から始まります。'],
              finishReason: 'stop',
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect((document.getElementById('single') as HTMLElement).textContent).toBe(
      '表現論は群作用から始まります。',
    );
  });

  it('splits a batch into smaller requests when the provider returns an invalid payload', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p>Alpha paragraph about representations.</p>
            <p>Beta paragraph about characters.</p>
            <p>Gamma paragraph about modules.</p>
            <p>Delta paragraph about decompositions.</p>
          </main>
        </body>
      </html>
    `);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const providerCalls: string[][] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: { fragments: string[] };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request.fragments);
          if (message.request.fragments.length > 2) {
            return {
              ok: false,
              message: 'Provider returned an invalid translations payload.',
            };
          }

          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
              finishReason: 'stop',
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    const largestBatch = Math.max(...providerCalls.map((fragments) => fragments.length));
    expect(largestBatch).toBeGreaterThan(2);
    expect(providerCalls.some((fragments) => fragments.length < largestBatch)).toBe(true);
    await waitFor(() => {
      expect(document.body.textContent).toContain('Alpha paragraph about representations. [ja]');
      expect(document.body.textContent).toContain('Delta paragraph about decompositions. [ja]');
    });
  });

  it('passes section context and learned glossary hints to later batches', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
          <h2>Irreducible representations</h2>
            <p>irreducible representation</p>
            <p>irreducible representation</p>
            <p>irreducible representation</p>
            ${Array.from(
              { length: 8 },
              (_, index) =>
                `<p class="filler">Additional visible paragraph ${index + 1} about characters and modules with enough text to stay in the first screen.</p>`,
            ).join('')}
            <p id="below">An irreducible representation stays simple under decomposition arguments.</p>
          </main>
        </body>
      </html>
    `);

    Array.from(document.querySelectorAll('p'))
      .slice(0, 11)
      .forEach((element, index) => setRect(element as HTMLElement, 40 + index * 56, 40));
    const below = document.getElementById('below') as HTMLElement;
    setRect(below, 12000, 40);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });
    const requests: Array<{
      fragments: string[];
      sectionContext?: string;
      glossary?: Array<{ source: string; target: string }>;
    }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: {
          fragments: string[];
          sectionContext?: string;
          glossary?: Array<{ source: string; target: string }>;
        };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          requests.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => {
                if (fragment === 'irreducible representation') {
                  return '既約表現';
                }

                if (fragment.includes('stays simple under decomposition')) {
                  return '既約表現は分解議論の下でも単純さを保ちます。';
                }

                return `【${fragment}】`;
              }),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    emitIntersection(below, true);

    await waitFor(() => {
      expect(requests.length).toBeGreaterThanOrEqual(2);
    });

    expect(
      requests.some((request) => request.sectionContext?.includes('Irreducible representations')),
    ).toBe(true);
    expect(requests.some((request) =>
      JSON.stringify(request.glossary) ===
      JSON.stringify([
        {
          source: 'irreducible representation',
          target: '既約表現',
        },
      ]),
    )).toBe(true);
    expect((document.getElementById('below') as HTMLElement).textContent).toContain('既約表現');
  });

  it('uses placeholder-rich text mode even when protected html markers are present', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="rich">
              <a href="/wiki/representation_theory">Representation theory</a>
              <img class="mw-file-element" src="/diagram.svg" alt="diagram">
              uses <em>characters</em>.
            </p>
          </main>
        </body>
      </html>
    `);

    const rich = document.getElementById('rich') as HTMLElement;
    setRect(rich, 24, 40, 520);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, style: 'auto' });
    const requests: Array<{
      contentMode: string;
      fragments: string[];
      hasProtectedMarkers?: boolean;
      fragmentIds?: string[];
    }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: {
          contentMode: string;
          fragments: string[];
          hasProtectedMarkers?: boolean;
          fragmentIds?: string[];
        };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          requests.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments,
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.contentMode).toBe('text');
    expect(requests[0]?.hasProtectedMarkers).toBe(true);
    expect(requests[0]?.fragmentIds).toBeUndefined();
    expect(rich.innerHTML).toContain('mw-file-element');
    expect(rich.innerHTML).toContain('<a href="/wiki/representation_theory">');
  });

  it('adds fragment ids only for larger multi-fragment text batches', async () => {
    const runSplitCapture = async (text: string) => {
      setDocumentHtml(`
        <!DOCTYPE html>
        <html lang="en">
          <body>
            <main>
              <p id="copy">${text}</p>
            </main>
          </body>
        </html>
      `);

      const copy = document.getElementById('copy') as HTMLElement;
      setRect(copy, 24, 48, 640);

      const chromeMock = getChromeMock();
      const settings = createSettings({ cacheEnabled: false });
      let capturedRequest:
        | {
            fragments: string[];
            fragmentIds?: string[];
          }
        | undefined;

      (chromeMock.runtime.sendMessage as any).mockImplementation(
        async (message: {
          type: string;
          request?: {
            fragments: string[];
            fragmentIds?: string[];
          };
        }) => {
          if (message.type === 'SESSION_STATE_CHANGED') {
            return { ok: true };
          }

          if (message.type === 'TRANSLATE_API' && message.request) {
            capturedRequest = message.request;
            return {
              ok: true,
              result: {
                translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
              },
            };
          }

          return { ok: true };
        },
      );

      const controller = new TranslationController(document);
      const response = await controller.handleMessage({
        type: 'START_TRANSLATION',
        settings,
        scope: 'main',
      });

      expect(response.ok).toBe(true);
      expect(capturedRequest).toBeDefined();
      return capturedRequest!;
    };

    const shortLongText = Array.from(
      { length: 14 },
      () => 'Representation theory studies symmetry through linear actions.',
    ).join(' ');
    const shortRequest = await runSplitCapture(shortLongText);
    expect(shortRequest.fragments.length).toBeGreaterThan(1);
    expect(shortRequest.fragments.length).toBeLessThan(4);
    expect(shortRequest.fragmentIds).toBeUndefined();

    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            ${Array.from(
              { length: 5 },
              (_, index) =>
                `<p id="cluster-${index}">Visible cluster ${index + 1} about representation theory and modules.</p>`,
            ).join('')}
          </main>
        </body>
      </html>
    `);

    Array.from({ length: 5 }, (_, index) => {
      setRect(document.getElementById(`cluster-${index}`) as HTMLElement, 24 + index * 56, 40, 520);
    });

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false });
    const requests: Array<{
      fragments: string[];
      fragmentIds?: string[];
    }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: {
          fragments: string[];
          fragmentIds?: string[];
        };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          requests.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);

    await waitFor(() => {
      expect(requests.some((request) => request.fragments.length >= 4)).toBe(true);
    });

    const largeRequest = requests.find((request) => request.fragments.length >= 4);
    expect(largeRequest?.fragmentIds).toHaveLength(largeRequest?.fragments.length ?? 0);
  });

  it('includes runtime metrics in the session snapshot for live benchmark capture', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="visible">Visible text.</p>
            <p id="below">Below the fold.</p>
          </main>
        </body>
      </html>
    `);

    const visible = document.getElementById('visible') as HTMLElement;
    const below = document.getElementById('below') as HTMLElement;
    setRect(visible, 24);
    setRect(below, 2600);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false, targetLanguage: 'ja' });

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => `${fragment} [ja]`),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);

    let snapshotResponse = await controller.handleMessage({
      type: 'GET_SESSION_SNAPSHOT',
    }) as { ok: boolean; snapshot?: { status?: string; metrics?: any } };
    expect(snapshotResponse.ok).toBe(true);
    expect(snapshotResponse.snapshot?.metrics?.requestCountsByPhase.immediate).toBeGreaterThan(0);
    expect(snapshotResponse.snapshot?.metrics?.cacheStats.misses).toBeGreaterThan(0);
    expect(snapshotResponse.snapshot?.metrics?.phaseTimings.immediateCompletedMs).not.toBeNull();
    expect(snapshotResponse.snapshot?.metrics?.immediateBatch?.groupCount).toBeGreaterThan(0);
    expect(snapshotResponse.snapshot?.metrics?.immediateBatch?.fragmentCount).toBeGreaterThan(0);
    expect(snapshotResponse.snapshot?.metrics?.immediateBatch?.estimatedPromptTokens).toBeGreaterThan(0);
    expect(snapshotResponse.snapshot?.metrics?.immediateBatch?.providerLatencyMs).not.toBeNull();

    emitIntersection(below, true);

    await waitFor(async () => {
      snapshotResponse = await controller.handleMessage({
        type: 'GET_SESSION_SNAPSHOT',
      }) as { ok: boolean; snapshot?: { status?: string; metrics?: any } };
      expect(snapshotResponse.snapshot?.status).toBe('completed');
    });

    expect(snapshotResponse.snapshot?.metrics?.phaseTimings.completedMs).not.toBeNull();
    expect(snapshotResponse.snapshot?.metrics?.requestCountsByPhase.deferred).toBeGreaterThan(0);
    expect(snapshotResponse.snapshot?.metrics?.splitStats.batchByContentMode.text).toBeGreaterThanOrEqual(0);
    expect(snapshotResponse.snapshot?.metrics?.splitStats.batchByMarkerPresence.marked).toBeGreaterThanOrEqual(0);
  });

  it('routes heavier safe XHTML wrappers through multi-fragment text groups', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <div id="structured-proof" class="proof">
              <p><span class="theorem_label">Proof</span><span>. </span><strong>(safe structured wrapper)</strong></p>
              ${Array.from(
                { length: 6 },
                (_, index) => `
                  <p>
                    Structured XHTML wrapper paragraph ${index + 1}
                    with <a href="/nlab/show/Yoneda+lemma">linked terminology</a>,
                    <strong>inline emphasis</strong>, and
                    <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi><mo stretchy="false">(</mo><mi>c</mi><mo stretchy="false">)</mo></math>
                    in enough prose to require multiple placeholder text fragments.
                    ${'This structured wrapper intentionally produces a heavier XHTML wrapper that should still stay on the safe placeholder lane. '.repeat(4)}
                  </p>
                `,
              ).join('')}
            </div>
          </main>
        </body>
      </html>
    `);
    Object.defineProperty(document, 'contentType', {
      configurable: true,
      value: 'application/xhtml+xml',
    });

    setRect(document.getElementById('structured-proof') as HTMLElement, 24, 420, 520);

    const controller = new TranslationController(document);
    const settings = createSettings({ cacheEnabled: false });
    const response = await controller.handleMessage({
      type: 'GET_DEBUG_BLOCKS',
      settings,
      scope: 'main',
    }) as DebugBlocksResponse;

    expect(response.ok).toBe(true);
    if (!response.ok) {
      throw new Error('Expected debug response.');
    }
    const debug = response.debug as { groups: DebugGroup[] };

    const structuredGroup = debug.groups.find(
      (group: DebugGroup) =>
        group.preview.includes('Structured XHTML wrapper paragraph'),
    );
    expect(structuredGroup).toBeDefined();
    expect(structuredGroup?.contentMode).toBe('text');
    expect(structuredGroup?.fragmentCount).toBeGreaterThanOrEqual(1);
  });

  it('keeps lighter XHTML paragraph groups separate from heavier safe XHTML wrapper groups', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            ${Array.from(
              { length: 10 },
              (_, index) => `
                <p id="xml-html-light-${index}">
                  XHTML paragraph ${index + 1}
                  with <sup>${index + 1}</sup> inline notation and just enough prose
                  to stay on the plain html lane.
                  ${'This paragraph is intentionally light so the lighter XHTML lane can batch more aggressively. '.repeat(3)}
                </p>
              `,
            ).join('')}
            <div id="xml-html-heavy-a" class="proof">
              <p><span class="theorem_label">Proof A</span><span>. </span><strong>(safe structured wrapper)</strong></p>
              ${Array.from(
                { length: 6 },
                (_, index) => `
                  <p>
                    Structured XHTML block alpha ${index + 1}
                    with <a href="/nlab/show/set">linked terminology</a>,
                    <strong>inline emphasis</strong>, and
                    <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>X</mi><mo stretchy="false">(</mo><mi>c</mi><mo stretchy="false">)</mo></math>
                    in enough prose to require multiple placeholder text fragments.
                  ${'This structured wrapper intentionally produces a heavier XHTML wrapper that should still stay on the safe placeholder lane. '.repeat(4)}
                </p>
              `,
              ).join('')}
            </div>
            <div id="xml-html-heavy-b" class="proof">
              <p><span class="theorem_label">Proof B</span><span>. </span><strong>(safe structured wrapper)</strong></p>
              ${Array.from(
                { length: 6 },
                (_, index) => `
                  <p>
                    Structured XHTML block beta ${index + 1}
                    with <a href="/nlab/show/presheaf">linked terminology</a>,
                    <strong>inline emphasis</strong>, and
                    <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>Y</mi><mo stretchy="false">(</mo><mi>c</mi><mo stretchy="false">)</mo></math>
                    in enough prose to require multiple placeholder text fragments.
                  ${'This structured wrapper intentionally produces a heavier XHTML wrapper that should still stay on the safe placeholder lane. '.repeat(4)}
                </p>
              `,
              ).join('')}
            </div>
          </main>
        </body>
      </html>
    `);
    Object.defineProperty(document, 'contentType', {
      configurable: true,
      value: 'application/xhtml+xml',
    });

    Array.from({ length: 10 }, (_, index) => {
      setRect(
        document.getElementById(`xml-html-light-${index}`) as HTMLElement,
        24 + index * 68,
        44,
        520,
      );
    });
    setRect(document.getElementById('xml-html-heavy-a') as HTMLElement, 900, 320, 520);
    setRect(document.getElementById('xml-html-heavy-b') as HTMLElement, 1280, 320, 520);

    const settings = createSettings({ cacheEnabled: false });
    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'GET_DEBUG_BLOCKS',
      settings,
      scope: 'main',
    }) as DebugBlocksResponse;

    expect(response.ok).toBe(true);
    if (!response.ok) {
      throw new Error('Expected debug response.');
    }
    const debug = response.debug as { groups: DebugGroup[] };

    const heavyGroup = debug.groups.find(
      (group: DebugGroup) =>
        group.preview.includes('Structured XHTML block alpha'),
    );
    const lightGroup = debug.groups.find(
      (group: DebugGroup) =>
        group.preview.includes('XHTML paragraph 1'),
    );
    expect(heavyGroup).toBeDefined();
    expect(lightGroup).toBeDefined();
    expect(heavyGroup?.contentMode).toBe('text');
    expect(heavyGroup?.fragmentCount).toBeGreaterThanOrEqual(1);
    expect(lightGroup?.contentMode).toBe('text');
    expect(lightGroup?.fragmentCount).toBeGreaterThanOrEqual(1);
  });

  it('routes safe XHTML paragraphs with inline links and MathML through the text placeholder lane', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="yoneda-paragraph">
              The <strong>Yoneda lemma</strong> says that the <a href="/nlab/show/set">set</a> of
              <a href="/nlab/show/morphisms">morphisms</a> from a
              <a href="/nlab/show/representable+presheaf">representable presheaf</a>
              <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>y</mi><mo stretchy="false">(</mo><mi>c</mi><mo stretchy="false">)</mo></math>
              into an arbitrary <a href="/nlab/show/presheaf">presheaf</a>
              <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>X</mi></math>
              is in <a href="/nlab/show/natural+bijection">natural bijection</a> with the set
              <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>X</mi><mo stretchy="false">(</mo><mi>c</mi><mo stretchy="false">)</mo></math>.
            </p>
          </main>
        </body>
      </html>
    `);
    Object.defineProperty(document, 'contentType', {
      configurable: true,
      value: 'application/xhtml+xml',
    });

    setRect(document.getElementById('yoneda-paragraph') as HTMLElement, 24, 420, 520);

    const settings = createSettings({ cacheEnabled: false });
    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'GET_DEBUG_BLOCKS',
      settings,
      scope: 'main',
    }) as DebugBlocksResponse;

    expect(response.ok).toBe(true);
    if (!response.ok) {
      throw new Error('Expected debug response.');
    }
    const debug = response.debug as { groups: DebugGroup[] };
    const yonedaGroup = debug.groups.find((group: DebugGroup) =>
      group.preview.includes('The Yoneda lemma says'),
    );

    expect(yonedaGroup).toBeDefined();
    expect(yonedaGroup?.contentMode).toBe('text');
    expect(yonedaGroup?.fragmentCount).toBe(1);
  });

  it('routes nLab-style structured definition wrappers through the text placeholder lane', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main id="revision">
            <div id="FunctorUnderlyingTheYonedaEmbedding" class="num_defn">
              <h6>Definition 2.1. <span class="title_defn">functor underlying the Yoneda embedding</span></h6>
              <p>For <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>C</mi></math> a locally small category we write</p>
              <div class="maruku-equation"><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>y</mi><mo>:</mo><mi>C</mi><mo stretchy="false">→</mo><msup><mi>Set</mi><msup><mi>C</mi><mi>op</mi></msup></msup></math></div>
              <p>for the <a href="/nlab/show/functor+category">functor category</a> out of the opposite category of <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>C</mi></math> into <a href="/nlab/show/Set">Set</a>.</p>
            </div>
          </main>
        </body>
      </html>
    `);
    Object.defineProperty(document, 'contentType', {
      configurable: true,
      value: 'application/xhtml+xml',
    });

    setRect(document.getElementById('FunctorUnderlyingTheYonedaEmbedding') as HTMLElement, 24, 280, 520);

    const settings = createSettings({ cacheEnabled: false });
    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'GET_DEBUG_BLOCKS',
      settings,
      scope: 'main',
    }) as DebugBlocksResponse;

    expect(response.ok).toBe(true);
    if (!response.ok) {
      throw new Error('Expected debug response.');
    }

    const debug = response.debug as { groups: DebugGroup[] };
    const definitionGroup = debug.groups.find((group: DebugGroup) =>
      group.preview.includes('For C a locally small category we write'),
    );

    expect(definitionGroup).toBeDefined();
    expect(definitionGroup?.contentMode).toBe('text');
    expect(definitionGroup?.fragmentCount).toBeGreaterThanOrEqual(1);
    expect(definitionGroup?.skipWrapperRestore).toBe(true);
    expect(definitionGroup?.hasProtectedMarkers).toBe(true);
  });

  it('translates split protected XHTML wrappers without falling back to the original English fragments', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main id="revision">
            <div id="xhtml-proof" class="proof">
              <p><span class="theorem_label">Proof.</span> <strong>Structured wrapper</strong></p>
              ${Array.from(
                { length: 4 },
                (_, index) => `
                  <p>
                    Structured XHTML wrapper paragraph ${index + 1}
                    with <a href="/nlab/show/Yoneda+lemma">linked terminology</a>,
                    <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi><mo stretchy="false">(</mo><mi>c</mi><mo stretchy="false">)</mo></math>,
                    and enough prose to force multiple placeholder fragments.
                    ${'This wrapper should stay translated even when protected markers appear in only some segments. '.repeat(3)}
                  </p>
                `,
              ).join('')}
            </div>
          </main>
        </body>
      </html>
    `);
    Object.defineProperty(document, 'contentType', {
      configurable: true,
      value: 'application/xhtml+xml',
    });

    const proof = document.getElementById('xhtml-proof') as HTMLElement;
    setRect(proof, 24, 420, 520);

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false });

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) =>
                `翻訳:${fragment.replace(/Structured XHTML wrapper paragraph/g, '整形されたXHTML段落')}`,
              ),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(proof.textContent).toContain('翻訳:');
    expect(proof.textContent).toContain('整形されたXHTML段落 1');
    expect(proof.querySelectorAll('math')).toHaveLength(4);
    expect(proof.textContent).not.toContain('Structured XHTML wrapper paragraph 4');
  });

  it('keeps deferred plain html batches on regular html pages from growing without bound', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="lead">Lead paragraph with plain text for the immediate lane.</p>
            ${Array.from(
              { length: 8 },
              (_, index) => `
                <p id="html-deferred-${index}" data-bucket="plain-html">
                  ${`Deferred html paragraph ${index + 1} with <sup>${index + 1}</sup> notation that keeps it on the html lane without protected markers and is intentionally long enough to trigger the deferred plain-html soft cap. `.repeat(8)}
                </p>
              `,
            ).join('')}
          </main>
        </body>
      </html>
    `);

    setRect(document.getElementById('lead') as HTMLElement, 24, 44, 520);
    Array.from({ length: 8 }, (_, index) => {
      setRect(
        document.getElementById(`html-deferred-${index}`) as HTMLElement,
        2200 + index * 70,
        44,
        520,
      );
    });

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false });
    const deferredHtmlBatchSizes: number[] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: {
          contentMode: 'text' | 'html';
          fragments: string[];
        };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          if (
            message.request.contentMode === 'html' &&
            message.request.fragments.some((fragment) => fragment.includes('Deferred html paragraph'))
          ) {
            deferredHtmlBatchSizes.push(message.request.fragments.length);
          }
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map((fragment) => fragment),
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);

    await waitFor(() => {
      expect(deferredHtmlBatchSizes.length).toBeGreaterThan(0);
    });

    expect(Math.max(...deferredHtmlBatchSizes)).toBeLessThanOrEqual(18);
  });

  it('keeps marked XHTML text batches from growing without bound', async () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <main id="revision">
            <p id="lead">Lead paragraph for the immediate XHTML lane.</p>
            ${Array.from(
              { length: 3 },
              (_, wrapperIndex) => `
                <div id="xml-marked-${wrapperIndex}" class="proof">
                  <p><span class="theorem_label">Proof ${wrapperIndex + 1}.</span> <strong>Structured wrapper</strong></p>
                  ${Array.from(
                    { length: 4 },
                    (_, index) => `
                      <p>
                        Structured XHTML wrapper paragraph ${wrapperIndex + 1}.${index + 1}
                        with <a href="/nlab/show/Yoneda+lemma">linked terminology</a>,
                        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi><mo stretchy="false">(</mo><mi>c</mi><mo stretchy="false">)</mo></math>,
                        and enough prose to force multiple placeholder fragments.
                        ${'This wrapper should stay on the marked XHTML text lane. '.repeat(4)}
                      </p>
                    `,
                  ).join('')}
                </div>
              `,
            ).join('')}
          </main>
        </body>
      </html>
    `);
    Object.defineProperty(document, 'contentType', {
      configurable: true,
      value: 'application/xhtml+xml',
    });

    setRect(document.getElementById('lead') as HTMLElement, 24, 44, 520);
    Array.from({ length: 3 }, (_, index) => {
      setRect(
        document.getElementById(`xml-marked-${index}`) as HTMLElement,
        2200 + index * 320,
        280,
        520,
      );
    });

    const chromeMock = getChromeMock();
    const settings = createSettings({ cacheEnabled: false });
    const markedBatchSizes: number[] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: {
          contentMode: 'text' | 'html';
          fragments: string[];
        };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          if (
            message.request.contentMode === 'text' &&
            message.request.fragments.some((fragment) =>
              fragment.includes('Structured XHTML wrapper paragraph'),
            )
          ) {
            markedBatchSizes.push(message.request.fragments.length);
          }
          return {
            ok: true,
            result: {
              translations: message.request.fragments,
            },
          };
        }

        return { ok: true };
      },
    );

    const controller = new TranslationController(document);
    const translatePromise = controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'page',
    });

    Array.from({ length: 3 }, (_, index) => {
      emitIntersection(document.getElementById(`xml-marked-${index}`) as HTMLElement, true);
    });

    const response = await translatePromise;
    expect(response.ok).toBe(true);

    await waitFor(() => {
      expect(markedBatchSizes.length).toBeGreaterThan(0);
    });

    expect(Math.max(...markedBatchSizes)).toBeLessThanOrEqual(4);
  });
});
