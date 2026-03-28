import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  OPENROUTER_REQUEST_TIMEOUT_MS,
  translateWithOpenRouter,
} from '../src/core/providers/openrouter';
import type { TranslationBatchRequest } from '../src/shared/types';

const ORIGINAL_FETCH = global.fetch;

const BASE_REQUEST: TranslationBatchRequest = {
  provider: 'openrouter',
  apiKey: 'test-key',
  model: 'google/gemini-3.1-flash-lite-preview',
  sourceLanguage: 'en',
  targetLanguage: 'ja',
  style: 'auto',
  contentMode: 'text',
  context: {
    pageTitle: 'Test page',
    pageDescription: '',
    pageUrl: 'https://example.com',
    sourceLanguage: 'en',
    targetLanguage: 'ja',
  },
  fragments: ['Hello world'],
};

describe('translateWithOpenRouter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', ORIGINAL_FETCH);
  });

  it('recovers when the model appends text after a valid JSON payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '{"translations":["こんにちは"]}\nI kept the JSON minimal as requested.',
              },
            },
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
        }),
      })),
    );

    const result = await translateWithOpenRouter(BASE_REQUEST);

    expect(result.translations).toEqual(['こんにちは']);
    expect(result.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });
  });

  it('recovers when the model wraps JSON in markdown fences', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '```json\n{"translations":["数式を保ったまま翻訳します。"]}\n```',
              },
            },
          ],
        }),
      })),
    );

    const result = await translateWithOpenRouter(BASE_REQUEST);

    expect(result.translations).toEqual(['数式を保ったまま翻訳します。']);
  });

  it('accepts id-tagged translation objects and restores the requested order', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content:
                  '{"translations":[{"i":"f1","t":"第二"},{"i":"f0","t":"第一"}]}',
              },
            },
          ],
        }),
      })),
    );

    const result = await translateWithOpenRouter({
      ...BASE_REQUEST,
      fragments: ['First', 'Second'],
      fragmentIds: ['f0', 'f1'],
    });

    expect(result.translations).toEqual(['第一', '第二']);
  });

  it('times out stalled provider requests', async () => {
    vi.useFakeTimers();

    vi.stubGlobal(
      'fetch',
      vi.fn((_, init?: RequestInit) => {
        return new Promise((_, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const abortError = new Error('The request was aborted.');
            abortError.name = 'AbortError';
            reject(abortError);
          });
        });
      }),
    );

    const resultPromise = translateWithOpenRouter(BASE_REQUEST);
    const assertion = expect(resultPromise).rejects.toThrow('OpenRouter request timed out.');
    await vi.advanceTimersByTimeAsync(OPENROUTER_REQUEST_TIMEOUT_MS + 10);
    await assertion;
  });

  it('treats an external abort signal as cancellation instead of timeout', async () => {
    const controller = new AbortController();

    vi.stubGlobal(
      'fetch',
      vi.fn((_, init?: RequestInit) => {
        return new Promise((_, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const abortError = new Error('The request was aborted.');
            abortError.name = 'AbortError';
            reject(abortError);
          });
        });
      }),
    );

    const resultPromise = translateWithOpenRouter(BASE_REQUEST, {
      signal: controller.signal,
    });
    controller.abort();

    await expect(resultPromise).rejects.toThrow('Cancelled. Start a new run when ready.');
  });

  it('adds a bounded max_tokens value and returns the provider finish reason', async () => {
    let requestBody: Record<string, unknown> | undefined;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_, init?: RequestInit) => {
        requestBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                finish_reason: 'length',
                message: {
                  content: '{"translations":["こんにちは"]}',
                },
              },
            ],
          }),
        };
      }),
    );

    const result = await translateWithOpenRouter({
      ...BASE_REQUEST,
      fragments: ['Hello world', 'Another short fragment'],
    });

    expect(requestBody?.max_tokens).toEqual(expect.any(Number));
    expect(Number(requestBody?.max_tokens)).toBeGreaterThan(0);
    expect(Number(requestBody?.max_tokens)).toBeLessThanOrEqual(6000);
    expect(result.finishReason).toBe('length');
  });

  it('uses a compact system prompt without repeating page metadata', async () => {
    let requestBody: Record<string, unknown> | undefined;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_, init?: RequestInit) => {
        requestBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: '{"translations":["<p>こんにちは</p>"]}',
                },
              },
            ],
          }),
        };
      }),
    );

    await translateWithOpenRouter({
      ...BASE_REQUEST,
      contentMode: 'html',
      style: 'source-like',
      fragments: ['<p>Hello world</p>'],
    });

    const messages = (requestBody?.messages ?? []) as Array<{ content?: string }>;
    const systemPrompt = messages[0]?.content ?? '';

    expect(systemPrompt).not.toContain('Page:');
    expect(systemPrompt).not.toContain(BASE_REQUEST.context.pageTitle);
    expect(systemPrompt).toContain('Return JSON: {"translations"');
    expect(systemPrompt.length).toBeLessThan(260);
  });

  it('includes section context and glossary only when provided', async () => {
    let requestBody: Record<string, unknown> | undefined;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_, init?: RequestInit) => {
        requestBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: '{"translations":["表現論"]}',
                },
              },
            ],
          }),
        };
      }),
    );

    await translateWithOpenRouter({
      ...BASE_REQUEST,
      fragments: ['Representation theory'],
      sectionContext: 'Mathematics > Algebra',
      glossary: [
        {
          source: 'representation',
          target: '表現',
        },
      ],
      maxOutputTokens: 321,
    });

    const messages = (requestBody?.messages ?? []) as Array<{ content?: string }>;
    const systemPrompt = messages[0]?.content ?? '';
    const userPayload = JSON.parse(String(messages[1]?.content ?? '{}')) as {
      s?: string;
      g?: Array<{ source: string; target: string }>;
      f?: string[];
    };

    expect(systemPrompt).toContain('Use s/g only as soft context.');
    expect(userPayload.s).toBe('Mathematics > Algebra');
    expect(userPayload.g).toEqual([
      {
        source: 'representation',
        target: '表現',
      },
    ]);
    expect(userPayload.f).toEqual(['Representation theory']);
    expect(requestBody?.max_tokens).toBeGreaterThanOrEqual(321);
  });

  it('turns truncated length responses into an output-limit error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          choices: [
            {
              finish_reason: 'length',
              message: {
                content: '{"translations":["途中まで',
              },
            },
          ],
        }),
      })),
    );

    await expect(translateWithOpenRouter(BASE_REQUEST)).rejects.toThrow(
      'Provider response reached output limit.',
    );
  });

  it('tells the provider to preserve protected placeholder markers', async () => {
    let requestBody: Record<string, unknown> | undefined;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_, init?: RequestInit) => {
        requestBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
        return {
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: '{"translations":["[[TX0O]]表現論[[TX0C]]"]}',
                },
              },
            ],
          }),
        };
      }),
    );

    await translateWithOpenRouter({
      ...BASE_REQUEST,
      fragments: ['[[TX0O]]Representation theory[[TX0C]]'],
      hasProtectedMarkers: true,
    });

    const messages = (requestBody?.messages ?? []) as Array<{ content?: string }>;
    const systemPrompt = messages[0]?.content ?? '';

    expect(systemPrompt).toContain('Keep tokens like [[TX0O]]');
  });
});
