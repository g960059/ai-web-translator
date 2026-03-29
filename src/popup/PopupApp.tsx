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
  findLanguageOption,
  formatLanguageLabel,
} from '../shared/languages';
import { localizeRuntimeError } from '../shared/error-messages';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../shared/settings';
import type {
  ExtensionSettings,
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
  'Cleared all cached translations.': '保存していた翻訳をすべて消しました。',
  'Cancelled. Start a new run when ready.': '翻訳を止めました。',
  '未解決の箇所へ移動しました。': '未解決の箇所へ移動しました。',
  '未解決の箇所は見つかりませんでした。': '未解決の箇所は見つかりませんでした。',
};

const STYLE_OPTIONS: Array<{ value: TranslationStyle; label: string; help: string }> = [
  {
    value: 'auto',
    label: '自動',
    help: 'ページに合う読みやすさを自動で選びます。',
  },
  {
    value: 'readable',
    label: '読みやすく',
    help: '自然でやさしい言い回しを優先します。',
  },
  {
    value: 'precise',
    label: '正確に',
    help: '意味の正確さを優先します。',
  },
  {
    value: 'source-like',
    label: '原文寄り',
    help: '原文の構造や雰囲気を残します。',
  },
];

type PopupMode = 'setup' | 'ready' | 'active' | 'translated' | 'unavailable';
type ActiveTabInfo = {
  id: number | null;
  url: string | null;
};

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
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const activeTabIdRef = useRef<number | null>(null);

  useEffect(() => {
    void initialize();

    const listener = (message: unknown) => {
      if (!isTabSessionUpdatedMessage(message)) {
        return;
      }

      if (message.state.tabId === activeTabIdRef.current) {
        setTabState(message.state);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  useEffect(() => {
    if (!statusMessage || statusTone === 'error') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage('');
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage, statusTone]);

  const estimatedCost =
    analysis && models.length > 0
      ? estimateCostUsd(
          settings.model,
          models,
          analysis.estimatedInputTokens,
          analysis.estimatedOutputTokens,
        )
      : null;

  const missingApiKey = settings.apiKey.trim().length === 0;
  const isActive = tabState ? ACTIVE_STATUSES.has(tabState.status) : false;
  const hasPageTranslation = Boolean(tabState?.hasTranslations);
  const canResumeCancelledTranslation =
    tabState?.status === 'cancelled' && Boolean(tabState.hasTranslations);
  const canTranslateCurrentPage = isSupportedPageUrl(activeTabUrl);
  const isUnavailablePage = !loading && !canTranslateCurrentPage;
  const selectedLanguage = findLanguageOption(settings.targetLanguage);
  const primaryLanguageOptions = languageOptions.slice(0, PRIMARY_LANGUAGE_COUNT);
  const additionalLanguageOptions = languageOptions.filter(
    (language) => !primaryLanguageOptions.some((primary) => primary.code === language.code),
  );
  const popupMode: PopupMode = isUnavailablePage
    ? 'unavailable'
    : missingApiKey
      ? 'setup'
      : isActive
        ? 'active'
        : hasPageTranslation
          ? 'translated'
          : 'ready';
  const primaryLabel = getPrimaryLabel({
    missingApiKey,
    hasPageTranslation,
    canResumeCancelledTranslation,
    isActive,
    tabState,
  });

  async function initialize(): Promise<void> {
    setLoading(true);
    try {
      const [storedSettings, activeTab] = await Promise.all([loadSettings(), getActiveTabInfo()]);
      setSettings(storedSettings);
      setActiveTabId(activeTab.id);
      setActiveTabUrl(activeTab.url);
      setHasHydrated(true);

      if (activeTab.id !== null) {
        const stateResponse = (await chrome.runtime.sendMessage({
          type: 'GET_TAB_SESSION_STATE',
          tabId: activeTab.id,
        })) as TabStateResponse;
        if (stateResponse.ok && stateResponse.state) {
          setTabState(stateResponse.state);
        }
      }

      const modelsResponse = (await chrome.runtime.sendMessage({
        type: 'GET_PROVIDER_MODELS',
      })) as ProviderModelsResponse;
      if (modelsResponse.ok && modelsResponse.models) {
        setModels(modelsResponse.models);
      }

      if (activeTab.id !== null && isSupportedPageUrl(activeTab.url)) {
        await Promise.all([
          refreshAnalysis(activeTab.id, storedSettings),
          refreshSelectionState(activeTab.id),
        ]);
      } else {
        setAnalysis(null);
        setHasSelection(false);
      }
    } catch (error) {
      showStatus(
        error instanceof Error ? localizeMessage(error.message) : 'ポップアップの読み込みに失敗しました。',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSettings(patch: Partial<ExtensionSettings>): void {
    setSettings((current) => {
      const nextSettings = {
        ...current,
        ...patch,
      };
      if (hasHydrated) {
        void saveSettings(nextSettings);
      }
      setConfirmClearAll(false);
      return nextSettings;
    });
  }

  function showStatus(message: string, tone: 'info' | 'success' | 'error' = 'info'): void {
    if (!message) {
      setStatusMessage('');
      return;
    }

    setStatusTone(tone);
    setStatusMessage(localizeMessage(message));
  }

  function clearStatus(): void {
    setStatusMessage('');
  }

  async function runContentAction(
    message: ContentCommandMessage,
  ): Promise<ActionResponse | AnalysisResponse | SelectionStateResponse | null> {
    if (activeTabId === null) {
      showStatus('通常の Web ページを開いてから使ってください。', 'error');
      return null;
    }

    try {
      clearStatus();
      return (await chrome.tabs.sendMessage(activeTabId, message)) as
        | ActionResponse
        | AnalysisResponse
        | SelectionStateResponse;
    } catch (error) {
      showStatus(
        formatTabMessagingError(error, 'このページでは拡張から翻訳できません。'),
        'error',
      );
      return null;
    }
  }

  async function handlePrimaryAction(): Promise<void> {
    if (missingApiKey) {
      showStatus('OpenRouter の API key を入れると翻訳を始められます。', 'error');
      return;
    }

    if (canResumeCancelledTranslation) {
      await handleStartPageTranslation();
      return;
    }

    if (hasPageTranslation) {
      await handleTogglePageView();
      return;
    }

    await handleStartPageTranslation();
  }

  async function handleStartPageTranslation(): Promise<void> {
    setWorking(true);
    try {
      const response = await runContentAction({
        type: 'START_TRANSLATION',
        settings,
        scope: resolveScope(settings),
      });
      if (!response) {
        return;
      }
      showStatus(
        response.message || '見えているところから翻訳を始めました。',
        response.ok === false ? 'error' : 'success',
      );
      if (activeTabId !== null) {
        await Promise.all([refreshTabState(activeTabId), refreshSelectionState(activeTabId)]);
      }
    } finally {
      setWorking(false);
    }
  }

  async function handleTogglePageView(): Promise<void> {
    setWorking(true);
    try {
      const response = await runContentAction({
        type: 'TOGGLE_PAGE',
        settings,
        scope: resolveScope(settings),
      });
      if (!response) {
        return;
      }
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      if (activeTabId !== null) {
        await Promise.all([refreshTabState(activeTabId), refreshSelectionState(activeTabId)]);
      }
    } finally {
      setWorking(false);
    }
  }

  async function handleSelectionTranslation(forceRefresh: boolean): Promise<void> {
    if (missingApiKey) {
      showStatus('OpenRouter の API key を入れると選択範囲を翻訳できます。', 'error');
      return;
    }

    setWorking(true);
    try {
      const response = await runContentAction({
        type: forceRefresh ? 'RETRANSLATE_SELECTION' : 'START_SELECTION_TRANSLATION',
        settings,
      });
      if (!response) {
        return;
      }
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      if (activeTabId !== null) {
        await Promise.all([refreshTabState(activeTabId), refreshSelectionState(activeTabId)]);
      }
    } finally {
      setWorking(false);
    }
  }

  async function handleClearPageCache(): Promise<void> {
    setWorking(true);
    try {
      const response = await runContentAction({
        type: 'CLEAR_CACHE',
        settings,
      });
      if (!response) {
        return;
      }
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      if (activeTabId !== null) {
        await Promise.all([
          refreshAnalysis(activeTabId, settings),
          refreshTabState(activeTabId),
          refreshSelectionState(activeTabId),
        ]);
      }
    } finally {
      setWorking(false);
    }
  }

  async function handleFocusWarningBlock(): Promise<void> {
    setWorking(true);
    try {
      const response = await runContentAction({
        type: 'FOCUS_NEXT_WARNING_BLOCK',
      });
      if (!response) {
        return;
      }
      showStatus(response.message || '', response.ok === false ? 'error' : 'info');
    } finally {
      setWorking(false);
    }
  }

  async function handleClearAllCache(): Promise<void> {
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      return;
    }

    setWorking(true);
    try {
      const response = (await chrome.runtime.sendMessage({
        type: 'CLEAR_ALL_CACHE',
      })) as ActionResponse;
      showStatus(response.message || '', response.ok === false ? 'error' : 'success');
      if (activeTabId !== null && canTranslateCurrentPage) {
        await refreshAnalysis(activeTabId, settings);
      }
      setConfirmClearAll(false);
    } finally {
      setWorking(false);
    }
  }

  async function refreshAnalysis(tabId: number, nextSettings: ExtensionSettings): Promise<void> {
    try {
      const response = (await chrome.tabs.sendMessage(tabId, {
        type: 'GET_PAGE_ANALYSIS',
        settings: nextSettings,
        scope: resolveScope(nextSettings),
      })) as AnalysisResponse;

      if (response.ok && response.analysis) {
        setAnalysis(response.analysis);
        return;
      }

      setAnalysis(null);
      if (response.message) {
        showStatus(response.message, 'error');
      }
    } catch (error) {
      setAnalysis(null);
      showStatus(
        formatTabMessagingError(error, 'このページでは見積もりを出せませんでした。'),
        'error',
      );
    }
  }

  async function refreshSelectionState(tabId: number): Promise<void> {
    try {
      const response = (await chrome.tabs.sendMessage(tabId, {
        type: 'GET_SELECTION_STATE',
      })) as SelectionStateResponse;
      setHasSelection(Boolean(response.ok && response.hasSelection));
    } catch {
      setHasSelection(false);
    }
  }

  async function refreshTabState(tabId: number): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'GET_TAB_SESSION_STATE',
      tabId,
    })) as TabStateResponse;
    if (response.ok) {
      setTabState(response.state ?? null);
    }
  }

  const selectedLanguageLabel = selectedLanguage?.label ?? formatLanguageLabel(settings.targetLanguage);
  const showLanguageControls = popupMode === 'ready' || popupMode === 'active' || popupMode === 'translated';
  const showPrimaryAction = popupMode !== 'unavailable';
  const showSetupCard = popupMode === 'setup';
  const showUnavailableCard = popupMode === 'unavailable';
  const canClearPageCache = !working && activeTabId !== null && !isUnavailablePage;
  const failureReason =
    tabState?.status === 'failed' ? localizeRuntimeError(tabState.lastError) : null;
  const warningSummary = tabState?.warnings ?? null;
  const hasWarnings = Boolean(warningSummary?.totalBlocks);

  return (
    <main className="popup-shell" data-mode={popupMode}>
      <section className="panel panel-main panel-main-compact">
        <div className="panel-header-row">
          <div className="panel-heading panel-heading-compact">
            <h1>{buildCompactTitle(popupMode, selectedLanguageLabel)}</h1>
            <p className="helper-copy">
              {buildCompactLead({
                mode: popupMode,
                analysis,
                translateFullPage: settings.translateFullPage,
              })}
            </p>
          </div>

          <div className="panel-header-side">
            <div className="state-chip" data-tone={getStateTone(tabState, popupMode)}>
              {renderStateLabel(tabState, loading, popupMode)}
            </div>

            {showLanguageControls && (
              <div className="meta-stack">
                <span className="mini-chip">{selectedLanguageLabel}</span>
                <span className="mini-chip">
                  {settings.translateFullPage ? 'ページ全体' : '本文だけ'}
                </span>
              </div>
            )}
          </div>
        </div>

        {showSetupCard ? (
          <div className="setup-card">
            <div className="panel-heading">
              <p className="panel-kicker">最初の設定</p>
              <h2>まずは API key をひとつ入れるだけです</h2>
              <p className="helper-copy">
                OpenRouter で API key を作ると、次からはこのページのまま読み始められます。
              </p>
            </div>

            <label className="field">
              <span>OpenRouter API key</span>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(event) => updateSettings({ apiKey: event.target.value })}
                placeholder="sk-or-v1-..."
              />
            </label>

            <a
              className="button button-secondary button-link-card"
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
            >
              OpenRouter で API key を作る
            </a>

            <p className="trust-note">
              API key はこの拡張のローカル設定に保存され、翻訳リクエストを送るときだけ OpenRouter に使われます。
            </p>
          </div>
        ) : showUnavailableCard ? (
          <div className="focus-card focus-card-warning">
            <p className="panel-kicker">このページでは使えません</p>
            <h2>通常の Web ページを開くと、そのまま翻訳できます</h2>
            <p className="helper-copy">
              Chrome の設定画面や拡張ページでは content script が動きません。記事やドキュメントのページで開き直すと使えます。
            </p>
            <p className="soft-note">設定は保持されるので、次のページではすぐ使えます。</p>
          </div>
        ) : (
          <div className="focus-card">
            <p className="panel-kicker">このタブでできること</p>
            <h2>{selectedLanguageLabel}で読みやすくする</h2>
            <p className="helper-copy">
              {buildMainSummary(analysis, settings.translateFullPage, popupMode)}
            </p>
            {failureReason && (
              <p className="soft-note soft-note-error">
                原因: {failureReason}
              </p>
            )}
            {tabState?.status === 'completed_with_warnings' && warningSummary && (
              <p className="soft-note soft-note-warning">
                {warningSummary.totalBlocks}箇所はそのまま残っています。
              </p>
            )}
            {tabState?.status === 'cancelled' && hasPageTranslation && (
              <p className="soft-note">
                止めたところから、あとで続きを再開できます。
              </p>
            )}
            {popupMode === 'translated' && estimatedCost !== null && (
              <p className="soft-note">
                このページの料金の目安は {formatEstimatedCost(estimatedCost)} です。
              </p>
            )}
            {popupMode === 'active' && (
              <p className="soft-note">
                止めたいときは、ページ右下の相棒を押してください。
              </p>
            )}
          </div>
        )}

        {hasWarnings && (
          <div className="focus-card focus-card-warning">
            <p className="panel-kicker">一部そのまま残っています</p>
            <h2>{buildWarningLead(warningSummary!)}</h2>
            <p className="helper-copy">
              {buildWarningSummaryText(warningSummary!)}
            </p>
            <div className="tertiary-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => void handleFocusWarningBlock()}
                disabled={working || loading}
              >
                未解決箇所へ
              </button>
            </div>
          </div>
        )}

        {showPrimaryAction && (
          <div className="primary-actions">
            <button
              className="button button-primary"
              onClick={() => void handlePrimaryAction()}
              disabled={working || loading || (missingApiKey && settings.apiKey.trim().length === 0)}
            >
              {primaryLabel}
            </button>

            {hasSelection && !missingApiKey && (
              <button
                className="button button-secondary"
                onClick={() => void handleSelectionTranslation(false)}
                disabled={working || loading}
              >
                この部分だけ読む
              </button>
            )}
          </div>
        )}

        {!missingApiKey && !settings.translateFullPage && !showUnavailableCard && (
          <button
            type="button"
            className="button-link"
            onClick={() => updateSettings({ translateFullPage: true })}
          >
            本文が足りないときは、ページ全体も試す
          </button>
        )}
      </section>

      <details
        className="panel details-panel"
        open={advancedOpen}
        onToggle={(event) => setAdvancedOpen((event.currentTarget as HTMLDetailsElement).open)}
      >
        <summary>言語と設定を調整する</summary>
        <p className="helper-copy">
          ふだんはこのままで大丈夫です。必要になったときだけ変えられます。
        </p>

        {popupMode !== 'setup' && (
          <section className="settings-section">
            <h3 className="section-title">接続</h3>
            <label className="field">
              <span>OpenRouter API key</span>
              <input
                type="password"
                value={settings.apiKey}
                onChange={(event) => updateSettings({ apiKey: event.target.value })}
                placeholder="sk-or-v1-..."
              />
            </label>
          </section>
        )}

        <section className="settings-section">
          <h3 className="section-title">翻訳の設定</h3>

          <div className="field">
            <span>読む言語</span>
            <div className="language-pills" role="group" aria-label="Target language">
              {primaryLanguageOptions.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  className="pill-button"
                  data-selected={settings.targetLanguage === language.code}
                  onClick={() => updateSettings({ targetLanguage: language.code })}
                >
                  <span>{language.label}</span>
                  <small>{language.nativeLabel}</small>
                </button>
              ))}
            </div>
            <label className="field field-inline">
              <span>ほかの言語</span>
              <select
                aria-label="ほかの言語"
                value={
                  primaryLanguageOptions.some((language) => language.code === settings.targetLanguage)
                    ? ''
                    : settings.targetLanguage
                }
                onChange={(event) => {
                  if (!event.target.value) {
                    return;
                  }
                  updateSettings({ targetLanguage: event.target.value });
                }}
              >
                <option value="">ほかの言語を選ぶ</option>
                {additionalLanguageOptions.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label} / {language.nativeLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>翻訳の雰囲気</span>
            <select
              aria-label="翻訳の雰囲気"
              value={settings.style}
              onChange={(event) =>
                updateSettings({
                  style: event.target.value as TranslationStyle,
                })
              }
            >
              {STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="helper-copy helper-copy-compact">
              {STYLE_OPTIONS.find((option) => option.value === settings.style)?.help}
            </p>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.translateFullPage}
              onChange={(event) => updateSettings({ translateFullPage: event.target.checked })}
            />
            <span>本文だけで足りないときは、メニューやサイドバーも含めて翻訳する</span>
          </label>
        </section>

        <section className="settings-section">
          <h3 className="section-title">モデルと保存</h3>

          <label className="field">
            <span>Model</span>
            <input
              list="model-suggestions"
              value={settings.model}
              onChange={(event) => updateSettings({ model: event.target.value })}
            />
            <datalist id="model-suggestions">
              {models.map((model) => (
                <option value={model.id} key={model.id}>
                  {model.name}
                </option>
              ))}
            </datalist>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={settings.cacheEnabled}
              onChange={(event) => updateSettings({ cacheEnabled: event.target.checked })}
            />
            <span>前に訳した同じ内容があれば、保存済みの翻訳を使う</span>
          </label>
        </section>

        <section className="settings-section settings-section-danger">
          <h3 className="section-title">データ管理</h3>

          <div className="tertiary-actions">
            <button
              className="button button-muted"
              onClick={() => void handleClearPageCache()}
              disabled={!canClearPageCache}
            >
              このページの保存済み翻訳を消す
            </button>
          </div>

          {confirmClearAll ? (
            <div className="confirm-inline">
              <p className="helper-copy helper-copy-compact">
                保存している翻訳をすべて消します。元に戻せません。
              </p>
              <div className="confirm-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setConfirmClearAll(false)}
                  disabled={working}
                >
                  やめる
                </button>
                <button
                  type="button"
                  className="button button-danger"
                  onClick={() => void handleClearAllCache()}
                  disabled={working}
                >
                  本当に消す
                </button>
              </div>
            </div>
          ) : (
            <button
              className="button button-danger"
              onClick={() => void handleClearAllCache()}
              disabled={working}
            >
              すべての保存済み翻訳を消す
            </button>
          )}
        </section>
      </details>

      {statusMessage && (
        <div className="status-banner" data-tone={statusTone}>
          <span>{statusMessage}</span>
          <button
            type="button"
            className="status-dismiss"
            onClick={clearStatus}
            aria-label="状態メッセージを閉じる"
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}

function resolveScope(settings: ExtensionSettings): 'main' | 'page' {
  return settings.translateFullPage ? 'page' : 'main';
}

function getPrimaryLabel(options: {
  missingApiKey: boolean;
  hasPageTranslation: boolean;
  canResumeCancelledTranslation: boolean;
  isActive: boolean;
  tabState: TabSessionState | null;
}): string {
  if (options.isActive) {
    return '翻訳しています...';
  }

  if (options.missingApiKey) {
    return '設定して読み始める';
  }

  if (options.canResumeCancelledTranslation) {
    return '続きを再開する';
  }

  if (options.hasPageTranslation) {
    return options.tabState?.displayState === 'translated' ? '原文に戻す' : '翻訳を表示する';
  }

  return 'このページを翻訳する';
}

function buildCompactTitle(mode: PopupMode, languageLabel: string): string {
  switch (mode) {
    case 'setup':
      return 'このページを、すぐ読めるようにします。';
    case 'unavailable':
      return 'このページでは使えません。';
    case 'active':
      return `${languageLabel}で読みやすくしています。`;
    case 'translated':
      return `${languageLabel}で読めるようにしました。`;
    case 'ready':
    default:
      return `${languageLabel}で、すぐ読めるようにします。`;
  }
}

function buildCompactLead(options: {
  mode: PopupMode;
  analysis: PageAnalysis | null;
  translateFullPage: boolean;
}): string {
  if (options.mode === 'setup') {
    return '最初に一度だけ設定すれば、次からはこのタブのまま読み始められます。';
  }

  if (options.mode === 'unavailable') {
    return '通常の Web ページを開くと使えます。';
  }

  if (options.mode === 'active') {
    return '見えているところから順に進めています。';
  }

  if (options.mode === 'translated') {
    return '本文を優先して整えました。';
  }

  if (!options.analysis) {
    return options.translateFullPage
      ? 'ページ全体を少しずつ整えます。'
      : 'まず本文から、見えているところを整えます。';
  }

  if (options.translateFullPage) {
    return 'ページ全体を対象にしつつ、見えているところから始めます。';
  }

  return 'まず本文から、見えているところを整えます。';
}

function buildMainSummary(
  analysis: PageAnalysis | null,
  translateFullPage: boolean,
  mode: PopupMode,
): string {
  if (mode === 'setup') {
    return '設定が済めば、次からは細かいことを考えずに読み始められます。';
  }

  if (mode === 'unavailable') {
    return '記事やドキュメントのページでは、そのまま本文から読みやすくできます。';
  }

  if (mode === 'translated') {
    return '必要なら原文に戻したり、文体を変えて訳し直したりできます。';
  }

  if (!analysis) {
    return translateFullPage
      ? 'ページ全体を対象にしますが、まず見えているところから始めます。'
      : '本文を優先して、見えているところから始めます。';
  }

  if (analysis.blockCount <= 6) {
    return '軽めのページなので、すぐ読み始められます。';
  }

  if (analysis.blockCount <= 16) {
    return '少し長めですが、見えているところから順に整えます。';
  }

  return translateFullPage
    ? '長いページなので、ページ全体を少しずつ整えます。'
    : '長いページなので、まず本文を優先して読みやすくします。';
}

function renderStateLabel(
  state: TabSessionState | null,
  loading: boolean,
  mode: PopupMode,
): string {
  if (loading) {
    return '読み込み中';
  }

  if (mode === 'setup') {
    return '初回設定';
  }

  if (mode === 'unavailable') {
    return '使えないページ';
  }

  if (!state) {
    return 'まだ翻訳していません';
  }

  if (state.status === 'failed') {
    return '翻訳に失敗しました';
  }

  if (state.status === 'completed_with_warnings') {
    return '一部そのまま残っています';
  }

  if (state.status === 'cancelled') {
    return '停止しました';
  }

  if (state.status === 'lazy') {
    return `必要なところから ${state.progressPercent}%`;
  }

  if (ACTIVE_STATUSES.has(state.status)) {
    return `${translateStatus(state.status)} ${state.progressPercent}%`;
  }

  switch (state.displayState) {
    case 'translated':
      return '翻訳を表示中';
    case 'mixed':
      return '一部だけ翻訳中';
    default:
      return '原文を表示中';
  }
}

function getStateTone(
  state: TabSessionState | null,
  mode: PopupMode,
): 'original' | 'translated' | 'mixed' | 'setup' | 'warning' {
  if (mode === 'setup') {
    return 'setup';
  }

  if (mode === 'unavailable') {
    return 'warning';
  }

  if (state?.status === 'completed_with_warnings') {
    return 'warning';
  }

  return state?.displayState || 'original';
}

function translateStatus(status: string): string {
  switch (status) {
    case 'scanning':
      return '読み取り中';
    case 'queued':
      return '準備中';
    case 'translating':
      return '翻訳中';
    case 'retrying':
      return '再試行中';
    case 'lazy':
      return '続き待ち';
    default:
      return status;
  }
}

async function getActiveTabInfo(): Promise<ActiveTabInfo> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return {
    id: tabs[0]?.id ?? null,
    url: tabs[0]?.url ?? null,
  };
}

function isSupportedPageUrl(url: string | null): boolean {
  if (!url) {
    return false;
  }

  const blockedPrefixes = ['chrome://', 'chrome-extension://', 'edge://', 'about:'];
  return !blockedPrefixes.some((prefix) => url.startsWith(prefix));
}

function formatEstimatedCost(cost: number): string {
  if (cost === 0) {
    return '0.1円未満';
  }

  const approxJpy = cost * APPROX_JPY_PER_USD;

  if (approxJpy < 0.1) {
    return '0.1円未満';
  }

  if (approxJpy < 1) {
    return '1円未満';
  }

  if (approxJpy < 10) {
    return `約${approxJpy.toFixed(1)}円`;
  }

  return `約${Math.round(approxJpy)}円`;
}

function formatTabMessagingError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  if (
    error.message.includes('Receiving end does not exist') ||
    error.message.includes('Could not establish connection')
  ) {
    return 'このページでは使えません。Chrome の設定画面や拡張ページではなく、通常の Web ページで試してください。';
  }

  return localizeMessage(error.message);
}

