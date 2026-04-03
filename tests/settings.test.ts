import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  normalizeSettings,
  saveSettings,
  SETTINGS_STORAGE_KEY,
} from '../src/shared/settings';

describe('settings normalization', () => {
  it('trims model and target language when loading stored settings', async () => {
    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        ...DEFAULT_SETTINGS,
        model: ' google/gemini-3.1-flash-lite-preview ',
        targetLanguage: ' ja ',
      },
    });

    const settings = await loadSettings();

    expect(settings.model).toBe('google/gemini-3.1-flash-lite-preview');
    expect(settings.targetLanguage).toBe('ja');
  });

  it('falls back to the default model when a trimmed model is empty', () => {
    const settings = normalizeSettings({
      ...DEFAULT_SETTINGS,
      model: '   ',
    });

    expect(settings.model).toBe(DEFAULT_SETTINGS.model);
  });

  it('preserves stored translateFullPage:false when default is true', async () => {
    await chrome.storage.local.set({
      [SETTINGS_STORAGE_KEY]: {
        ...DEFAULT_SETTINGS,
        translateFullPage: false,
      },
    });

    const settings = await loadSettings();
    expect(settings.translateFullPage).toBe(false);
  });

  it('migrates old "fast" preset to "standard"', () => {
    const settings = normalizeSettings({ ...DEFAULT_SETTINGS, modelPreset: 'fast' as any });
    expect(settings.modelPreset).toBe('standard');
  });

  it('migrates old "accurate" preset to "premium"', () => {
    const settings = normalizeSettings({ ...DEFAULT_SETTINGS, modelPreset: 'accurate' as any });
    expect(settings.modelPreset).toBe('premium');
  });

  it('resolves custom model ID when preset is custom', () => {
    const settings = normalizeSettings({ ...DEFAULT_SETTINGS, modelPreset: 'custom', customModelId: 'foo/bar' });
    expect(settings.model).toBe('foo/bar');
  });

  it('falls back to standard when custom model ID is empty', () => {
    const settings = normalizeSettings({ ...DEFAULT_SETTINGS, modelPreset: 'custom', customModelId: '' });
    expect(settings.model).toBe('google/gemini-3.1-flash-lite-preview');
  });

  it('persists normalized settings', async () => {
    await saveSettings({
      ...DEFAULT_SETTINGS,
      model: ' google/gemini-3.1-flash-lite-preview ',
      targetLanguage: ' ja ',
    });

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      [SETTINGS_STORAGE_KEY]: expect.objectContaining({
        model: 'google/gemini-3.1-flash-lite-preview',
        targetLanguage: 'ja',
      }),
    });
  });
});
