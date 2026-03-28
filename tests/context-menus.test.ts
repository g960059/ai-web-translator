import { applyContextMenuState, initializeContextMenus } from '../src/background/context-menus';
import { getChromeMock } from './setup';

describe('background context menus', () => {
  it('ignores duplicate-id create errors during initialization', async () => {
    const chromeMock = getChromeMock();
    const runtimeWithLastError = chromeMock.runtime as typeof chromeMock.runtime & {
      lastError?: { message?: string };
    };

    (chromeMock.contextMenus.create as any).mockImplementation(
      (_properties: unknown, callback?: () => void) => {
        runtimeWithLastError.lastError = {
          message: 'Cannot create item with duplicate id toggle-page',
        };
        callback?.();
        delete runtimeWithLastError.lastError;
      },
    );

    await expect(initializeContextMenus()).resolves.toBeUndefined();
  });

  it('switches menu visibility based on translation state', async () => {
    const chromeMock = getChromeMock();

    await applyContextMenuState({
      tabId: 1,
      pageKey: 'https://example.com',
      status: 'completed',
      displayState: 'translated',
      hasTranslations: true,
      progressPercent: 100,
      targetLanguage: 'ja',
      scope: 'main',
      activeSessionId: null,
      lastError: null,
    });

    expect(chromeMock.contextMenus.update).toHaveBeenCalledWith(
      'toggle-page',
      expect.objectContaining({ title: 'このページを原文に戻す', visible: true }),
      expect.anything(),
    );
    expect(chromeMock.contextMenus.update).toHaveBeenCalledWith(
      'toggle-selection',
      expect.objectContaining({ visible: true }),
      expect.anything(),
    );
  });

  it('ignores missing-menu update errors during state refresh', async () => {
    const chromeMock = getChromeMock();
    const runtimeWithLastError = chromeMock.runtime as typeof chromeMock.runtime & {
      lastError?: { message?: string };
    };

    (chromeMock.contextMenus.update as any).mockImplementation(
      (_id: string, _properties: unknown, callback?: () => void) => {
        runtimeWithLastError.lastError = {
          message: 'Cannot find menu item with id toggle-page',
        };
        callback?.();
        delete runtimeWithLastError.lastError;
      },
    );

    await expect(applyContextMenuState()).resolves.toBeUndefined();
  });
});
