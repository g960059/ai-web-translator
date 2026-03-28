import {
  getCachedTranslation,
  setCachedTranslation,
  type TranslationCacheLookup,
} from '../src/shared/cache';
import { createSettings } from './test-utils';

function buildLookup(normalizedSource: string): TranslationCacheLookup {
  const settings = createSettings({
    model: 'google/gemini-3.1-flash-lite-preview',
    targetLanguage: 'ja',
  });

  return {
    provider: settings.provider,
    model: settings.model,
    sourceLanguage: 'en',
    targetLanguage: settings.targetLanguage,
    style: settings.style,
    contentMode: 'text',
    normalizedSource,
  };
}

describe('translation cache', () => {
  it('evicts the least recently used entry before exceeding the local-storage budget', async () => {
    const largeTranslation = (seed: string) => seed.repeat(3_000_000);
    const lookupA = buildLookup('alpha');
    const lookupB = buildLookup('beta');
    const lookupC = buildLookup('gamma');

    await setCachedTranslation(lookupA, largeTranslation('A'));
    await setCachedTranslation(lookupB, largeTranslation('B'));
    await expect(getCachedTranslation(lookupA)).resolves.not.toBeNull();

    await setCachedTranslation(lookupC, largeTranslation('C'));

    await expect(getCachedTranslation(lookupA)).resolves.not.toBeNull();
    await expect(getCachedTranslation(lookupB)).resolves.toBeNull();
    await expect(getCachedTranslation(lookupC)).resolves.not.toBeNull();
  });
});
