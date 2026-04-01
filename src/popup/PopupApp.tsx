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
import { DEFAULT_SETTINGS, MODEL_PRESETS, loadSettings, normalizeSettings, saveSettings } from '../shared/settings';
import type {
  ExtensionSettings,
  ModelPreset,
  PageAnalysis,
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

type PopupMode = 'setup' | 'ready' | 'active' | 'translated' | 'unavailable';
type PopupView = 'translate' | 'cache' | 'settings';

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
  const [popupView, setPopupView] = useState<PopupView>('translate');
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

  // --- Business Logic (unchanged) ---

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

  async function handlePrimaryAction(): Promise<void> {
    if (missingApiKey) { setPopupView('settings'); return; }
    if (canResumeCancelledTranslation) { await handleStartPageTranslation(); return; }
    if (hasPageTranslation) { await handleTogglePageView(); return; }
    await handleStartPageTranslation();
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

  async function handleTogglePageView(): Promise<void> {
    setWorking(true);
    try {
      const ns = normalizeSettings(settings);
      const response = await runContentAction({ type: 'TOGGLE_PAGE', settings: ns, scope: resolveScope(ns) });
      if (!response) return;
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      if (activeTabId !== null) await Promise.all([refreshTabState(activeTabId), refreshSelectionState(activeTabId)]);
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
      if (activeTabId !== null) await Promise.all([refreshAnalysis(activeTabId, ns), refreshTabState(activeTabId), refreshSelectionState(activeTabId)]);
    } finally { setWorking(false); }
  }

  async function handleClearAllCache(): Promise<void> {
    if (!confirmClearAll) { setConfirmClearAll(true); return; }
    setWorking(true);
    try {
      const response = (await chrome.runtime.sendMessage({ type: 'CLEAR_ALL_CACHE' })) as ActionResponse;
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      if (activeTabId !== null && canTranslateCurrentPage) await refreshAnalysis(activeTabId, normalizeSettings(settings));
      setConfirmClearAll(false);
    } finally { setWorking(false); }
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
      // Send to content script (not background) to properly cancel lazy session
      const response = await runContentAction({ type: 'CANCEL_TRANSLATION' });
      if (!response) return; // runContentAction already showed error
      if (activeTabId !== null) await refreshTabState(activeTabId);
      showStatus(response.message || '翻訳を止めました。', response.ok === false ? 'error' : 'info');
    } finally {
      setWorking(false);
    }
  }

  const primaryLabel = getPrimaryLabel({ missingApiKey, hasPageTranslation, canResumeCancelledTranslation, isActive, tabState });
  const currentPreset = MODEL_PRESETS[settings.modelPreset];

  // --- Render ---

  return (
    <main className="popup-shell" data-mode={popupMode}>
      {/* Tab Navigation */}
      <nav className="tab-nav" role="tablist">
        <button type="button" className="tab-button" data-active={popupView === 'translate'} onClick={() => setPopupView('translate')}>翻訳</button>
        <button type="button" className="tab-button" data-active={popupView === 'cache'} onClick={() => setPopupView('cache')}>キャッシュ</button>
        <button type="button" className="tab-button" data-active={popupView === 'settings'} onClick={() => setPopupView('settings')}>設定</button>
      </nav>

      {/* Tab: Translate */}
      {popupView === 'translate' && (
        <section className="panel panel-main">
          {popupMode === 'setup' ? (
            <div className="setup-card">
              <h2>翻訳を使う</h2>
              <p className="helper-copy">OpenRouter の API Key を設定すると翻訳を実行できます。</p>
              <button type="button" className="button button-primary" onClick={() => setPopupView('settings')}>設定へ</button>
            </div>
          ) : popupMode === 'unavailable' ? (
            <div className="focus-card">
              <h2>このページでは使えません</h2>
              <p className="helper-copy">通常の Web ページを開くと使えます。</p>
            </div>
          ) : (
            <>
              {popupMode !== 'ready' && (
                <h2 className="panel-title">{popupMode === 'active' ? '翻訳中' : '翻訳しました'}</h2>
              )}

              {/* Scope: 本文のみ / ページ全体 */}
              <div className="segment-group">
                <span className="segment-label">範囲</span>
                <div className="segment-control">
                  <button type="button" className="segment-button" data-selected={!settings.translateFullPage} onClick={() => updateSettings({ translateFullPage: false })}>本文のみ</button>
                  <button type="button" className="segment-button" data-selected={settings.translateFullPage} onClick={() => updateSettings({ translateFullPage: true })}>ページ全体</button>
                </div>
                {!settings.translateFullPage && (
                  <p className="segment-hint">ヘッダー・サイドバー・フッターを除外して翻訳</p>
                )}
              </div>

              {/* Model: fast / accurate */}
              <div className="segment-group">
                <span className="segment-label">モデル</span>
                <div className="segment-control">
                  {(Object.keys(MODEL_PRESETS) as ModelPreset[]).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="segment-button"
                      data-selected={settings.modelPreset === preset}
                      onClick={() => updateSettings({ modelPreset: preset })}
                      title={`${MODEL_PRESETS[preset].description}\n(${MODEL_PRESETS[preset].modelId})`}
                    >
                      {MODEL_PRESETS[preset].label}
                    </button>
                  ))}
                </div>
                <p className="segment-hint segment-hint-model">{currentPreset.modelId}</p>
              </div>

              {/* Cost */}
              {(popupMode === 'ready' || popupMode === 'translated') && estimatedCost !== null && (
                <p className="cost-note">{formatEstimatedCost(estimatedCost)}</p>
              )}

              {/* Progress (active) */}
              {popupMode === 'active' && tabState && (
                <div className="progress-section">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${tabState.progressPercent}%` }} />
                  </div>
                  <p className="soft-note">{translateStatus(tabState.status)} {tabState.progressPercent}%</p>
                </div>
              )}

              {/* Primary Action */}
              <div className="primary-actions">
                {popupMode === 'active' ? (
                  <button className="button button-danger" onClick={() => void handleCancelTranslation()} disabled={working || loading}>
                    翻訳を停止する
                  </button>
                ) : (
                  <button className="button button-primary" onClick={() => void handlePrimaryAction()} disabled={working || loading}>
                    {primaryLabel}
                  </button>
                )}
                {hasSelection && !missingApiKey && (
                  <button className="button button-secondary" onClick={() => void handleSelectionTranslation(false)} disabled={working || loading}>
                    この部分だけ読む
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* Tab: Cache */}
      {popupView === 'cache' && (
        <section className="panel">
          <h2 className="panel-title">翻訳済みページ</h2>

          <label className="checkbox-row">
            <input type="checkbox" checked={settings.cacheEnabled} onChange={(e) => updateSettings({ cacheEnabled: e.target.checked })} />
            <span>キャッシュを使う</span>
          </label>

          {activeTabUrl && canTranslateCurrentPage && hasPageTranslation && (
            <div className="cache-page-item">
              <div className="cache-page-info">
                <a className="cache-page-url" href={activeTabUrl} target="_blank" rel="noreferrer" title={activeTabUrl}>
                  {formatPageUrl(activeTabUrl)}
                </a>
                <span className="cache-current-badge">翻訳済み</span>
              </div>
              <button className="button button-muted cache-delete-button" onClick={() => void handleClearPageCache()} disabled={working}>
                削除
              </button>
            </div>
          )}

          <div className="tertiary-actions">
          </div>

          {confirmClearAll ? (
            <div className="confirm-inline">
              <p className="helper-copy">保存している翻訳をすべて消します。元に戻せません。</p>
              <div className="confirm-actions">
                <button type="button" className="button button-secondary" onClick={() => setConfirmClearAll(false)} disabled={working}>やめる</button>
                <button type="button" className="button button-danger" onClick={() => void handleClearAllCache()} disabled={working}>本当に消す</button>
              </div>
            </div>
          ) : (
            <button className="button button-danger" onClick={() => void handleClearAllCache()} disabled={working}>
              すべての保存済み翻訳を消す
            </button>
          )}
        </section>
      )}

      {/* Tab: Settings */}
      {popupView === 'settings' && (
        <section className="panel">
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
            <h3 className="section-title">翻訳設定</h3>

            <div className="field">
              <span>読む言語</span>
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

            <label className="field">
              <span>翻訳スタイル</span>
              <select aria-label="翻訳スタイル" value={settings.style} onChange={(e) => updateSettings({ style: e.target.value as TranslationStyle })}>
                {STYLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <p className="helper-copy">{STYLE_OPTIONS.find((o) => o.value === settings.style)?.help}</p>
            </label>
          </div>
        </section>
      )}

      {/* Status Banner */}
      {statusMessage && (
        <div className="status-banner" data-tone={statusTone}>
          <span>{statusMessage}</span>
          <button type="button" className="status-dismiss" onClick={clearStatus} aria-label="閉じる">×</button>
        </div>
      )}
    </main>
  );
}

// --- Utility functions ---

function resolveScope(settings: ExtensionSettings): 'main' | 'page' {
  return settings.translateFullPage ? 'page' : 'main';
}

function getPrimaryLabel(options: { missingApiKey: boolean; hasPageTranslation: boolean; canResumeCancelledTranslation: boolean; isActive: boolean; tabState: TabSessionState | null }): string {
  if (options.isActive) return '翻訳しています...';
  if (options.missingApiKey) return '設定へ';
  if (options.canResumeCancelledTranslation) return '続きを再開する';
  if (options.hasPageTranslation) {
    const ds = options.tabState?.displayState;
    if (ds === 'translated') return '対訳を表示';
    if (ds === 'bilingual') return '原文に戻す';
    return '翻訳のみ';
  }
  return 'このページを翻訳する';
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
