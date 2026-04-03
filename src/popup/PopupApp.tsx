import { useEffect, useRef, useState } from 'react';
import { estimateCostUsd } from '../core/analysis';
import type {
  ActionResponse,
  AnalysisResponse,
  ContentCommandMessage,
  ProviderModelsResponse,
  SelectionStateResponse,
  TabStateResponse,
  TabSessionUpdatedMessage,
} from '../shared/messages';
import {
  languageOptions,
} from '../shared/languages';
import { localizeRuntimeError } from '../shared/error-messages';
import { getPageIndex, removePageIndexEntry, type PageIndexEntry } from '../shared/cache';
import { addBlockedSite, getBlockedSites, removeBlockedSite } from '../shared/blocked-sites';
import { DEFAULT_SETTINGS, MODEL_PRESETS, VERIFIED_MODELS, loadSettings, normalizeSettings, saveSettings } from '../shared/settings';
import type {
  BuiltinModelPreset,
  ExtensionSettings,
  PageAnalysis,
  PageDisplayState,
  ProviderModelInfo,
  TabSessionState,
  TranslationStyle,
} from '../shared/types';
import './styles.css';

const ACTIVE_STATUSES = new Set(['scanning', 'queued', 'translating', 'retrying', 'lazy']);
const PRIMARY_LANGUAGE_COUNT = 6;
const APPROX_JPY_PER_USD = 150;

const MESSAGE_MAP: Record<string, string> = {
  'No translatable blocks found on this page.':
    'このページでは翻訳できる本文が見つかりませんでした。',
  'Restored the current page.': '原文の表示に戻しました。',
  'Select text before toggling selection translation.':
    'まずページ上の文章を選択してください。',
  'Select text before translating.': '翻訳したい文章を選択してください。',
  'Add an OpenRouter API key in the popup first.':
    '先に OpenRouter の API key を設定してください。',
  'Unsupported content command.': 'この操作はまだ利用できません。',
  'Cleared cached translations for this page.': 'このページの保存済み翻訳を消しました。',
  'Showing bilingual view.': '対訳モードで表示しています。',
  'Cleared all cached translations.': '保存していた翻訳をすべて消しました。',
  'Cancelled. Start a new run when ready.': '翻訳を止めました。',
  '未解決の箇所へ移動しました。': '未解決の箇所へ移動しました。',
  '未解決の箇所は見つかりませんでした。': '未解決の箇所は見つかりませんでした。',
};

const STYLE_OPTIONS: Array<{ value: TranslationStyle; label: string; help: string }> = [
  { value: 'auto', label: '自動', help: 'ページに合う読みやすさを自動で選びます。' },
  { value: 'readable', label: '読みやすく', help: '自然でやさしい言い回しを優先します。' },
  { value: 'precise', label: '正確に', help: '意味の正確さを優先します。' },
  { value: 'source-like', label: '原文寄り', help: '原文の構造や雰囲気を残します。' },
];

const DISPLAY_MODES: Array<{ value: PageDisplayState; label: string }> = [
  { value: 'translated', label: '翻訳' },
  { value: 'bilingual', label: '両方' },
  { value: 'original', label: '原文' },
];

type PopupMode = 'setup' | 'ready' | 'active' | 'translated' | 'unavailable';
type SlideView = 'main' | 'history' | 'settings';

