import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { PopupApp } from '../src/popup/PopupApp';
import { SETTINGS_STORAGE_KEY } from '../src/shared/settings';
import { getChromeMock } from './setup';

describe('PopupApp', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads stored settings and autosaves changes via settings view', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: 'stored-key',
        model: 'google/gemini-3.1-flash-lite-preview',
        modelPreset: 'fast',
        targetLanguage: 'fr',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.runtime.sendMessage as any).mockImplementation(async (message: { type: string }) => {
      if (message.type === 'GET_TAB_SESSION_STATE') return { ok: true };
      if (message.type === 'GET_PROVIDER_MODELS') return { ok: true, models: [{ id: 'google/gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite' }] };
      return { ok: true };
    });
    (chromeMock.tabs.query as any).mockResolvedValue([{ id: 1, url: 'https://example.com/' }]);
    (chromeMock.tabs.sendMessage as any).mockImplementation(async (message: { type: string }) => {
      if (message.type === 'GET_SELECTION_STATE') return { ok: true, hasSelection: false };
      return { ok: true, analysis: { blockCount: 4, uniqueBlockCount: 3, visibleBlockCount: 2, sourceChars: 800, estimatedInputTokens: 200, estimatedOutputTokens: 200, estimatedCacheHitRatio: 0.5 } };
    });

    render(<PopupApp />);

    // Navigate to settings via gear icon
    await waitFor(() => {
      expect(screen.getByLabelText('設定')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText('設定'));

    await waitFor(() => {
      expect(screen.getAllByText('フランス語').length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByLabelText('翻訳スタイル'), { target: { value: 'source-like' } });

    await waitFor(() => {
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [SETTINGS_STORAGE_KEY]: expect.objectContaining({ style: 'source-like' }),
      });
    });
  });

  it('shows an unavailable-page state instead of a dead primary action', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: 'stored-key',
        model: 'google/gemini-3.1-flash-lite-preview',
        modelPreset: 'fast',
        targetLanguage: 'ja',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.tabs.query as any).mockResolvedValue([{ id: 1, url: 'chrome://extensions/' }]);
    (chromeMock.runtime.sendMessage as any).mockImplementation(async (message: { type: string }) => {
      if (message.type === 'GET_PROVIDER_MODELS') return { ok: true, models: [] };
      return { ok: true };
    });

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByText(/通常の Web ページを開くと翻訳できます/)).toBeInTheDocument();
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
        modelPreset: 'fast',
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
      expect(screen.getByText(/通常の Web ページを開くと翻訳できます/)).toBeInTheDocument();
    });
  });

  it('shows setup with inline API key input when key is missing', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: '',
        model: 'google/gemini-3.1-flash-lite-preview',
        modelPreset: 'fast',
        targetLanguage: 'ja',
        style: 'auto',
        translateFullPage: false,
        cacheEnabled: true,
      },
    });

    (chromeMock.tabs.query as any).mockResolvedValue([{ id: 1, url: 'https://example.com/' }]);
    (chromeMock.runtime.sendMessage as any).mockResolvedValue({ ok: true, models: [] });

    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getAllByText('接続を確認').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByPlaceholderText('sk-or-v1-...').length).toBeGreaterThan(0);
  });

  it('shows a resume primary action after a cancelled partial translation', async () => {
    const chromeMock = getChromeMock();

    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        provider: 'openrouter',
        apiKey: 'stored-key',
        model: 'google/gemini-3.1-flash-lite-preview',
        modelPreset: 'fast',
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
            state: { tabId: message.tabId ?? 1, pageKey: 'https://example.com', status: 'cancelled', displayState: 'mixed', hasTranslations: true, progressPercent: 45, targetLanguage: 'ja', scope: 'main', activeSessionId: null, lastError: null },
          };
        }
        if (message.type === 'GET_PROVIDER_MODELS') return { ok: true, models: [{ id: 'google/gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite' }] };
        return { ok: true };
      },
    );

    (chromeMock.tabs.sendMessage as any).mockImplementation(
      async (_tabId: number, message: { type: string }) => {
        if (message.type === 'GET_SELECTION_STATE') return { ok: true, hasSelection: false };
        if (message.type === 'GET_PAGE_ANALYSIS') return { ok: true, analysis: { blockCount: 8, uniqueBlockCount: 6, visibleBlockCount: 3, sourceChars: 1400, estimatedInputTokens: 350, estimatedOutputTokens: 350, estimatedCacheHitRatio: 0.3 } };
        if (message.type === 'START_TRANSLATION') return { ok: true, message: '見えているところから翻訳を始めました。' };
        throw new Error(`Unexpected message: ${message.type}`);
      },
    );

    render(<PopupApp />);

    const resumeButton = await screen.findByText('続きを再開する');
    fireEvent.click(resumeButton);

    await waitFor(() => {
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, expect.objectContaining({ type: 'START_TRANSLATION' }));
    });
  });
});
