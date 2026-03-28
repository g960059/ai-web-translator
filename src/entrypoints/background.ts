import { applyContextMenuState, CONTEXT_MENU_IDS, initializeContextMenus } from '../background/context-menus';
import { TabSessionStore } from '../background/session-store';
import type {
  ActionResponse,
  BackgroundMessage,
  ProviderModelsResponse,
  TabStateResponse,
  TranslateApiResponse,
} from '../shared/messages';
import { clearAllTranslationCache } from '../shared/cache';
import { getTranslationProvider } from '../core/provider';
import { logWithContext } from '../shared/debug-log';
import { loadSettings } from '../shared/settings';

const sessionStore = new TabSessionStore();
const MODELS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const providerModelsCache = new Map<string, { fetchedAt: number; models: Awaited<ReturnType<ReturnType<typeof getTranslationProvider>['listModels']>> }>();
const activeTranslationControllers = new Map<number, Set<AbortController>>();

void initializeContextMenus().then(refreshActiveTabContextMenus);

chrome.runtime.onInstalled.addListener(() => {
  void initializeContextMenus().then(refreshActiveTabContextMenus);
});

chrome.tabs.onActivated.addListener(() => {
  void refreshActiveTabContextMenus();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  sessionStore.clear(tabId);
  cancelActiveTranslations(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    sessionStore.clear(tabId);
    cancelActiveTranslations(tabId);
    void refreshActiveTabContextMenus();
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) {
    return;
  }

  if (info.menuItemId === CONTEXT_MENU_IDS.translateSelection) {
    void chrome.tabs.sendMessage(tab.id, { type: 'START_SELECTION_TRANSLATION' });
    return;
  }

  if (info.menuItemId === CONTEXT_MENU_IDS.toggleSelection) {
    void chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SELECTION' });
    return;
  }

  if (info.menuItemId === CONTEXT_MENU_IDS.retranslateSelection) {
    void chrome.tabs.sendMessage(tab.id, { type: 'RETRANSLATE_SELECTION' });
    return;
  }

  if (info.menuItemId === CONTEXT_MENU_IDS.togglePage) {
    void chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PAGE' });
  }
});

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  void handleMessage(message, sender)
    .then((response) => sendResponse(response))
    .catch((error: unknown) => {
      logWithContext('error', '[AI Web Translator] Background message failed.', {
        type: message.type,
        tabId: sender.tab?.id ?? null,
        provider: message.type === 'TRANSLATE_API' ? message.request.provider : undefined,
        model: message.type === 'TRANSLATE_API' ? message.request.model : undefined,
        error,
      });
      sendResponse({
        ok: false,
        message: error instanceof Error ? error.message : 'Unexpected background error.',
      });
    });

  return true;
});

async function handleMessage(
  message: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
): Promise<TranslateApiResponse | TabStateResponse | ProviderModelsResponse | ActionResponse> {
  switch (message.type) {
    case 'TRANSLATE_API': {
      const tabId = sender.tab?.id;
      const provider = getTranslationProvider(message.request.provider);
      const abortController = new AbortController();
      if (tabId !== undefined) {
        const controllers = activeTranslationControllers.get(tabId) ?? new Set<AbortController>();
        controllers.add(abortController);
        activeTranslationControllers.set(tabId, controllers);
      }

      try {
        const result = await provider.translateBatch(message.request, {
          signal: abortController.signal,
        });
        return {
          ok: true,
          result,
        };
      } catch (error) {
        if (isCancellationError(error)) {
          return {
            ok: false,
            message: 'Cancelled. Start a new run when ready.',
          };
        }
        throw error;
      } finally {
        if (tabId !== undefined) {
          removeActiveTranslationController(tabId, abortController);
        }
      }
    }
    case 'SESSION_STATE_CHANGED': {
      const tabId = sender.tab?.id;
      if (tabId === undefined) {
        return { ok: false, message: 'Missing tab context for session update.' };
      }

      const { state, changed } = sessionStore.upsert(tabId, message.snapshot);
      if (changed) {
        try {
          await chrome.runtime.sendMessage({
            type: 'TAB_SESSION_UPDATED',
            state,
          });
        } catch (error) {
          if (!isIgnorableRuntimeMessageError(error)) {
            logWithContext('debug', '[AI Web Translator] Tab session broadcast failed.', {
              tabId,
              error,
            });
          }
        }
        await refreshActiveTabContextMenus();
      }
      return { ok: true, state };
    }
    case 'GET_TAB_SESSION_STATE': {
      return {
        ok: true,
        state: sessionStore.get(message.tabId),
      };
    }
    case 'CLEAR_ALL_CACHE': {
      await clearAllTranslationCache();
      return { ok: true, message: 'Cleared all cached translations.' };
    }
    case 'CANCEL_TRANSLATION': {
      const tabId = sender.tab?.id;
      if (tabId === undefined) {
        return { ok: false, message: 'Missing tab context for cancellation.' };
      }

      cancelActiveTranslations(tabId);
      return { ok: true, message: 'Cancelled. Start a new run when ready.' };
    }
    case 'GET_PROVIDER_MODELS': {
      const settings = await loadSettings();
      const cacheKey = settings.provider;
      const cached = providerModelsCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.fetchedAt < MODELS_CACHE_TTL_MS) {
        return {
          ok: true,
          models: cached.models,
        };
      }

      const provider = getTranslationProvider(settings.provider);
      const models = await provider.listModels();
      providerModelsCache.set(cacheKey, {
        fetchedAt: now,
        models,
      });
      return {
        ok: true,
        models,
      };
    }
    default:
      return {
        ok: false,
        message: 'Unsupported background message.',
      };
  }
}

async function refreshActiveTabContextMenus(): Promise<void> {
  await initializeContextMenus();
  const activeTab = await getActiveTab();
  const state = activeTab?.id !== undefined ? sessionStore.get(activeTab.id) : undefined;
  await applyContextMenuState(state);
}

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

function isIgnorableRuntimeMessageError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('receiving end does not exist') ||
    message.includes('could not establish connection') ||
    message.includes('extension context invalidated')
  );
}

function cancelActiveTranslations(tabId: number): void {
  const controllers = activeTranslationControllers.get(tabId);
  if (!controllers) {
    return;
  }

  controllers.forEach((controller) => controller.abort());
  activeTranslationControllers.delete(tabId);
}

function removeActiveTranslationController(tabId: number, controller: AbortController): void {
  const controllers = activeTranslationControllers.get(tabId);
  if (!controllers) {
    return;
  }

  controllers.delete(controller);
  if (controllers.size === 0) {
    activeTranslationControllers.delete(tabId);
  }
}

function isCancellationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes('cancelled');
}