export function PopupApp() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [models, setModels] = useState<ProviderModelInfo[]>([]);
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState<'info' | 'success' | 'error'>('info');
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [activeTabUrl, setActiveTabUrl] = useState<string | null>(null);
  const [tabState, setTabState] = useState<TabSessionState | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [apiKeyValidation, setApiKeyValidation] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [apiKeyError, setApiKeyError] = useState('');
  const [slideView, setSlideView] = useState<SlideView>('main');
  const [pageIndex, setPageIndex] = useState<Record<string, PageIndexEntry>>({});
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [customModelSearch, setCustomModelSearch] = useState<string | null>(null);
  const activeTabIdRef = useRef<number | null>(null);

  useEffect(() => {
    void initialize();
    const listener = (message: unknown) => {
      if (!isTabSessionUpdatedMessage(message)) return;
      if (message.state.tabId === activeTabIdRef.current) setTabState(message.state);
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => { activeTabIdRef.current = activeTabId; }, [activeTabId]);

  useEffect(() => {
    if (!statusMessage || statusTone === 'error') return;
    const id = window.setTimeout(() => setStatusMessage(''), 3500);
    return () => window.clearTimeout(id);
  }, [statusMessage, statusTone]);

  useEffect(() => {
    if (slideView === 'history') {
      void getPageIndex().then(setPageIndex);
    } else if (slideView === 'settings') {
      void getBlockedSites().then(setBlockedSites);
    }
  }, [slideView]);

  // Refresh analysis when model, scope, or target language changes
  useEffect(() => {
    if (hasHydrated && activeTabId !== null && canTranslateCurrentPage) {
      void refreshAnalysis(activeTabId, settings);
    }
  }, [settings.model, settings.translateFullPage, settings.targetLanguage, settings.style]);

  const estimatedCost =
    analysis && models.length > 0
      ? estimateCostUsd(settings.model, models, analysis.estimatedInputTokens, analysis.estimatedOutputTokens)
      : null;

  const missingApiKey = settings.apiKey.trim().length === 0;
  const isActive = tabState ? ACTIVE_STATUSES.has(tabState.status) : false;
  const hasPageTranslation = Boolean(tabState?.hasTranslations);
  const canResumeCancelledTranslation = tabState?.status === 'cancelled' && Boolean(tabState.hasTranslations);
  const canTranslateCurrentPage = isSupportedPageUrl(activeTabUrl);
  const isUnavailablePage = !loading && !canTranslateCurrentPage;
  const popupMode: PopupMode = isUnavailablePage ? 'unavailable'
    : missingApiKey ? 'setup'
    : isActive ? 'active'
    : hasPageTranslation ? 'translated'
    : 'ready';

  const primaryLanguageOptions = languageOptions.slice(0, PRIMARY_LANGUAGE_COUNT);
  const additionalLanguageOptions = languageOptions.filter(
    (lang) => !primaryLanguageOptions.some((p) => p.code === lang.code),
  );

  const currentDisplayState: PageDisplayState = tabState?.displayState === 'mixed' ? 'bilingual' : (tabState?.displayState ?? 'original');
  // Source language detection not available in tab state — show only target
  const targetLanguageLabel = languageOptions.find((l) => l.code === settings.targetLanguage)?.nativeLabel ?? settings.targetLanguage;

  // --- Business Logic ---

  async function initialize(): Promise<void> {
    setLoading(true);
    try {
      const [storedSettings, activeTab] = await Promise.all([loadSettings(), getActiveTabInfo()]);
      setSettings(storedSettings);
      setActiveTabId(activeTab.id);
      setActiveTabUrl(activeTab.url);
      setHasHydrated(true);
      if (activeTab.id !== null) {
        const stateResponse = (await chrome.runtime.sendMessage({ type: 'GET_TAB_SESSION_STATE', tabId: activeTab.id })) as TabStateResponse;
        if (stateResponse.ok && stateResponse.state) setTabState(stateResponse.state);
      }
      const modelsResponse = (await chrome.runtime.sendMessage({ type: 'GET_PROVIDER_MODELS' })) as ProviderModelsResponse;
      if (modelsResponse.ok && modelsResponse.models) setModels(modelsResponse.models);
      if (activeTab.id !== null && isSupportedPageUrl(activeTab.url)) {
        await Promise.all([refreshAnalysis(activeTab.id, storedSettings), refreshSelectionState(activeTab.id)]);
      } else {
        setAnalysis(null);
        setHasSelection(false);
      }
    } catch (error) {
      showStatus(error instanceof Error ? localizeMessage(error.message) : 'ポップアップの読み込みに失敗しました。', 'error');
    } finally {
      setLoading(false);
    }
  }

  function updateSettings(patch: Partial<ExtensionSettings>): void {
    setSettings((current) => {
      const next = normalizeSettings({ ...current, ...patch });
      if (hasHydrated) void saveSettings(next);
      setConfirmClearAll(false);
      return next;
    });
  }

  function showStatus(message: string, tone: 'info' | 'success' | 'error' = 'info'): void {
    if (!message) { setStatusMessage(''); return; }
    setStatusTone(tone);
    setStatusMessage(localizeMessage(message));
  }

  function clearStatus(): void { setStatusMessage(''); }

  async function handleValidateApiKey(): Promise<void> {
    if (!settings.apiKey.trim()) return;
    setApiKeyValidation('checking');
    setApiKeyError('');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'VALIDATE_API_KEY', provider: settings.provider, apiKey: settings.apiKey }) as { ok: boolean; valid?: boolean; message?: string };
      if (response.valid) {
        setApiKeyValidation('valid');
        showStatus('API Key の接続を確認しました。', 'success');
      } else {
        setApiKeyValidation('invalid');
        setApiKeyError(response.message || 'API Key が無効です。');
        showStatus(response.message || 'API Key が無効です。', 'error');
      }
    } catch {
      setApiKeyValidation('invalid');
      setApiKeyError('検証に失敗しました。');
    }
  }

  async function runContentAction(message: ContentCommandMessage): Promise<ActionResponse | AnalysisResponse | SelectionStateResponse | null> {
    if (activeTabId === null) { showStatus('通常の Web ページを開いてから使ってください。', 'error'); return null; }
    try {
      clearStatus();
      return (await chrome.tabs.sendMessage(activeTabId, message)) as ActionResponse | AnalysisResponse | SelectionStateResponse;
    } catch (error) {
      showStatus(formatTabMessagingError(error, 'このページでは拡張から翻訳できません。'), 'error');
      return null;
    }
  }

  async function handleStartPageTranslation(): Promise<void> {
    setWorking(true);
    try {
      const ns = normalizeSettings(settings);
      if (ns.model !== settings.model || ns.targetLanguage !== settings.targetLanguage) setSettings(ns);
      const response = await runContentAction({ type: 'START_TRANSLATION', settings: ns, scope: resolveScope(ns) });
      if (!response) return;
      showStatus(response.message || '見えているところから翻訳を始めました。', response.ok === false ? 'error' : 'success');
      if (activeTabId !== null) await Promise.all([refreshTabState(activeTabId), refreshSelectionState(activeTabId)]);
    } finally { setWorking(false); }
  }

  async function handleSetDisplayMode(mode: PageDisplayState): Promise<void> {
    setWorking(true);
    try {
      const response = await runContentAction({ type: 'SET_DISPLAY_MODE', mode });
      if (!response) return;
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      if (activeTabId !== null) await refreshTabState(activeTabId);
    } finally { setWorking(false); }
  }

  async function handleSelectionTranslation(forceRefresh: boolean): Promise<void> {
    if (missingApiKey) { showStatus('OpenRouter の API key を入れると選択範囲を翻訳できます。', 'error'); return; }
    setWorking(true);
    try {
      const ns = normalizeSettings(settings);
      const response = await runContentAction({ type: forceRefresh ? 'RETRANSLATE_SELECTION' : 'START_SELECTION_TRANSLATION', settings: ns });
      if (!response) return;
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      if (activeTabId !== null) await Promise.all([refreshTabState(activeTabId), refreshSelectionState(activeTabId)]);
    } finally { setWorking(false); }
  }

  async function handleClearPageCache(): Promise<void> {
    setWorking(true);
    try {
      const ns = normalizeSettings(settings);
      const response = await runContentAction({ type: 'CLEAR_CACHE', settings: ns });
      if (!response) return;
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      if (activeTabUrl) {
        await removePageIndexEntry(activeTabUrl);
        setPageIndex((prev) => {
          const next = { ...prev };
          delete next[activeTabUrl];
          return next;
        });
      }
      if (activeTabId !== null) await Promise.all([refreshAnalysis(activeTabId, ns), refreshTabState(activeTabId), refreshSelectionState(activeTabId)]);
    } finally { setWorking(false); }
  }

  async function handleClearAllCache(): Promise<void> {
    if (!confirmClearAll) { setConfirmClearAll(true); return; }
    setWorking(true);
    try {
      const response = (await chrome.runtime.sendMessage({ type: 'CLEAR_ALL_CACHE' })) as ActionResponse;
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      setPageIndex({});
      if (activeTabId !== null && canTranslateCurrentPage) await refreshAnalysis(activeTabId, normalizeSettings(settings));
      setConfirmClearAll(false);
    } finally { setWorking(false); }
  }

  async function handleBlockCurrentSite(): Promise<void> {
    if (!activeTabUrl) return;
    try {
      const hostname = new URL(activeTabUrl).hostname;
      await addBlockedSite(hostname);
      setBlockedSites((prev) => prev.includes(hostname) ? prev : [...prev, hostname]);
      showStatus(`${hostname} を翻訳しないサイトに追加しました。`, 'success');
    } catch { /* invalid URL */ }
  }

  async function handleUnblockSite(hostname: string): Promise<void> {
    await removeBlockedSite(hostname);
    setBlockedSites((prev) => prev.filter((s) => s !== hostname));
  }

  async function handleRemoveFromPageIndex(url: string): Promise<void> {
    await removePageIndexEntry(url);
    setPageIndex((prev) => {
      const next = { ...prev };
      delete next[url];
      return next;
    });
  }

  async function refreshAnalysis(tabId: number, nextSettings: ExtensionSettings): Promise<void> {
    try {
      const response = (await chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_ANALYSIS', settings: nextSettings, scope: resolveScope(nextSettings) })) as AnalysisResponse;
      if (response.ok && response.analysis) { setAnalysis(response.analysis); return; }
      setAnalysis(null);
      if (response.message) showStatus(response.message, 'error');
    } catch (error) {
      setAnalysis(null);
      showStatus(formatTabMessagingError(error, 'このページでは見積もりを出せませんでした。'), 'error');
    }
  }

  async function refreshSelectionState(tabId: number): Promise<void> {
    try {
      const response = (await chrome.tabs.sendMessage(tabId, { type: 'GET_SELECTION_STATE' })) as SelectionStateResponse;
      setHasSelection(Boolean(response.ok && response.hasSelection));
    } catch { setHasSelection(false); }
  }

  async function refreshTabState(tabId: number): Promise<void> {
    const response = (await chrome.runtime.sendMessage({ type: 'GET_TAB_SESSION_STATE', tabId })) as TabStateResponse;
    if (response.ok) setTabState(response.state ?? null);
  }

  async function handleCancelTranslation(): Promise<void> {
    setWorking(true);
    try {
      const response = await runContentAction({ type: 'CANCEL_TRANSLATION' });
      if (!response) return;
      if (activeTabId !== null) await refreshTabState(activeTabId);
      showStatus(response.message || '翻訳を止めました。', response.ok === false ? 'error' : 'info');
    } finally {
      setWorking(false);
    }
  }

  // --- Render ---

  return (
    <div className="popup-viewport">
      <div className="slide-container" data-view={slideView}>
        {/* Main View */}
        <main className="slide-panel slide-main" data-mode={popupMode}>
          {/* Header */}
          <header className="app-header">
            <button type="button" className="header-icon" onClick={() => setSlideView('history')} aria-label="履歴" title="履歴">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
            <button type="button" className="language-indicator" onClick={() => setSlideView('settings')} title="言語設定を変更">
              {targetLanguageLabel}
            </button>
            <button type="button" className="header-icon" onClick={() => setSlideView('settings')} aria-label="設定" title="設定">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </header>

          {/* Content by mode */}
          <section className="main-content">
            {popupMode === 'setup' ? (
              <div className="setup-card">
                <h2>数式や技術用語を<br />正確に翻訳するAIアシスタント</h2>
                <label className="field">
                  <span>OpenRouter API Key</span>
                  <input type="password" value={settings.apiKey} onChange={(e) => updateSettings({ apiKey: e.target.value })} placeholder="sk-or-v1-..." />
                </label>
                <button type="button" className="button button-primary" onClick={() => void handleValidateApiKey()} disabled={!settings.apiKey.trim() || apiKeyValidation === 'checking'}>
                  {apiKeyValidation === 'checking' ? '確認中...' : '接続を確認'}
                </button>
                {apiKeyValidation === 'invalid' && apiKeyError && <p className="soft-note soft-note-error">{apiKeyError}</p>}
                {apiKeyValidation === 'valid' && <p className="soft-note" style={{ color: 'var(--green-text)' }}>接続 OK</p>}
                <a className="button button-secondary button-link-card" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">OpenRouter で API Key を作る</a>
              </div>
            ) : popupMode === 'unavailable' ? (
              <div className="focus-card">
                <p className="helper-copy">通常の Web ページを開くと翻訳できます。</p>
              </div>
            ) : (
              /* Unified layout: ready / active / translated share 5 fixed slots */
              <>
                {/* Slot 1: Model segment — always visible, disabled when not ready */}
                <div className="segment-group" {...(popupMode !== 'ready' ? { inert: '' } : {})}>
                  {settings.modelPreset === 'custom' ? (
                    <div className="custom-model-indicator">
                      <span className="custom-model-label">カスタム: <span className="custom-model-name">{settings.customModelId || '未設定'}</span></span>
                      <button type="button" className="button-link" onClick={() => setSlideView('settings')}>変更</button>
                    </div>
                  ) : (
                    <div className="segment-control" style={{ '--cols': 3 } as React.CSSProperties}>
                      {(Object.keys(MODEL_PRESETS) as BuiltinModelPreset[]).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className="segment-button"
                          data-selected={settings.modelPreset === preset}
                          onClick={() => updateSettings({ modelPreset: preset })}
                          title={MODEL_PRESETS[preset].description}
                        >
                          {MODEL_PRESETS[preset].label}
                          {MODEL_PRESETS[preset].badge && (
                            <span className="preset-badge">{MODEL_PRESETS[preset].badge}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Slot 2: Hero area — morphs by state */}
                <div className="hero-area">
                  {popupMode === 'active' ? (
                    <>
                      <div className="progress-section">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${tabState?.progressPercent ?? 0}%` }} />
                        </div>
                      </div>
                      <button className="button button-danger" onClick={() => void handleCancelTranslation()} disabled={working || loading}>
                        翻訳を停止する
                      </button>
                    </>
                  ) : popupMode === 'translated' ? (
                    <div className="display-segment">
                      <div className="display-segment-track">
                        <div
                          className="display-segment-pill"
                          style={{ transform: `translateX(${DISPLAY_MODES.findIndex((m) => m.value === currentDisplayState) * 100}%)` }}
                        />
                        {DISPLAY_MODES.map((mode) => (
                          <button
                            key={mode.value}
                            type="button"
                            className="display-segment-button"
                            data-active={currentDisplayState === mode.value}
                            onClick={() => void handleSetDisplayMode(mode.value)}
                            disabled={working}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button className="button button-primary button-hero" onClick={() => void handleStartPageTranslation()} disabled={working || loading || (settings.modelPreset === 'custom' && !settings.customModelId.trim())}>
                      {canResumeCancelledTranslation ? '続きを再開する' : 'このページを翻訳する'}
                    </button>
                  )}
                </div>

                {/* Slot 3: Status line — always present */}
                <p className="cost-note">
                  {popupMode === 'active'
                    ? <span>{translateStatus(tabState?.status ?? '')} {tabState?.progressPercent ?? 0}% — 閉じてもOK</span>
                    : popupMode === 'translated'
                      ? <span>✓ 翻訳済み</span>
                      : estimatedCost !== null
                        ? <span>
                            {formatEstimatedCost(estimatedCost)}
                            {analysis && analysis.estimatedCacheHitRatio > 0.9
                              ? '（キャッシュあり）'
                              : analysis && analysis.estimatedCacheHitRatio > 0.01
                                ? `（${Math.round(analysis.estimatedCacheHitRatio * 100)}% キャッシュ済み）`
                                : ''}
                          </span>
                        : <span>{'\u00A0'}</span>}
                </p>

                {/* Slot 4: Hover toggle — always visible, always enabled */}
                <label className="checkbox-row" style={{ justifyContent: 'center' }}>
                  <input type="checkbox" checked={settings.showOriginalOnHover} onChange={(e) => updateSettings({ showOriginalOnHover: e.target.checked })} />
                  <span>ホバーで原文を表示</span>
                </label>

                {/* Slot 5: Secondary actions — contextual */}
                <div className="secondary-actions">
                  {popupMode === 'active' ? null : (
                    <>
                      {canResumeCancelledTranslation && (
                        <button className="button button-primary" onClick={() => void handleStartPageTranslation()} disabled={working || loading}>
                          続きを再開する
                        </button>
                      )}
                      {hasSelection && (
                        <button className="button button-secondary" onClick={() => void handleSelectionTranslation(false)} disabled={working || loading}>
                          この部分だけ読む
                        </button>
                      )}
                      {popupMode === 'translated' ? (
                        <button type="button" className="button-link" onClick={() => void handleClearPageCache()} disabled={working}>
                          キャッシュを削除して再翻訳
                        </button>
                      ) : (
                        <button type="button" className="button-link" onClick={() => void handleBlockCurrentSite()}>
                          このサイトを翻訳しない
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Status Banner */}
          {statusMessage && (
            <div className="status-banner" data-tone={statusTone}>
              <span>{statusMessage}</span>
              <button type="button" className="status-dismiss" onClick={clearStatus} aria-label="閉じる">×</button>
            </div>
          )}
        </main>

        {/* Secondary Panel (conditionally rendered — only one at a time) */}
        {slideView === 'history' && (
          <section className="slide-panel slide-secondary">
            <header className="slide-header">
              <button type="button" className="back-button" onClick={() => setSlideView('main')}>← 戻る</button>
              <span className="slide-title">履歴</span>
            </header>
            <div className="slide-body">
              {Object.values(pageIndex).length > 0 ? (
                <div className="cache-page-list">
                  {Object.values(pageIndex)
                    .sort((a, b) => b.translatedAt - a.translatedAt)
                    .map((entry) => (
                      <div className="cache-page-item" key={entry.url}>
                        <div className="cache-page-info">
                          <a className="cache-page-url" href={entry.url} target="_blank" rel="noreferrer" title={entry.url}>
                            {entry.title || formatPageUrl(entry.url)}
                          </a>
                          <span className="cache-meta">{formatRelativeDate(entry.translatedAt)}</span>
                        </div>
                        <button type="button" className="button button-muted cache-delete-button" onClick={() => void handleRemoveFromPageIndex(entry.url)} disabled={working}>
                          削除
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="helper-copy" style={{ textAlign: 'center', padding: '24px 0', opacity: 0.7 }}>
                  翻訳したページがここに表示されます
                </p>
              )}

              <label className="checkbox-row">
                <input type="checkbox" checked={settings.cacheEnabled} onChange={(e) => updateSettings({ cacheEnabled: e.target.checked })} />
                <span>キャッシュを使う</span>
              </label>

              {Object.values(pageIndex).length > 0 && (
                confirmClearAll ? (
                  <div className="confirm-inline">
                    <p className="helper-copy">保存している翻訳をすべて消します。元に戻せません。</p>
                    <div className="confirm-actions">
                      <button type="button" className="button button-secondary" onClick={() => setConfirmClearAll(false)} disabled={working}>やめる</button>
                      <button type="button" className="button button-danger" onClick={() => void handleClearAllCache()} disabled={working}>本当に消す</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="button button-danger" onClick={() => void handleClearAllCache()} disabled={working}>
                    すべて削除
                  </button>
                )
              )}
            </div>
          </section>
        )}

        {slideView === 'settings' && (
          <section className="slide-panel slide-secondary">
            <header className="slide-header">
              <button type="button" className="back-button" onClick={() => setSlideView('main')}>← 戻る</button>
              <span className="slide-title">設定</span>
            </header>
            <div className="slide-body">
              <div className="settings-section">
                <h3 className="section-title">接続</h3>
                <label className="field">
                  <span>OpenRouter API Key</span>
                  <input type="password" value={settings.apiKey} onChange={(e) => updateSettings({ apiKey: e.target.value })} placeholder="sk-or-v1-..." />
                </label>
                <button type="button" className="button button-secondary" onClick={() => void handleValidateApiKey()} disabled={!settings.apiKey.trim() || apiKeyValidation === 'checking'}>
                  {apiKeyValidation === 'checking' ? '確認中...' : '接続を確認'}
                </button>
                {apiKeyValidation === 'invalid' && apiKeyError && <p className="soft-note soft-note-error">{apiKeyError}</p>}
                {apiKeyValidation === 'valid' && <p className="soft-note" style={{ color: 'var(--green-text)' }}>接続 OK</p>}
                <a className="button button-secondary button-link-card" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">OpenRouter で API Key を作る</a>
              </div>

              <div className="settings-section">
                <h3 className="section-title">読む言語</h3>
                <div className="language-pills" role="group">
                  {primaryLanguageOptions.map((lang) => (
                    <button key={lang.code} type="button" className="pill-button" data-selected={settings.targetLanguage === lang.code} onClick={() => updateSettings({ targetLanguage: lang.code })}>
                      <span>{lang.label}</span>
                      <small>{lang.nativeLabel}</small>
                    </button>
                  ))}
                </div>
                <label className="field field-inline">
                  <span>ほかの言語</span>
                  <select
                    value={primaryLanguageOptions.some((l) => l.code === settings.targetLanguage) ? '' : settings.targetLanguage}
                    onChange={(e) => { if (e.target.value) updateSettings({ targetLanguage: e.target.value }); }}
                  >
                    <option value="">ほかの言語を選ぶ</option>
                    {additionalLanguageOptions.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.label} / {lang.nativeLabel}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="settings-section">
                <h3 className="section-title">翻訳範囲</h3>
                <label className="checkbox-row">
                  <input type="checkbox" checked={!settings.translateFullPage} onChange={(e) => updateSettings({ translateFullPage: !e.target.checked })} />
                  <span>本文のみに限定する（ヘッダー・サイドバーを除外）</span>
                </label>
              </div>

              <div className="settings-section">
                <h3 className="section-title">モデル</h3>
                <div className="segment-control" style={{ '--cols': 3 } as React.CSSProperties}>
                  {(Object.keys(MODEL_PRESETS) as BuiltinModelPreset[]).map((preset) => (
                    <button key={preset} type="button" className="segment-button" data-selected={settings.modelPreset === preset} onClick={() => updateSettings({ modelPreset: preset, customModelId: '' })}>
                      {MODEL_PRESETS[preset].label}
                    </button>
                  ))}
                </div>
                <button type="button" className={`button ${settings.modelPreset === 'custom' ? 'button-primary' : 'button-secondary'}`} onClick={() => updateSettings({ modelPreset: 'custom' })} style={{ fontSize: '12px', padding: '8px 12px' }}>
                  {settings.modelPreset === 'custom' ? `カスタム: ${settings.customModelId || '未選択'}` : 'カスタムモデルを使う'}
                </button>
                {settings.modelPreset === 'custom' && (
                  <div className="custom-model-input-group">
                    <input
                      type="text"
                      className="custom-model-input"
                      value={customModelSearch ?? settings.customModelId}
                      onChange={(e) => setCustomModelSearch(e.target.value)}
                      onFocus={() => { if (customModelSearch === null) setCustomModelSearch(settings.customModelId); }}
                      onBlur={() => { setTimeout(() => setCustomModelSearch(null), 200); }}
                      placeholder="モデルを検索 (例: deepseek, gemma, qwen...)"
                    />
                    {customModelSearch !== null && (
                      <div className="model-search-results">
                        {models
                          .filter((m) => {
                            const q = customModelSearch.toLowerCase();
                            return !q || m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
                          })
                          .slice(0, 8)
                          .map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              className="model-search-item"
                              data-selected={settings.customModelId === m.id}
                              onMouseDown={(e) => { e.preventDefault(); updateSettings({ customModelId: m.id, modelPreset: 'custom' }); setCustomModelSearch(null); }}
                            >
                              <span className="model-search-name">{m.name}</span>
                              <span className="model-search-id">{m.id}</span>
                            </button>
                          ))}
                        {models.filter((m) => {
                          const q = customModelSearch.toLowerCase();
                          return !q || m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
                        }).length === 0 && (
                          <p className="model-search-empty">一致するモデルがありません</p>
                        )}
                      </div>
                    )}
                    {settings.customModelId && !VERIFIED_MODELS.has(settings.customModelId) && customModelSearch === null && (
                      <p className="soft-note" style={{ color: 'var(--accent-text)' }}>⚠️ 未検証モデルです。翻訳品質に問題が出る場合があります。</p>
                    )}
                  </div>
                )}
              </div>

              <div className="settings-section">
                <h3 className="section-title">翻訳スタイル</h3>
                <label className="field">
                  <select aria-label="翻訳スタイル" value={settings.style} onChange={(e) => updateSettings({ style: e.target.value as TranslationStyle })}>
                    {STYLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <p className="helper-copy">{STYLE_OPTIONS.find((o) => o.value === settings.style)?.help}</p>
                </label>
              </div>

              <div className="settings-section">
                <h3 className="section-title">表示</h3>
                <label className="checkbox-row">
                  <input type="checkbox" checked={settings.showOriginalOnHover} onChange={(e) => updateSettings({ showOriginalOnHover: e.target.checked })} />
                  <span>ホバーで原文を表示</span>
                </label>
              </div>

              {blockedSites.length > 0 && (
                <div className="settings-section">
                  <h3 className="section-title">翻訳しないサイト</h3>
                  {blockedSites.map((site) => (
                    <div className="cache-page-item" key={site}>
                      <span className="cache-page-url" style={{ color: 'var(--text)' }}>{site}</span>
                      <button type="button" className="button button-muted cache-delete-button" onClick={() => void handleUnblockSite(site)}>
                        解除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// --- Utility functions ---

function resolveScope(settings: ExtensionSettings): 'main' | 'page' {
  return settings.translateFullPage ? 'page' : 'main';
}

function translateStatus(status: string): string {
  switch (status) {
    case 'scanning': return '読み取り中';
    case 'queued': return '準備中';
    case 'translating': return '翻訳中';
    case 'retrying': return '再試行中';
    case 'lazy': return '続き待ち';
    default: return status;
  }
}

async function getActiveTabInfo(): Promise<{ id: number | null; url: string | null }> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return { id: tabs[0]?.id ?? null, url: tabs[0]?.url ?? null };
}

function isSupportedPageUrl(url: string | null): boolean {
  if (!url) return false;
  return !['chrome://', 'chrome-extension://', 'edge://', 'about:'].some((p) => url.startsWith(p));
}

function formatEstimatedCost(cost: number): string {
  if (cost === 0) return '0.1円未満';
  const jpy = cost * APPROX_JPY_PER_USD;
  if (jpy < 0.1) return '0.1円未満';
  if (jpy < 1) return '1円未満';
  if (jpy < 10) return `約${jpy.toFixed(1)}円`;
  return `約${Math.round(jpy)}円`;
}

function formatRelativeDate(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  const date = new Date(timestamp);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function formatPageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.length > 30 ? parsed.pathname.slice(0, 27) + '...' : parsed.pathname;
    return `${parsed.hostname}${path}`;
  } catch {
    return url.slice(0, 40);
  }
}

function formatTabMessagingError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  if (error.message.includes('Receiving end does not exist') || error.message.includes('Could not establish connection')) {
    return 'このページでは使えません。通常の Web ページで試してください。';
  }
  return localizeMessage(error.message);
}

function localizeMessage(message: string): string {
  if (MESSAGE_MAP[message]) return MESSAGE_MAP[message];
  const localized = localizeRuntimeError(message);
  if (localized !== '翻訳に失敗しました。') return localized;
  const m1 = message.match(/^Translated (\d+) selected blocks\.$/);
  if (m1) return `選択した ${m1[1]} 箇所を翻訳しました。`;
  const m2 = message.match(/^Re-translated (\d+) selected blocks\.$/);
  if (m2) return `選択した ${m2[1]} 箇所を新しく翻訳しました。`;
  return message;
}

function isTabSessionUpdatedMessage(message: unknown): message is TabSessionUpdatedMessage {
  if (typeof message !== 'object' || message === null) return false;
  const c = message as Partial<TabSessionUpdatedMessage>;
  return c.type === 'TAB_SESSION_UPDATED' && c.state?.tabId !== undefined;
}
