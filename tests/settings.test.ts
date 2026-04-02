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
