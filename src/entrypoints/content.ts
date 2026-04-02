import type {
  ActionResponse,
  AnalysisResponse,
  ContentCommandMessage,
  SessionSnapshotResponse,
  SelectionStateResponse,
} from '../shared/messages';
import { logWithContext } from '../shared/debug-log';
import { TranslationController } from '../content/translation-controller';

const controller = new TranslationController(document);
let lastObservedUrl = window.location.href;
let titleDebounceId: number | null = null;

// Auto-detect foreign language pages and show translation prompt
setTimeout(() => {
  controller.detectAndShowPrompt();
}, 1500);

chrome.runtime.onMessage.addListener((message: ContentCommandMessage, _sender, sendResponse) => {
  void controller
    .handleMessage(message)
    .then(
      (
        response:
          | ActionResponse
          | AnalysisResponse
          | SelectionStateResponse
          | SessionSnapshotResponse,
      ) => sendResponse(response),
    )
    .catch((error: unknown) => {
      logWithContext('error', '[AI Web Translator] Content command failed.', {
        type: message.type,
        error,
      });
      sendResponse({
        ok: false,
        message: error instanceof Error ? error.message : 'Unexpected content script error.',
      });
    });

  return true;
});

const resetForNavigation = () => {
  lastObservedUrl = window.location.href;
  controller.resetForNavigationIfNeeded();
};

window.addEventListener('popstate', resetForNavigation);
window.addEventListener('hashchange', resetForNavigation);
window.addEventListener('ai-web-translator:navigation', resetForNavigation);

const titleObserver = new MutationObserver(() => {
  if (titleDebounceId !== null) {
    window.clearTimeout(titleDebounceId);
  }

  titleDebounceId = window.setTimeout(() => {
    titleDebounceId = null;
    if (window.location.href !== lastObservedUrl) {
      resetForNavigation();
    }
  }, 180);
});

if (document.head) {
  titleObserver.observe(document.head, {
    subtree: true,
    childList: true,
    characterData: true,
  });
}

const URL_POLL_INTERVAL_MS = 1000;
const urlPollId = window.setInterval(() => {
  if (window.location.href !== lastObservedUrl) {
    resetForNavigation();
  }
}, URL_POLL_INTERVAL_MS);

const keepAlivePort = chrome.runtime.connect({ name: 'content-keepalive' });
keepAlivePort.onDisconnect.addListener(() => {
  window.clearInterval(urlPollId);
});

patchHistoryMethod('pushState');
patchHistoryMethod('replaceState');

function patchHistoryMethod(methodName: 'pushState' | 'replaceState'): void {
  const originalMethod = history[methodName];
  history[methodName] = function patchedHistoryMethod(
    this: History,
    ...args: Parameters<History['pushState']>
  ) {
    const result = originalMethod.apply(this, args);
    window.dispatchEvent(new Event('ai-web-translator:navigation'));
    return result;
  };
}