function localizeMessage(message: string): string {
  if (MESSAGE_MAP[message]) {
    return MESSAGE_MAP[message];
  }

  const localizedRuntimeError = localizeRuntimeError(message);
  if (localizedRuntimeError !== '翻訳に失敗しました。') {
    return localizedRuntimeError;
  }

  const translatedCount = message.match(/^Translated (\d+) selected blocks\.$/);
  if (translatedCount) {
    return `選択した ${translatedCount[1]} 箇所を翻訳しました。`;
  }

  const retranslatedCount = message.match(/^Re-translated (\d+) selected blocks\.$/);
  if (retranslatedCount) {
    return `選択した ${retranslatedCount[1]} 箇所を新しく翻訳しました。`;
  }

  return message;
}

function buildWarningLead(
  warningSummary: NonNullable<TabSessionState['warnings']>,
): string {
  if (warningSummary.errorBlocks > 0) {
    return `${warningSummary.totalBlocks}箇所は確認が必要です`;
  }

  return `${warningSummary.totalBlocks}箇所は原文のまま残っています`;
}

function buildWarningSummaryText(
  warningSummary: NonNullable<TabSessionState['warnings']>,
): string {
  if (warningSummary.errorBlocks > 0 && warningSummary.fallbackSourceBlocks > 0) {
    return `原文のまま残った箇所が ${warningSummary.fallbackSourceBlocks} 件、再確認が必要な箇所が ${warningSummary.errorBlocks} 件あります。`;
  }

  if (warningSummary.errorBlocks > 0) {
    return `再確認が必要な箇所が ${warningSummary.errorBlocks} 件あります。`;
  }

  return `原文のまま残った箇所が ${warningSummary.fallbackSourceBlocks} 件あります。`;
}

function isTabSessionUpdatedMessage(message: unknown): message is TabSessionUpdatedMessage {
  if (typeof message !== 'object' || message === null) {
    return false;
  }

  const candidate = message as Partial<TabSessionUpdatedMessage>;
  return candidate.type === 'TAB_SESSION_UPDATED' && candidate.state?.tabId !== undefined;
}
