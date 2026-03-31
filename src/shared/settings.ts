import type { ExtensionSettings, ModelPreset } from './types';

export const SETTINGS_STORAGE_KEY = 'settings_v2';

export const MODEL_PRESETS: Record<
  ModelPreset,
  { modelId: string; label: string; description: string }
> = {
  fast: {
    modelId: 'google/gemini-3.1-flash-lite-preview',
    label: '⚡ 速い',
    description: '速度優先 — 軽量な処理で素早く翻訳',
  },
  accurate: {
    modelId: 'google/gemini-3-flash-preview',
    label: '◎ 正確',
    description: '精度優先 — 技術文書や数式を正確に翻訳',
  },
};

const VALID_PRESETS = new Set<ModelPreset>(['fast', 'accurate']);

export const DEFAULT_SETTINGS: ExtensionSettings = {
  provider: 'openrouter',
  apiKey: '',
  model: MODEL_PRESETS.fast.modelId,
  modelPreset: 'fast',
  targetLanguage: resolveDefaultTargetLanguage(),
  style: 'auto',
  translateFullPage: false,
  cacheEnabled: true,
};

const VALID_STYLES = new Set<ExtensionSettings['style']>([
  'auto',
  'readable',
  'precise',
  'source-like',
]);

function resolveDefaultTargetLanguage(): string {
  if (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage) {
    return chrome.i18n.getUILanguage() || 'ja';
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  return 'ja';
}

export function normalizeSettings(
  settings: Partial<ExtensionSettings> | ExtensionSettings | undefined,
): ExtensionSettings {
  const provider = settings?.provider === 'openrouter' ? 'openrouter' : DEFAULT_SETTINGS.provider;
  const apiKey = typeof settings?.apiKey === 'string' ? settings.apiKey.trim() : DEFAULT_SETTINGS.apiKey;
  const modelPreset: ModelPreset =
    settings?.modelPreset && VALID_PRESETS.has(settings.modelPreset)
      ? settings.modelPreset
      : DEFAULT_SETTINGS.modelPreset;
  const model = MODEL_PRESETS[modelPreset].modelId;
  const targetLanguage =
    typeof settings?.targetLanguage === 'string' && settings.targetLanguage.trim().length > 0
      ? settings.targetLanguage.trim()
      : DEFAULT_SETTINGS.targetLanguage;
  const style =
    settings?.style && VALID_STYLES.has(settings.style) ? settings.style : DEFAULT_SETTINGS.style;

  return {
    provider,
    apiKey,
    model,
    modelPreset,
    targetLanguage,
    style,
    translateFullPage:
      typeof settings?.translateFullPage === 'boolean'
        ? settings.translateFullPage
        : DEFAULT_SETTINGS.translateFullPage,
    cacheEnabled:
      typeof settings?.cacheEnabled === 'boolean'
        ? settings.cacheEnabled
        : DEFAULT_SETTINGS.cacheEnabled,
  };
}

export async function loadSettings(): Promise<ExtensionSettings> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return normalizeSettings(DEFAULT_SETTINGS);
  }

  const result = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
  const stored = result[SETTINGS_STORAGE_KEY] as Partial<ExtensionSettings> | undefined;
  return normalizeSettings({
    ...DEFAULT_SETTINGS,
    ...stored,
  });
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({
    [SETTINGS_STORAGE_KEY]: normalizeSettings(settings),
  });
}
