import type { SessionSnapshot, TabSessionState } from '../shared/types';

export class TabSessionStore {
  private readonly sessions = new Map<number, TabSessionState>();

  upsert(tabId: number, snapshot: SessionSnapshot): { state: TabSessionState; changed: boolean } {
    const previous = this.sessions.get(tabId);
    const nextState: TabSessionState = {
      tabId,
      ...snapshot,
    };
    const changed =
      !previous ||
      previous.pageKey !== nextState.pageKey ||
      previous.status !== nextState.status ||
      previous.displayState !== nextState.displayState ||
      previous.hasTranslations !== nextState.hasTranslations ||
      previous.progressPercent !== nextState.progressPercent ||
      previous.targetLanguage !== nextState.targetLanguage ||
      previous.scope !== nextState.scope ||
      previous.activeSessionId !== nextState.activeSessionId ||
      previous.lastError !== nextState.lastError;

    this.sessions.set(tabId, nextState);
    return {
      state: nextState,
      changed,
    };
  }

  get(tabId: number): TabSessionState | undefined {
    return this.sessions.get(tabId);
  }

  clear(tabId: number): void {
    this.sessions.delete(tabId);
  }
}
