import type { BuiltinModelPreset, ExtensionSettings, ModelPreset } from './types';

export const SETTINGS_STORAGE_KEY = 'settings_v2';

export const MODEL_PRESETS: Record<
  BuiltinModelPreset,
  { modelId: string; label: string; description: string; badge?: string }
> = {
  lite: {
    modelId: 'google/gemma-4-31b-it',
    label: '💰 お手軽',
    description: '低コスト — 軽い読み物に',
  },
  standard: {
    modelId: 'google/gemini-3.1-flash-lite-preview',
    label: '⚡ 標準',
    description: '品質と速度のベストバランス',
    badge: 'おすすめ',
  },
  premium: {
    modelId: 'google/gemini-3-flash-preview',
    label: '✦ プレミアム',
    description: '技術文書や数式を正確に翻訳',
  },
};

const VALID_PRESETS = new Set<ModelPreset>(['lite', 'standard', 'premium', 'custom']);
const BUILTIN_PRESETS = new Set<BuiltinModelPreset>(['lite', 'standard', 'premium']);

// Migration from old preset names
const PRESET_MIGRATION: Record<string, ModelPreset> = {
  fast: 'standard',
  accurate: 'premium',
};

export const VERIFIED_MODELS = new Set([
  'google/gemini-3.1-flash-lite-preview',
  'google/gemini-3-flash-preview',
  'google/gemma-4-31b-it',
  'qwen/qwen3.5-35b-a3b',
]);

export const DEFAULT_SETTINGS: ExtensionSettings = {
  provider: 'openrouter',
  apiKey: '',
  model: MODEL_PRESETS.standard.modelId,
  modelPreset: 'standard',
  targetLanguage: resolveDefaultTargetLanguage(),
  style: 'auto',
  translateFullPage: false,
  cacheEnabled: true,
  showOriginalOnHover: true,
  customModelId: '',
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

  // Migrate old preset names
  let rawPreset = settings?.modelPreset ?? '';
  if (PRESET_MIGRATION[rawPreset]) {
    rawPreset = PRESET_MIGRATION[rawPreset];
  }
  const modelPreset: ModelPreset =
    rawPreset && VALID_PRESETS.has(rawPreset as ModelPreset)
      ? (rawPreset as ModelPreset)
      : DEFAULT_SETTINGS.modelPreset;

  const customModelId =
    typeof settings?.customModelId === 'string' ? settings.customModelId.trim() : '';

  // Resolve model ID from preset or custom
  const model = modelPreset === 'custom'
    ? (customModelId || MODEL_PRESETS.standard.modelId)
    : (BUILTIN_PRESETS.has(modelPreset as BuiltinModelPreset)
        ? MODEL_PRESETS[modelPreset as BuiltinModelPreset].modelId
        : MODEL_PRESETS.standard.modelId);

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
    showOriginalOnHover:
      typeof settings?.showOriginalOnHover === 'boolean'
        ? settings.showOriginalOnHover
        : DEFAULT_SETTINGS.showOriginalOnHover,
    customModelId,
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
