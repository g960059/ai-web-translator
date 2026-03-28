import type { TabSessionState } from '../shared/types';

export const CONTEXT_MENU_IDS = {
  translateSelection: 'translate-selection',
  toggleSelection: 'toggle-selection',
  retranslateSelection: 'retranslate-selection',
  togglePage: 'toggle-page',
} as const;

const MENU_DEFINITIONS: chrome.contextMenus.CreateProperties[] = [
  {
    id: CONTEXT_MENU_IDS.translateSelection,
    title: '選択した部分を翻訳',
    contexts: ['selection'],
  },
  {
    id: CONTEXT_MENU_IDS.toggleSelection,
    title: '選択した部分の翻訳を切り替え',
    contexts: ['selection'],
    visible: false,
  },
  {
    id: CONTEXT_MENU_IDS.retranslateSelection,
    title: '選択した部分を訳し直す',
    contexts: ['selection'],
    visible: false,
  },
  {
    id: CONTEXT_MENU_IDS.togglePage,
    title: 'このページを翻訳',
    contexts: ['all'],
  },
];

let initializationPromise: Promise<void> | null = null;
let initialized = false;

type RuntimeWithLastError = typeof chrome.runtime & {
  lastError?: {
    message?: string;
  };
};

function getLastErrorMessage(): string | null {
  return (chrome.runtime as RuntimeWithLastError).lastError?.message ?? null;
}

function isIgnorableCreateError(message: string): boolean {
  return message.includes('duplicate id');
}

function isIgnorableUpdateError(message: string): boolean {
  return message.includes('Cannot find menu item with id');
}

async function createMenu(createProperties: chrome.contextMenus.CreateProperties): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    chrome.contextMenus.create(createProperties, () => {
      const errorMessage = getLastErrorMessage();
      if (errorMessage && !isIgnorableCreateError(errorMessage)) {
        reject(new Error(errorMessage));
        return;
      }
      resolve();
    });
  });
}

async function updateMenu(
  id: string,
  updateProperties: chrome.contextMenus.UpdateProperties,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    chrome.contextMenus.update(id, updateProperties, () => {
      const errorMessage = getLastErrorMessage();
      if (errorMessage && !isIgnorableUpdateError(errorMessage)) {
        reject(new Error(errorMessage));
        return;
      }
      resolve();
    });
  });
}

export async function initializeContextMenus(): Promise<void> {
  if (initialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    for (const definition of MENU_DEFINITIONS) {
      await createMenu(definition);
    }
    initialized = true;
  })().finally(() => {
    initializationPromise = null;
  });

  return initializationPromise;
}

export async function applyContextMenuState(state?: TabSessionState): Promise<void> {
  const hasTranslations = state?.hasTranslations ?? false;
  const pageTitle =
    state?.displayState === 'translated'
      ? 'このページを原文に戻す'
      : hasTranslations
        ? 'このページの翻訳を表示'
        : 'このページを翻訳';

  await updateMenu(CONTEXT_MENU_IDS.togglePage, { title: pageTitle, visible: true });
  await updateMenu(CONTEXT_MENU_IDS.toggleSelection, {
    visible: hasTranslations,
  });
  await updateMenu(CONTEXT_MENU_IDS.retranslateSelection, {
    visible: hasTranslations,
  });
  await updateMenu(CONTEXT_MENU_IDS.translateSelection, {
    visible: !hasTranslations,
  });
}
