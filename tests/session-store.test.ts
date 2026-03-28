import { TabSessionStore } from '../src/background/session-store';

describe('TabSessionStore', () => {
  it('stores and clears session snapshots per tab', () => {
    const store = new TabSessionStore();
    const { state, changed } = store.upsert(7, {
      pageKey: 'https://example.com',
      status: 'completed',
      displayState: 'translated',
      hasTranslations: true,
      progressPercent: 100,
      targetLanguage: 'ja',
      scope: 'main',
      activeSessionId: null,
      lastError: null,
    });

    expect(changed).toBe(true);
    expect(store.get(7)).toEqual(state);

    store.clear(7);
    expect(store.get(7)).toBeUndefined();
  });
});
