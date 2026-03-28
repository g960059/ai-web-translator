import type { ExtensionSettings } from './types';

export const SETTINGS_STORAGE_KEY = 'settings_v2';

export const DEFAULT_SETTINGS: ExtensionSettings = {
  provider: 'openrouter',
  apiKey: '',
  model: 'google/gemini-3.1-flash-lite-preview',
  targetLanguage: resolveDefaultTargetLanguage(),
  style: 'auto',
  translateFullPage: false,
  cacheEnabled: true,
};

function resolveDefaultTargetLanguage(): string {
  if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
    return chrome.i18n.getUILanguage() || 'ja';
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  return 'ja';
}

export async function loadSettings(): Promise<ExtensionSettings> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return DEFAULT_SETTINGS;
  }

  const result = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
  const stored = result[SETTINGS_STORAGE_KEY] as Partial<ExtensionSettings> | undefined;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
  };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({
    [SETTINGS_STORAGE_KEY]: settings,
  });
}
