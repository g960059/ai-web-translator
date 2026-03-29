import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { PopupApp } from '../src/popup/PopupApp';
import { SETTINGS_STORAGE_KEY } from '../src/shared/settings';
import { getChromeMock } from './setup';

describe('PopupApp', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads stored settings and autosaves changes', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: 'stored-key',
        model: 'openai/gpt-4o-mini',
        targetLanguage: 'fr',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.runtime.sendMessage as any).mockImplementation(async (message: { type: string }) => {
      if (message.type === 'GET_TAB_SESSION_STATE') {
        return { ok: true };
      }

      if (message.type === 'GET_PROVIDER_MODELS') {
        return {
          ok: true,
          models: [{ id: 'openai/gpt-4o-mini', name: 'GPT-4o mini' }],
        };
      }

      return { ok: true };
    });

    (chromeMock.tabs.sendMessage as any).mockImplementation(
      async (message: { type: string }) => {
        if (message.type === 'GET_SELECTION_STATE') {
          return { ok: true, hasSelection: false };
        }

        return {
          ok: true,
          analysis: {
            blockCount: 4,
            uniqueBlockCount: 3,
            visibleBlockCount: 2,
            sourceChars: 800,
            estimatedInputTokens: 200,
            estimatedOutputTokens: 200,
            estimatedCacheHitRatio: 0.5,
          },
        };
      },
    );

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByText('フランス語')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('言語と設定を調整する'));
    fireEvent.change(screen.getByLabelText('翻訳の雰囲気'), {
      target: { value: 'source-like' },
    });

    await waitFor(() => {
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [SETTINGS_STORAGE_KEY]: expect.objectContaining({
          style: 'source-like',
        }),
      });
    });
  });

  it('shows an unavailable-page state instead of a dead primary action', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: 'stored-key',
        model: 'openai/gpt-4o-mini',
        targetLanguage: 'ja',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.tabs.query as any).mockResolvedValue([{ id: 1, url: 'chrome://extensions/' }]);
    (chromeMock.runtime.sendMessage as any).mockImplementation(async (message: { type: string }) => {
      if (message.type === 'GET_PROVIDER_MODELS') {
        return {
          ok: true,
          models: [{ id: 'openai/gpt-4o-mini', name: 'GPT-4o mini' }],
        };
      }

      return { ok: true };
    });

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByText('このページでは使えません')).toBeInTheDocument();
    });

    expect(screen.queryByText('このページを翻訳する')).not.toBeInTheDocument();
  });

  it('treats a missing active tab url as unavailable', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: 'stored-key',
        model: 'google/gemini-3.1-flash-lite-preview',
        targetLanguage: 'ja',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.tabs.query as any).mockResolvedValue([{ id: 1, url: null }]);
    (chromeMock.runtime.sendMessage as any).mockResolvedValue({ ok: true, models: [] });

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByText('このページでは使えません')).toBeInTheDocument();
    });
  });

  it('shows a localized failure reason when the current tab translation failed', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: 'stored-key',
        model: 'openai/gpt-4o-mini',
        targetLanguage: 'ja',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.tabs.query as any).mockResolvedValue([{ id: 1, url: 'https://example.com/' }]);
    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; tabId?: number }) => {
        if (message.type === 'GET_TAB_SESSION_STATE') {
          return {
            ok: true,
            state: {
              tabId: message.tabId ?? 1,
              pageKey: 'https://example.com',
              status: 'failed',
              displayState: 'original',
              hasTranslations: false,
              progressPercent: 42,
              targetLanguage: 'ja',
              scope: 'main',
              activeSessionId: null,
              lastError: 'OpenRouter request timed out.',
            },
          };
        }

        if (message.type === 'GET_PROVIDER_MODELS') {
          return {
            ok: true,
            models: [{ id: 'openai/gpt-4o-mini', name: 'GPT-4o mini' }],
          };
        }

        return { ok: true };
      },
    );

    (chromeMock.tabs.sendMessage as any).mockImplementation(
      async (message: { type: string }) => {
        if (message.type === 'GET_SELECTION_STATE') {
          return { ok: true, hasSelection: false };
        }

        return {
          ok: true,
          analysis: {
            blockCount: 4,
            uniqueBlockCount: 3,
            visibleBlockCount: 2,
            sourceChars: 800,
            estimatedInputTokens: 200,
            estimatedOutputTokens: 200,
            estimatedCacheHitRatio: 0.5,
          },
        };
      },
    );

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByText('翻訳に失敗しました')).toBeInTheDocument();
    });

    expect(screen.getByText('原因: AI の応答が時間切れになりました。')).toBeInTheDocument();
  });

  it('shows a warning card for completed_with_warnings and jumps to unresolved blocks', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: 'stored-key',
        model: 'google/gemini-3.1-flash-lite-preview',
        targetLanguage: 'ja',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.tabs.query as any).mockResolvedValue([{ id: 1, url: 'https://example.com/' }]);
    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; tabId?: number }) => {
        if (message.type === 'GET_TAB_SESSION_STATE') {
          return {
            ok: true,
            state: {
              tabId: message.tabId ?? 1,
              pageKey: 'https://example.com',
              status: 'completed_with_warnings',
              displayState: 'translated',
              hasTranslations: true,
              progressPercent: 100,
              targetLanguage: 'ja',
              scope: 'main',
              activeSessionId: null,
              lastError: null,
              warnings: {
                totalBlocks: 2,
                retryingBlocks: 0,
                fallbackSourceBlocks: 2,
                errorBlocks: 0,
              },
            },
          };
        }

        if (message.type === 'GET_PROVIDER_MODELS') {
          return {
            ok: true,
            models: [{ id: 'google/gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite' }],
          };
        }

        return { ok: true };
      },
    );

    (chromeMock.tabs.sendMessage as any).mockImplementation(
      async (_tabId: number, message: { type: string }) => {
        if (message.type === 'GET_SELECTION_STATE') {
          return { ok: true, hasSelection: false };
        }

        if (message.type === 'GET_PAGE_ANALYSIS') {
          return {
            ok: true,
            analysis: {
              blockCount: 8,
              uniqueBlockCount: 6,
              visibleBlockCount: 3,
              sourceChars: 1400,
              estimatedInputTokens: 350,
              estimatedOutputTokens: 350,
              estimatedCacheHitRatio: 0.3,
            },
          };
        }

        if (message.type === 'FOCUS_NEXT_WARNING_BLOCK') {
          return {
            ok: true,
            message: '未解決の箇所へ移動しました。',
          };
        }

        throw new Error(`Unexpected message: ${message.type}`);
      },
    );

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByText('一部そのまま残っています')).toBeInTheDocument();
    });

    const jumpButton = screen.getByText('未解決箇所へ');
    fireEvent.click(jumpButton);

    await waitFor(() => {
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          type: 'FOCUS_NEXT_WARNING_BLOCK',
        }),
      );
    });
  });

  it('shows an API key setup link and a compact cost label', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: '',
        model: 'google/gemini-3.1-flash-lite-preview',
        targetLanguage: 'zh-CN',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.tabs.query as any).mockResolvedValue([{ id: 1, url: 'https://example.com/' }]);
    (chromeMock.runtime.sendMessage as any).mockResolvedValue({ ok: true, models: [] });

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByText('OpenRouter で API key を作る')).toBeInTheDocument();
    });

    expect(screen.getByText('OpenRouter で API key を作る').closest('a')).toHaveAttribute(
      'href',
      'https://openrouter.ai/keys',
    );
  });

  it('shows a resume primary action after a cancelled partial translation and resumes with START_TRANSLATION', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: 'stored-key',
        model: 'google/gemini-3.1-flash-lite-preview',
        targetLanguage: 'ja',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.tabs.query as any).mockResolvedValue([{ id: 1, url: 'https://example.com/' }]);
    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; tabId?: number }) => {
        if (message.type === 'GET_TAB_SESSION_STATE') {
          return {
            ok: true,
            state: {
              tabId: message.tabId ?? 1,
              pageKey: 'https://example.com',
              status: 'cancelled',
              displayState: 'mixed',
              hasTranslations: true,
              progressPercent: 45,
              targetLanguage: 'ja',
              scope: 'main',
              activeSessionId: null,
              lastError: null,
            },
          };
        }

        if (message.type === 'GET_PROVIDER_MODELS') {
          return {
            ok: true,
            models: [{ id: 'google/gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite' }],
          };
        }

        return { ok: true };
      },
    );

    (chromeMock.tabs.sendMessage as any).mockImplementation(
      async (_tabId: number, message: { type: string }) => {
        if (message.type === 'GET_SELECTION_STATE') {
          return { ok: true, hasSelection: false };
        }

        if (message.type === 'GET_PAGE_ANALYSIS') {
          return {
            ok: true,
            analysis: {
              blockCount: 8,
              uniqueBlockCount: 6,
              visibleBlockCount: 3,
              sourceChars: 1400,
              estimatedInputTokens: 350,
              estimatedOutputTokens: 350,
              estimatedCacheHitRatio: 0.3,
            },
          };
        }

        if (message.type === 'START_TRANSLATION') {
          return {
            ok: true,
            message: '見えているところから翻訳を始めました。',
          };
        }

        throw new Error(`Unexpected message: ${message.type}`);
      },
    );

    render(<PopupApp />);

    const resumeButton = await screen.findByText('続きを再開する');
    fireEvent.click(resumeButton);

    await waitFor(() => {
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          type: 'START_TRANSLATION',
        }),
      );
    });
  });
});
