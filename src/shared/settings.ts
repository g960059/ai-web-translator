import type { ExtensionSettings, ModelPreset } from './types';

export const SETTINGS_STORAGE_KEY = 'settings_v2';

export const MODEL_PRESETS: Record<Exclude<ModelPreset, 'custom'>, { label: string; model: string; description: string }> = {
  accurate: { label: '精度重視', model: 'anthropic/claude-sonnet-4', description: '高品質な翻訳（コスト高）' },
  balanced: { label: 'バランス', model: 'google/gemini-2.5-flash', description: '品質とコストの両立' },
  fast: { label: '高速・低コスト', model: 'google/gemini-2.5-flash-lite', description: '素早い翻訳（品質はやや低い）' },
};

export const DEFAULT_SETTINGS: ExtensionSettings = {
  provider: 'openrouter',
  apiKey: '',
  model: 'google/gemini-3.1-flash-lite-preview',
  modelPreset: 'custom',
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
