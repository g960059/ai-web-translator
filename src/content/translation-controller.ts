import {
  buildTranslationContext,
  collectSelectionBlocks,
  collectTranslatableBlocks,
  debugCollectRecoveryProbe,
  isLikelyAlreadyTargetLanguage,
  isLikelyUntranslated,
  hasMixedLanguageContent,
  resolveScopeRoot,
  type BlockSeed,
} from '../core/blocks';
import {
  estimateCompletionTokensForBatch,
  estimatePromptTokensForBatch,
  estimatePromptTokensForContent,
  estimateTokensForBatches,
  type EstimateBatchShape,
  estimateTokensFromChars,
} from '../core/analysis';
import {
  normalizeHtml,
  normalizeText,
  prepareContentForTranslation,
  preparePlaceholderRichTextForTranslation,
  protectAtomicHtmlForTranslation,
  restorePreparedContent,
  canonicalizeProtectedHtmlMarkers,
  recoverMissingProtectedMarkers,
  restoreProtectedHtml,
  restorePlaceholderRichText,
  setElementHtmlContent,
  splitDenseProtectedPlaceholderRichText,
  splitPlaceholderRichTextIntoSafeSegments,
  splitHtmlIntoSafeSegments,
  extractTextFromProtectedHtml,
} from '../core/html';
import {
  getCachedTranslations,
  removeCachedTranslations,
  serializeTranslationCacheLookup,
  setCachedTranslations,
  setPageIndexEntry,
  type TranslationCacheLookup,
} from '../shared/cache';
import type {
  ActionResponse,
  AnalysisResponse,
  ContentCommandMessage,
  DebugBlocksResponse,
  SessionSnapshotResponse,
  SelectionStateResponse,
  TranslateApiResponse,
  TranslateSnippetResponse,
} from '../shared/messages';
import {
  getEstimateCalibrationSnapshot,
  recordTranslationUsageSamples,
  type EstimateCalibrationSnapshot,
} from '../shared/estimate-calibration';
import { logWithContext } from '../shared/debug-log';
import { isRetryableRuntimeError, localizeRuntimeError } from '../shared/error-messages';
import { loadSettings, normalizeSettings, SETTINGS_STORAGE_KEY } from '../shared/settings';
import type {
  BlockWarningState,
  BlockDisplayState,
  DefaultTranslationScope,
  ExtensionSettings,
  PageAnalysis,
  PageDisplayState,
  SessionRuntimeMetrics,
  SessionSnapshot,
  SessionWarningSummary,
  TranslationBatchRequest,
  TranslationContentMode,
  TranslationContext,
  TranslationFragmentRole,
  TranslationRegister,
  TranslationStatus,
  TranslationStyle,
} from '../shared/types';
import { OriginalTextTooltip } from './original-tooltip';
import { TranslationOverlay } from './overlay';

type ResolvedSettings = ExtensionSettings & {
  resolvedScope: DefaultTranslationScope;
};

interface BlockRecord {
  blockId: string;
  element: HTMLElement;
  originalHtml: string;
  originalText: string;
  translatedContent: string | null;
  contentMode: TranslationContentMode;
  displayState: BlockDisplayState;
  sectionContext: string;
  top: number;
  priorityScore: number;
  warningState: BlockWarningState;
  retryAttemptCount: number;
  lastWarningMessage: string | null;
}

interface TranslationGroup {
  groupKey: string;
  contentMode: TranslationContentMode;
  requestFragments: Array<{
    preparedContent: string;
    sourceHintText: string;
    requestContentMode: TranslationContentMode;
    restoreContentMode: TranslationContentMode;
    fragmentRole: TranslationFragmentRole;
    precedingContext?: string;
    restoreMap: Record<string, string>;
    placeholderTagMap?: Record<string, string>;
    placeholderWrapperPrefix?: string;
    placeholderWrapperSuffix?: string;
    skipWrapperRestore?: boolean;
    protectedHtmlMap?: Record<string, string>;
  }>;
  normalizedSource: string;
  joiner: string;
  cacheLookup: TranslationCacheLookup;
  cacheLookupKey: string;
  records: BlockRecord[];
  estimatedTokens: number;
  isVisible: boolean;
  isUnsafeOversizedHtml: boolean;
  sectionContext: string;
  top: number;
  priorityScore: number;
  queueClass: 'immediate' | 'lazy-visible' | 'deferred';
  isLead: boolean;
}

interface TranslationBatchItem {
  group: TranslationGroup;
  fragmentIndex: number;
  contentMode: TranslationContentMode;
  restoreContentMode: TranslationContentMode;
  preparedContent: string;
  sourceHintText: string;
  fragmentRole: TranslationFragmentRole;
  precedingContext?: string;
  restoreMap: Record<string, string>;
  placeholderTagMap?: Record<string, string>;
  placeholderWrapperPrefix?: string;
  placeholderWrapperSuffix?: string;
  skipWrapperRestore?: boolean;
  protectedHtmlMap?: Record<string, string>;
  hasMarkers: boolean;
  estimatedTokens: number;
  rawEstimatedTokens: number;
}

interface TranslationRequestResult {
  translations: string[];
  usage?: NonNullable<NonNullable<TranslateApiResponse['result']>['usage']>;
  finishReason?: string;
  providerDurationMs?: number;
}

interface BatchStrategy {
  tokenLimit: number;
  itemLimit: number;
  concurrency: number;
  minimumTokenFloor?: number;
}

interface BatchBucketLimits {
  tokenLimit: number;
  itemLimit: number;
  minimumTokenFloor?: number;
}

interface DerivedPageSnapshot {
  derivedKey: string;
  groups: TranslationGroup[];
  sourceChars: number;
  cachedTranslations?: Map<string, string>;
}

interface TranslationRuntimeState {
  calibration: EstimateCalibrationSnapshot;
  glossary: Map<string, string>;
  glossaryCandidates: Map<string, { source: string; count: number }>;
  pageRegister: TranslationRegister;
  batchScale: Record<TranslationContentMode, number>;
  successStreak: Record<TranslationContentMode, number>;
  maxConcurrency: number;
  stableBatchWins: number;
}

interface PageScanSnapshot {
  pageSignature: string;
  scope: DefaultTranslationScope;
  root: HTMLElement;
  records: BlockRecord[];
  derivedSnapshots: Map<string, DerivedPageSnapshot>;
}

interface LazyPageSession {
  sessionId: string;
  settings: ResolvedSettings;
  context: TranslationContext;
  totalJobs: number;
  processedJobs: number;
  pendingGroups: Map<string, TranslationGroup>;
  queuedGroupKeys: Set<string>;
  observedElements: Map<Element, string>;
  observer: IntersectionObserver | null;
  scrollListener: (() => void) | null;
  processing: boolean;
  cancelled: boolean;
  cacheStore?: Map<string, string>;
  runtimeState: TranslationRuntimeState;
}

const IMMEDIATE_BATCH_TOKEN_LIMIT = 1050;
const IMMEDIATE_BATCH_ITEM_LIMIT = 6;
const DEFERRED_BATCH_TOKEN_LIMIT = 6000;
const DEFERRED_BATCH_ITEM_LIMIT = 36;
const MAX_BATCH_RETRIES = 3;
const MAX_WARNING_REPAIR_ATTEMPTS = 4;
const RETRY_BACKOFF_MS = 1200;
const API_WAIT_NOTICE_MS = 5000;
const PROGRESS_EMIT_INTERVAL_MS = 250;
const MAX_TEXT_FRAGMENT_CHARS = 420;
const MAX_HTML_FRAGMENT_CHARS = 680;
const MAX_PLACEHOLDER_RICH_TEXT_CHARS = 860;
const UNSPLITTABLE_HTML_TOKEN_THRESHOLD = 560;
const OUTPUT_LIMIT_ERROR_MESSAGE = 'Provider response reached output limit.';
const LAZY_FORCE_FLUSH_BOTTOM_THRESHOLD_PX = 96;
const IMMEDIATE_GROUP_TOKEN_BUDGET = 780;
const IMMEDIATE_GROUP_LIMIT = 1;
const IMMEDIATE_CANDIDATE_VIEWPORT_MULTIPLIER = 0.95;
const IMMEDIATE_GROUP_HARD_TOKEN_CAP = 560;
const IMMEDIATE_GROUP_MAX_FRAGMENT_COUNT = 3;
const CONTINUATION_CONTEXT_CHARS = 180;
const STRUCTURAL_LABEL_TRANSLATIONS: Record<string, string> = {
  remark: '注',
  remarks: '注',
  proof: '証明',
  definition: '定義',
  lemma: '補題',
  theorem: '定理',
  corollary: '系',
  proposition: '命題',
  example: '例',
  examples: '例',
  notation: '記法',
  claim: '主張',
  warning: '注意',
};
const COMMON_HEADING_TRANSLATIONS: Record<string, Record<string, string>> = {
  ja: {
    'definition': '定義',
    'definitions': '定義',
    'definitions and concepts': '定義と概念',
    'overview': '概要',
    'introduction': 'はじめに',
    'background': '背景',
    'history': '歴史',
    'summary': 'まとめ',
    'conclusion': '結論',
    'conclusions': '結論',
    'see also': '関連項目',
    'references': '参考文献',
    'notes': '脚注',
    'footnotes': '脚注',
    'external links': '外部リンク',
    'further reading': '関連文献',
    'bibliography': '参考文献',
    'generalizations': '一般化',
    'generalization': '一般化',
    'applications': '応用',
    'examples': '例',
    'properties': '性質',
    'terminology': '用語',
    'notation': '記法',
    'motivation': '動機',
    'prerequisites': '前提条件',
    'related topics': '関連トピック',
    'gallery': 'ギャラリー',
    'contents': '目次',
    'abstract': '概要',
    'acknowledgments': '謝辞',
    'acknowledgements': '謝辞',
    'appendix': '付録',
    'methods': '方法',
    'results': '結果',
    'discussion': '議論',
    'related work': '関連研究',
    'sources': '出典',
    'citations': '引用',
    'action': '作用',
    'mapping': '写像',
    'classification': '分類',
    'comparison': '比較',
    'construction': '構成',
    'decomposition': '分解',
    'extensions': '拡張',
    'formulation': '定式化',
    'structure': '構造',
    'special cases': '特殊な場合',
    'types': '種類',
    'variants': '変種',
  },
};

function lookupCommonHeading(sourceText: string, targetLanguage: string): string | null {
  const lang = targetLanguage.toLowerCase().slice(0, 2);
  const dict = COMMON_HEADING_TRANSLATIONS[lang];
  if (!dict) {
    return null;
  }

  const key = sourceText
    .replace(/\[edit\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return dict[key] ?? null;
}

function deduplicateAdjacentSentences(text: string): string {
  const sentences = text.split(/(?<=[。！？])\s*/);
  if (sentences.length <= 1) {
    return text;
  }

  const result: string[] = [sentences[0]];
  for (let i = 1; i < sentences.length; i++) {
    const prev = result[result.length - 1];
    const curr = sentences[i];
    if (!curr || areSimilarSentences(prev, curr)) {
      continue;
    }
    result.push(curr);
  }

  return result.join('');
}

function areSimilarSentences(a: string, b: string): boolean {
  if (!a || !b) return false;
  const na = a.replace(/\s+/g, '');
  const nb = b.replace(/\s+/g, '');
  if (na === nb) return true;
  const shorter = Math.min(na.length, nb.length);
  if (shorter < 15) return false;
  let matches = 0;
  for (let i = 0; i < shorter; i++) {
    if (na[i] === nb[i]) matches++;
  }
  return matches / shorter > 0.75;
}

function looksUntranslatedShortText(translatedText: string, sourceText: string): boolean {
  const stripNoise = (text: string) =>
    text.replace(/<[^>]+>/g, '').replace(/\[edit\]/gi, '').replace(/\s+/g, ' ').trim().toLowerCase();
  return stripNoise(translatedText) === stripNoise(sourceText);
}

const LAZY_PREFETCH_MIN_TOKENS = 5200;
const LAZY_PREFETCH_MAX_EXTRA_GROUPS = 12;
const LAZY_PREFETCH_VIEWPORT_MULTIPLIER = 4;
const BATCH_SCALE_MIN = 0.75;
const BATCH_SCALE_BACKOFF = 0.75;
const MAX_GLOSSARY_HINTS = 4;
const MIN_RUNTIME_CONCURRENCY = 2;
const DEFAULT_RUNTIME_CONCURRENCY = 5;
const MAX_RUNTIME_CONCURRENCY = 6;
const RUNTIME_CONCURRENCY_PROMOTION_STREAK = 4;
const PROVIDER_WARMUP_DELAY_MS = 2_500;
class OutputLimitTranslationError extends Error {
  constructor() {
    super(OUTPUT_LIMIT_ERROR_MESSAGE);
    this.name = 'OutputLimitTranslationError';
  }
}

class FragmentCountMismatchTranslationError extends Error {
  constructor(expectedCount: number, actualCount: number) {
    super(
      `Provider returned the wrong number of translated fragments. Expected ${expectedCount}, got ${actualCount}.`,
    );
    this.name = 'FragmentCountMismatchTranslationError';
  }
}

class TranslationCancelledError extends Error {
  constructor(message = 'Cancelled. Start a new run when ready.') {
    super(message);
    this.name = 'TranslationCancelledError';
  }
}

export class TranslationController {
  private readonly blocksByElement = new Map<HTMLElement, BlockRecord>();
  private readonly pageScans = new Map<DefaultTranslationScope, PageScanSnapshot>();
  private readonly overlay: TranslationOverlay;
  private readonly originalTooltip!: OriginalTextTooltip;
  private lazyPageSession: LazyPageSession | null = null;
  private pageKey = window.location.href;
  private pageSignature = window.location.href;
  private lastProgressEmitAt = 0;
  private lastProgressPercent = -1;
  private readonly cancelledSessionIds = new Set<string>();
  private sessionMetricsStartedAt = 0;
  private sessionMetrics: SessionRuntimeMetrics | null = null;
  private prewarmTimerId: number | null = null;
  private prewarmPromise: Promise<void> | null = null;
  private prewarmKey: string | null = null;
  private providerWarmupTimerId: number | null = null;
  private providerWarmupPromise: Promise<void> | null = null;
  private providerWarmupKey: string | null = null;
  private lastFocusedWarningBlockId: string | null = null;
  private pageIndexRecorded = false;
  private lastUsedModel = '';
  private dynamicContentObserver: MutationObserver | null = null;
  private dynamicContentDebounceId: number | null = null;
  private dynamicContentTranslating = false;
  private dynamicContentPendingRescan = false;
  private dynamicContentSessionId: string | null = null;
  private lastCompletedSettings: ResolvedSettings | null = null;
  private lastCompletedContext: TranslationContext | null = null;
  private lastCompletedScope: DefaultTranslationScope | null = null;
  private pendingSnippetTranslation: {
    text: string;
    range: Range;
  } | null = null;
  private sessionSnapshot: SessionSnapshot = {
    pageKey: window.location.href,
    status: 'idle',
    displayState: 'original',
    hasTranslations: false,
    progressPercent: 0,
    targetLanguage: '',
    scope: null,
    activeSessionId: null,
    lastError: null,
    warnings: null,
    metrics: null,
  };

  constructor(private readonly documentRef: Document) {
    this.overlay = new TranslationOverlay(documentRef);
    this.overlay.onStartTranslation = () => {
      void this.translatePage();
    };
    this.overlay.onTranslateSelection = () => {
      void this.translateSelection(false);
    };
    this.overlay.onQuickTranslateSelection = () => {
      void this.quickTranslateSelection();
    };
    this.overlay.onApplySelectionInline = () => {
      void this.applySelectionTranslationInline();
    };
    this.overlay.onRetry = () => {
      void this.translatePage();
    };
    this.overlay.onCancel = () => {
      void this.cancelTranslation();
    };
    this.overlay.onFocusNextWarning = () => {
      void this.focusNextWarningBlock();
    };
    this.overlay.attachSelectionListener();
    this.originalTooltip = new OriginalTextTooltip(documentRef, (el) => {
      const record = this.blocksByElement.get(el);
      if (!record || record.displayState !== 'translated' || !record.translatedContent) {
        return null;
      }
      return {
        text: record.originalText,
        html: record.originalHtml,
        mode: record.contentMode,
      };
    });

    // React to showOriginalOnHover setting changes from popup
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes) => {
        const settingsChange = changes[SETTINGS_STORAGE_KEY];
        if (settingsChange?.newValue) {
          const show = settingsChange.newValue.showOriginalOnHover;
          if (typeof show === 'boolean') {
            this.originalTooltip.setEnabled(show);
          }
        }
      });
    }
  }

  detectAndShowPrompt(): void {
    void loadSettings()
      .then((settings) => {
        this.overlay.setTargetLanguage(settings.targetLanguage);
        this.overlay.detectAndPrompt(settings.targetLanguage);
        this.scheduleProviderWarmup(settings);
        this.schedulePagePrewarm(settings);
      })
      .catch(() => {
        const fallbackLanguage = chrome.i18n?.getUILanguage?.() ?? 'ja';
        this.overlay.setTargetLanguage(fallbackLanguage);
        this.overlay.detectAndPrompt(fallbackLanguage);
      });
  }

  async handleMessage(
    message: ContentCommandMessage,
  ): Promise<
    | ActionResponse
    | AnalysisResponse
    | DebugBlocksResponse
    | SelectionStateResponse
    | SessionSnapshotResponse
  > {
    this.resetForNavigationIfNeeded();

    switch (message.type) {
      case 'START_TRANSLATION':
        return this.translatePage(message.settings, message.scope);
      case 'TOGGLE_PAGE':
        return this.togglePage(message.settings, message.scope);
      case 'SET_DISPLAY_MODE':
        return this.setDisplayMode(message.mode);
      case 'START_SELECTION_TRANSLATION':
        return this.translateSelection(false, message.settings);
      case 'TOGGLE_SELECTION':
        return this.toggleSelection(message.settings);
      case 'RETRANSLATE_SELECTION':
        return this.translateSelection(true, message.settings);
      case 'CLEAR_CACHE':
        return this.clearPageCache(message.settings);
      case 'CANCEL_TRANSLATION':
        return this.cancelTranslation();
      case 'FOCUS_NEXT_WARNING_BLOCK':
        return this.focusNextWarningBlock();
      case 'GET_PAGE_ANALYSIS':
        return this.getPageAnalysis(message.settings, message.scope);
      case 'GET_DEBUG_BLOCKS':
        return this.getDebugBlocks(message.settings, message.scope);
      case 'GET_SELECTION_STATE':
        return {
          ok: true,
          hasSelection: this.collectSelectionRecords().length > 0,
        };
      case 'GET_SESSION_SNAPSHOT':
        return {
          ok: true,
          snapshot: this.sessionSnapshot,
        };
      default:
        return {
          ok: false,
          message: 'Unsupported content command.',
        };
    }
  }

  resetForNavigationIfNeeded(): void {
    const nextSignature = window.location.href;
    if (nextSignature === this.pageSignature) {
      return;
    }

    if (this.sessionSnapshot.activeSessionId) {
      this.cancelledSessionIds.add(this.sessionSnapshot.activeSessionId);
      void chrome.runtime.sendMessage({ type: 'CANCEL_TRANSLATION' }).catch(() => undefined);
    }
    this.cancelLazyPageSession(false);
    this.teardownDynamicContentObserver();
    this.originalTooltip.setEnabled(false);
    this.cancelPrewarm();
    this.pageSignature = nextSignature;
    this.pageKey = window.location.href;
    this.blocksByElement.clear();
    this.pageScans.clear();
    this.overlay.hide();
    this.lastProgressEmitAt = 0;
    this.lastProgressPercent = -1;
    this.sessionMetrics = null;
    this.sessionMetricsStartedAt = 0;
    this.sessionSnapshot = {
      pageKey: this.pageKey,
      status: 'idle',
      displayState: 'original',
      hasTranslations: false,
      progressPercent: 0,
      targetLanguage: '',
      scope: null,
      activeSessionId: null,
      lastError: null,
      warnings: null,
      metrics: null,
    };
    this.lastFocusedWarningBlockId = null;
    this.pendingSnippetTranslation = null;
    this.emitSnapshot();
  }

  private async cancelTranslation(): Promise<ActionResponse> {
    const sessionId = this.sessionSnapshot.activeSessionId ?? this.lazyPageSession?.sessionId;
    if (!sessionId) {
      return { ok: true, message: 'Cancelled. Start a new run when ready.' };
    }

    this.cancelledSessionIds.add(sessionId);
    this.cancelLazyPageSession(false);
    this.teardownDynamicContentObserver();
    await chrome.runtime.sendMessage({ type: 'CANCEL_TRANSLATION' }).catch(() => undefined);

    this.setSnapshot(
      {
        status: 'cancelled',
        activeSessionId: null,
        lastError: null,
      },
      { immediate: true },
    );

    if (this.sessionSnapshot.hasTranslations) {
      this.overlay.setResting('翻訳を止めました。', 1800, {
        resumeAvailable: true,
      });
    } else {
      this.overlay.showIdleIcon();
      this.overlay.showNotice('翻訳を止めました。', 1400);
    }

    return {
      ok: true,
      message: 'Cancelled. Start a new run when ready.',
    };
  }

  private async focusNextWarningBlock(): Promise<ActionResponse> {
    const warningRecords = this.collectWarningRecords();
    if (warningRecords.length === 0) {
      return {
        ok: false,
        message: '未解決の箇所は見つかりませんでした。',
      };
    }

    const currentIndex = this.lastFocusedWarningBlockId
      ? warningRecords.findIndex((record) => record.blockId === this.lastFocusedWarningBlockId)
      : -1;
    const nextRecord = warningRecords[(currentIndex + 1) % warningRecords.length];

    nextRecord.element.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
    this.lastFocusedWarningBlockId = nextRecord.blockId;

    if (this.sessionSnapshot.status === 'completed_with_warnings') {
      this.overlay.setWarningResting(
        buildWarningSummaryMessage(this.sessionSnapshot.warnings ?? null),
        {
          warningAvailable: true,
        },
      );
    }

    return {
      ok: true,
      message: '未解決の箇所へ移動しました。',
    };
  }

  private async translatePage(
    providedSettings?: ExtensionSettings,
    providedScope?: DefaultTranslationScope,
  ): Promise<ActionResponse> {
    this.cancelLazyPageSession();
    this.cancelProviderWarmup();
    const settings = await this.resolveSettings(providedSettings, providedScope);
    await this.awaitMatchingPrewarm(settings);
    const context = this.buildContext(settings.targetLanguage);
    const scan = this.collectPageScan(settings.resolvedScope);
    const derived = await this.getOrCreateDerivedPageSnapshot(scan, settings, context);
    return this.translatePageSnapshot(derived, settings, context);
  }

  private async togglePage(
    providedSettings?: ExtensionSettings,
    providedScope?: DefaultTranslationScope,
  ): Promise<ActionResponse> {
    const settings = await this.resolveSettings(providedSettings, providedScope);
    const records = this.collectPageScan(settings.resolvedScope).records;
    if (records.length === 0) {
      return { ok: false, message: 'No translatable blocks found on this page.' };
    }

    if (records.every((record) => record.displayState === 'translated')) {
      // translated -> bilingual
      this.applyBilingualDisplay(records);
      this.refreshDisplayState();
      return { ok: true, message: 'Showing bilingual view.' };
    }

    if (this.sessionSnapshot.displayState === 'bilingual') {
      // bilingual -> original
      this.removeBilingualElements();
      this.cancelLazyPageSession();
      this.restoreRecords(records);
      this.setSnapshot({
        status: 'idle',
        scope: settings.resolvedScope,
        targetLanguage: settings.targetLanguage,
        activeSessionId: null,
        progressPercent: 0,
      });
      this.refreshOverlayForIdleState();
      return { ok: true, message: 'Restored the current page.' };
    }

    return this.translatePage(providedSettings, providedScope);
  }

  private async toggleSelection(providedSettings?: ExtensionSettings): Promise<ActionResponse> {
    this.cancelLazyPageSession();
    const settings = await this.resolveSettings(providedSettings);
    const records = this.collectSelectionRecords();
    if (records.length === 0) {
      return { ok: false, message: 'Select text before toggling selection translation.' };
    }

    if (records.every((record) => record.displayState === 'translated')) {
      this.restoreRecords(records);
      this.setSnapshot({
        status: 'idle',
        scope: settings.resolvedScope,
        targetLanguage: settings.targetLanguage,
        progressPercent: 0,
        activeSessionId: null,
      });
      this.refreshOverlayForIdleState();
      return { ok: true, message: 'Restored the selected blocks.' };
    }

    const context = this.buildContext(settings.targetLanguage);
    const groups = this.buildDerivedGroups(records, settings, context);
    return this.translatePreparedGroups({
      groups,
      settings,
      context,
      scope: settings.resolvedScope,
      forceRefresh: false,
      statusLabel: `Translated ${records.length} selected blocks.`,
      allowLazy: false,
    });
  }

  private async translateSelection(
    forceRefresh: boolean,
    providedSettings?: ExtensionSettings,
  ): Promise<ActionResponse> {
    this.cancelLazyPageSession();
    this.cancelProviderWarmup();
    const settings = await this.resolveSettings(providedSettings);
    const records = this.collectSelectionRecords();
    if (records.length === 0) {
      return { ok: false, message: 'Select text before translating.' };
    }

    if (forceRefresh) {
      await this.clearCacheForRecords(records, settings);
      records.forEach((record) => {
        record.translatedContent = null;
        record.displayState = 'original';
        this.clearBlockWarning(record);
      });
    }

    const context = this.buildContext(settings.targetLanguage);
    const groups = this.buildDerivedGroups(records, settings, context);
    return this.translatePreparedGroups({
      groups,
      settings,
      context,
      scope: settings.resolvedScope,
      forceRefresh,
      statusLabel: forceRefresh
        ? `Re-translated ${records.length} selected blocks.`
        : `Translated ${records.length} selected blocks.`,
      allowLazy: false,
    });
  }

  private async quickTranslateSelection(): Promise<void> {
    const selection = this.documentRef.getSelection();
    const text = selection?.toString().trim() ?? '';
    if (!text) {
      return;
    }

    const rect = this.overlay.getSelectionRect();
    if (!rect) {
      return;
    }

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0).cloneRange();
    this.pendingSnippetTranslation = null;

    this.overlay.showTranslationPopoverLoading(rect);

    try {
      const settings = await loadSettings();
      const sourceLanguage =
        this.documentRef.documentElement.lang || 'auto';

      const response = (await chrome.runtime.sendMessage({
        type: 'TRANSLATE_SNIPPET',
        text,
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        sourceLanguage,
        targetLanguage: settings.targetLanguage,
        style: settings.style,
        pageRegister: resolvePageRegister(settings.style),
      })) as TranslateSnippetResponse;

      if (!response.ok || !response.translatedText) {
        this.overlay.hideTranslationPopover();
        this.overlay.showNotice(
          localizeRuntimeError(response.message ?? '翻訳に失敗しました。'),
          3000,
        );
        return;
      }

      this.pendingSnippetTranslation = {
        text: response.translatedText,
        range,
      };

      // Re-read rect in case selection shifted during translation
      const updatedRect = this.overlay.getSelectionRect() ?? rect;
      this.overlay.showTranslationPopover(response.translatedText, updatedRect);
    } catch (error) {
      this.pendingSnippetTranslation = null;
      this.overlay.hideTranslationPopover();
      const message =
        error instanceof Error ? error.message : '翻訳に失敗しました。';
      this.overlay.showNotice(localizeRuntimeError(message), 3000);
    }
  }

  private async applySelectionTranslationInline(): Promise<void> {
    const pending = this.pendingSnippetTranslation;
    if (!pending) {
      return;
    }
    this.pendingSnippetTranslation = null;

    if (!this.applySnippetTranslationToRange(pending.range, pending.text)) {
      this.overlay.showNotice('選択箇所に反映できませんでした。もう一度選択してください。', 2600);
      return;
    }

    this.overlay.showNotice('選択箇所に反映しました。', 1800);
  }

  private applySnippetTranslationToRange(range: Range, translatedText: string): boolean {
    if (!range.startContainer.isConnected || !range.endContainer.isConnected) {
      return false;
    }

    try {
      range.deleteContents();
      range.insertNode(this.documentRef.createTextNode(translatedText));
      this.documentRef.getSelection()?.removeAllRanges();
      return true;
    } catch {
      return false;
    }
  }

  private async clearPageCache(providedSettings?: ExtensionSettings): Promise<ActionResponse> {
    this.cancelLazyPageSession();
    const settings = await this.resolveSettings(providedSettings);
    const records = this.collectPageScan(settings.resolvedScope).records;
    await this.clearCacheForRecords(records, settings);
    // Clear translatedContent BEFORE restoreRecords so that
    // refreshDisplayState (called inside restoreRecords) correctly
    // recomputes hasTranslations as false.
    records.forEach((record) => {
      record.translatedContent = null;
    });
    this.restoreRecords(records);
    this.pageScans.clear();

    this.setSnapshot({
      status: 'idle',
      progressPercent: 0,
      activeSessionId: null,
      scope: settings.resolvedScope,
      targetLanguage: settings.targetLanguage,
    });
    this.refreshOverlayForIdleState();

    return { ok: true, message: 'Cleared cached translations for this page.' };
  }

  private async getPageAnalysis(
    providedSettings?: ExtensionSettings,
    providedScope?: DefaultTranslationScope,
  ): Promise<AnalysisResponse> {
    const settings = await this.resolveSettings(providedSettings, providedScope);
    await this.awaitMatchingPrewarm(settings);
    const context = this.buildContext(settings.targetLanguage);
    const scan = this.collectPageScan(settings.resolvedScope);
    const derived = await this.getOrCreateDerivedPageSnapshot(scan, settings, context);
    const analysis = await this.analyzePageSnapshot(scan, derived, settings);
    return {
      ok: true,
      analysis,
    };
  }

  private async getDebugBlocks(
    providedSettings?: ExtensionSettings,
    providedScope?: DefaultTranslationScope,
  ): Promise<DebugBlocksResponse> {
    const settings = await this.resolveSettings(providedSettings, providedScope);
    await this.awaitMatchingPrewarm(settings);
    const context = this.buildContext(settings.targetLanguage);
    const scan = this.collectPageScan(settings.resolvedScope);
    const derived = await this.getOrCreateDerivedPageSnapshot(scan, settings, context);

    return {
      ok: true,
      debug: {
        pageKey: this.pageKey,
        scope: settings.resolvedScope,
        root: this.describeElement(scan.root),
        recoveryProbe: debugCollectRecoveryProbe(scan.root),
        recordCount: scan.records.length,
        records: scan.records.slice(0, 12).map((record) => ({
          ...this.describeElement(record.element),
          contentMode: record.contentMode,
          textLength: record.originalText.length,
          htmlLength: record.originalHtml.length,
          preview: record.originalText.slice(0, 180),
        })),
        groupCount: derived.groups.length,
        groups: derived.groups.slice(0, 12).map((group) => ({
          contentMode: group.contentMode,
          queueClass: group.queueClass,
          recordCount: group.records.length,
          fragmentCount: group.requestFragments.length,
          estimatedTokens: group.estimatedTokens,
          skipWrapperRestore: group.requestFragments.some((fragment) => fragment.skipWrapperRestore),
          hasProtectedMarkers: group.requestFragments.some((fragment) =>
            Boolean(fragment.protectedHtmlMap && Object.keys(fragment.protectedHtmlMap).length > 0),
          ),
          preview: group.records[0]?.originalText.slice(0, 180) ?? '',
          element: group.records[0] ? this.describeElement(group.records[0].element) : null,
        })),
      },
    };
  }

  private async translatePageSnapshot(
    derived: DerivedPageSnapshot,
    settings: ResolvedSettings,
    context: TranslationContext,
  ): Promise<ActionResponse> {
    return this.translatePreparedGroups({
      groups: derived.groups,
      settings,
      context,
      scope: settings.resolvedScope,
      forceRefresh: false,
      statusLabel: `Translated ${derived.groups.reduce((count, group) => count + group.records.length, 0)} blocks.`,
      allowLazy: true,
      cachedTranslations: derived.cachedTranslations,
      cacheStore: derived.cachedTranslations,
    });
  }

  private async translatePreparedGroups(options: {
    groups: TranslationGroup[];
    settings: ResolvedSettings;
    context: TranslationContext;
    scope: DefaultTranslationScope;
    forceRefresh: boolean;
    statusLabel: string;
    allowLazy: boolean;
    cachedTranslations?: Map<string, string>;
    cacheStore?: Map<string, string>;
  }): Promise<ActionResponse> {
    const { groups, settings, context, scope, forceRefresh, statusLabel, allowLazy } = options;

    if (!settings.apiKey.trim()) {
      return { ok: false, message: 'Add an OpenRouter API key in the popup first.' };
    }

    if (groups.length === 0) {
      return { ok: false, message: 'No translatable blocks found.' };
    }

    const sessionId = crypto.randomUUID();
    this.cancelledSessionIds.delete(sessionId);
    this.pageIndexRecorded = false;
    const totalJobs = groups.length;
    this.lastProgressEmitAt = 0;
    this.lastProgressPercent = -1;
    this.startSessionMetrics();
    this.setSnapshot(
      {
        status: 'scanning',
        scope,
        targetLanguage: settings.targetLanguage,
        activeSessionId: sessionId,
        progressPercent: 0,
        lastError: null,
      },
      { immediate: true },
    );
    this.overlay.setWorking();

    const cachedTranslations =
      options.cachedTranslations ??
      (forceRefresh || !settings.cacheEnabled
        ? new Map<string, string>()
        : await this.resolveCachedTranslationsForGroups(groups));
    const hydrated = this.hydrateGroups(groups, {
      forceRefresh,
      cachedTranslations,
      sessionId,
      totalJobs,
      progressMessage: 'Using saved translations...',
      showOverlay: true,
    });
    let processedJobs = hydrated.processedJobs;
    let pendingGroups = hydrated.pendingGroups;

    this.throwIfSessionCancelled(sessionId);

    if (pendingGroups.length === 0) {
      const calibration = await getEstimateCalibrationSnapshot(settings.provider, settings.model);
      await this.retryWarningGroups({
        sessionId,
        settings,
        context,
        runtimeState: this.createRuntimeState(groups, calibration, settings.style),
      });
      const completion = this.finishSession(sessionId);
      this.presentCompletionOverlay(statusLabel, completion?.warnings ?? null);
      return { ok: true, message: statusLabel };
    }

    const calibration = await getEstimateCalibrationSnapshot(settings.provider, settings.model);
    const runtimeState = this.createRuntimeState(pendingGroups, calibration, settings.style);

    let immediateGroups = pendingGroups;
    let deferredGroups: TranslationGroup[] = [];

    if (allowLazy) {
      const split = this.splitImmediateAndDeferredGroups(pendingGroups, calibration);
      immediateGroups = split.immediateGroups;
      deferredGroups = split.deferredGroups;
    }

    if (immediateGroups.length > 0) {
      this.setSnapshot(
        {
          status: 'queued',
          progressPercent: this.calculateProgress(processedJobs, totalJobs),
        },
        { immediate: true },
      );
      this.overlay.setWorking();

      try {
        processedJobs = await this.processGroupBatches({
          groups: immediateGroups,
          settings,
          context,
          sessionId,
          totalJobs,
          processedJobs,
          cacheStore: options.cacheStore,
          runtimeState,
          showOverlay: true,
          overlayMessage: `Translating ${immediateGroups.length} visible jobs...`,
          batchProfile: 'immediate',
          metricsPhase: 'immediate',
        });
      } catch (error) {
        if (isTranslationCancelledError(error)) {
          return { ok: true, message: 'Cancelled. Start a new run when ready.' };
        }
        const message = getErrorMessage(error, 'Translation failed.');
        logTranslationError('Page translation failed.', error, {
          pageKey: this.pageKey,
          scope,
          sessionId,
        });
        this.setSnapshot(
          {
            status: 'failed',
            lastError: message,
            activeSessionId: null,
          },
          { immediate: true },
        );
        this.overlay.fail(message);
        return { ok: false, message };
      }
    }

    if (immediateGroups.length > 0) {
      this.recordPhaseTiming('immediateCompletedMs');
    }

    if (deferredGroups.length > 0) {
      this.setupLazyPageSession({
        sessionId,
        groups: deferredGroups,
        settings,
        context,
        totalJobs,
        processedJobs,
        cacheStore: options.cacheStore,
        runtimeState,
      });
      const lazyVisibleCount = deferredGroups.filter(
        (group) => group.queueClass === 'lazy-visible',
      ).length;
      const lazyMessage =
        lazyVisibleCount > 0
          ? `Translated the first screen. ${deferredGroups.length} remaining groups will keep loading.`
          : `Translated visible blocks. ${deferredGroups.length} remaining groups will load as you scroll.`;
      if (lazyVisibleCount > 0) {
        this.overlay.setWorking();
      } else {
        this.recordPhaseTiming('lazyVisibleCompletedMs');
        this.overlay.setResting('続きを読み進めると、自動で翻訳していきます。', 1800);
        this.setupDynamicContentObserver(scope, settings, context);
      }
      return {
        ok: true,
        message: lazyMessage,
      };
    }

    this.throwIfSessionCancelled(sessionId);
    await this.retryWarningGroups({
      sessionId,
      settings,
      context,
      runtimeState,
    });
    const completion = this.finishSession(sessionId);
    this.presentCompletionOverlay(statusLabel, completion?.warnings ?? null);
    this.setupDynamicContentObserver(scope, settings, context);
    return { ok: true, message: statusLabel };
  }

  private collectPageScan(scope: DefaultTranslationScope): PageScanSnapshot {
    const cached = this.pageScans.get(scope);
    if (cached && cached.pageSignature === this.pageSignature) {
      this.refreshDerivedSnapshotVisibility(cached);
      return cached;
    }

    const root = resolveScopeRoot(this.documentRef, scope);
    const records = this.registerBlocks(collectTranslatableBlocks(root, { fullPage: scope === 'page' }));
    const snapshot: PageScanSnapshot = {
      pageSignature: this.pageSignature,
      scope,
      root,
      records,
      derivedSnapshots: new Map(),
    };
    this.pageScans.set(scope, snapshot);
    return snapshot;
  }

  private collectSelectionRecords(): BlockRecord[] {
    const selection = window.getSelection();
    if (!selection) {
      return [];
    }

    return this.registerBlocks(collectSelectionBlocks(selection));
  }

  private registerBlocks(blocks: BlockSeed[]): BlockRecord[] {
    const records: BlockRecord[] = [];
    blocks.forEach((block) => {
      const existing = this.blocksByElement.get(block.element);
      if (existing) {
        if (existing.translatedContent === null && existing.displayState === 'original') {
          existing.originalHtml = block.originalHtml;
          existing.originalText = block.originalText;
          existing.contentMode = block.contentMode;
        }
        existing.sectionContext = block.sectionContext;
        existing.top = block.top;
        existing.priorityScore = block.priorityScore;
        records.push(existing);
        return;
      }

      const record: BlockRecord = {
        blockId: crypto.randomUUID(),
        element: block.element,
        originalHtml: block.originalHtml,
        originalText: block.originalText,
        translatedContent: null,
        contentMode: block.contentMode,
        displayState: 'original',
        sectionContext: block.sectionContext,
        top: block.top,
        priorityScore: block.priorityScore,
        warningState: 'none',
        retryAttemptCount: 0,
        lastWarningMessage: null,
      };

      this.blocksByElement.set(block.element, record);
      records.push(record);
    });
    return records;
  }

  private describeElement(element: HTMLElement): {
    tagName: string;
    id: string;
    className: string;
  } {
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || '',
      className: element.className || '',
    };
  }

  private async getOrCreateDerivedPageSnapshot(
    scan: PageScanSnapshot,
    settings: ResolvedSettings,
    context: TranslationContext,
  ): Promise<DerivedPageSnapshot> {
    this.refreshDerivedSnapshotVisibility(scan);
    const derivedKey = this.buildDerivedKey(settings, context);
    const existing = scan.derivedSnapshots.get(derivedKey);
    if (existing) {
      return existing;
    }

    const groups = this.buildDerivedGroups(scan.records, settings, context);
    const sourceChars = groups.reduce((sum, group) => sum + getGroupPreparedChars(group), 0);
    const derived: DerivedPageSnapshot = {
      derivedKey,
      groups,
      sourceChars,
    };

    scan.derivedSnapshots.set(derivedKey, derived);
    return derived;
  }

  private schedulePagePrewarm(settings: ExtensionSettings): void {
    if (!settings.apiKey.trim() || this.sessionSnapshot.activeSessionId) {
      return;
    }

    const resolvedScope = settings.translateFullPage ? 'page' : 'main';
    const prewarmKey = this.buildPrewarmKey(settings, resolvedScope);
    if (this.prewarmKey === prewarmKey || this.prewarmPromise) {
      return;
    }

    this.cancelPrewarm();
    this.prewarmKey = prewarmKey;
    this.prewarmTimerId = window.setTimeout(() => {
      this.prewarmTimerId = null;
      this.prewarmPromise = this.runPagePrewarm(settings, resolvedScope)
        .catch(() => undefined)
        .finally(() => {
          this.prewarmPromise = null;
        });
    }, 120);
  }

  private scheduleProviderWarmup(settings: ExtensionSettings): void {
    if (!settings.apiKey.trim() || this.sessionSnapshot.activeSessionId) {
      return;
    }

    const warmupKey = `${settings.provider}|${settings.model}`;
    if (this.providerWarmupKey === warmupKey || this.providerWarmupPromise) {
      return;
    }

    this.cancelProviderWarmup();
    this.providerWarmupKey = warmupKey;
    this.providerWarmupTimerId = window.setTimeout(() => {
      this.providerWarmupTimerId = null;
      this.providerWarmupPromise = chrome.runtime
        .sendMessage({
          type: 'WARM_TRANSLATION_PROVIDER',
          provider: settings.provider,
          model: settings.model,
        })
        .catch(() => undefined)
        .finally(() => {
          this.providerWarmupPromise = null;
        });
    }, PROVIDER_WARMUP_DELAY_MS);
  }

  private async runPagePrewarm(
    settings: ExtensionSettings,
    resolvedScope: DefaultTranslationScope,
  ): Promise<void> {
    if (this.sessionSnapshot.activeSessionId || this.pageSignature !== window.location.href) {
      return;
    }

    const context = this.buildContext(settings.targetLanguage);
    const scan = this.collectPageScan(resolvedScope);
    await this.getOrCreateDerivedPageSnapshot(scan, {
      ...settings,
      resolvedScope,
    }, context);
  }

  private async awaitMatchingPrewarm(settings: ResolvedSettings): Promise<void> {
    const expectedKey = this.buildPrewarmKey(settings, settings.resolvedScope);
    if (!this.prewarmPromise || this.prewarmKey !== expectedKey) {
      return;
    }

    await this.prewarmPromise.catch(() => undefined);
  }

  private buildPrewarmKey(
    settings: Pick<ExtensionSettings, 'provider' | 'model' | 'targetLanguage' | 'style'>,
    scope: DefaultTranslationScope,
  ): string {
    return [
      this.pageSignature,
      scope,
      settings.provider,
      settings.model,
      settings.targetLanguage,
      settings.style,
    ].join('|');
  }

  private cancelPrewarm(): void {
    if (this.prewarmTimerId !== null) {
      window.clearTimeout(this.prewarmTimerId);
      this.prewarmTimerId = null;
    }
    this.prewarmKey = null;
    this.prewarmPromise = null;
    this.cancelProviderWarmup();
  }

  private cancelProviderWarmup(): void {
    if (this.providerWarmupTimerId !== null) {
      window.clearTimeout(this.providerWarmupTimerId);
      this.providerWarmupTimerId = null;
    }
    this.providerWarmupKey = null;
    this.providerWarmupPromise = null;
  }

  private buildDerivedGroups(
    records: BlockRecord[],
    settings: ExtensionSettings,
    context: TranslationContext,
    options: {
      preferOriginalSource?: boolean;
      skipProtectedMarkers?: boolean;
    } = {},
  ): TranslationGroup[] {
    const groups = new Map<string, TranslationGroup>();
    const textJoiner = preferredTextJoiner(settings.targetLanguage);

    records.forEach((record) => {
      if (isLikelyAlreadyTargetLanguage(record.originalText, settings.targetLanguage)) {
        return;
      }

      const requestFragments = this.buildRequestFragments(
        record,
        settings,
        {
          preferOriginalSource: options.preferOriginalSource === true,
          skipProtectedMarkers: options.skipProtectedMarkers === true,
        },
      );
      const requestContentMode = requestFragments[0]?.requestContentMode ?? record.contentMode;
      const normalizedSource = requestFragments
        .map((fragment) =>
          this.normalizePreparedContent(fragment.preparedContent, fragment.requestContentMode),
        )
        .join(
          requestContentMode === 'text'
            ? '\n[[AIWEBTX_TEXT_SPLIT]]\n'
            : '\n[[AIWEBTX_HTML_SPLIT]]\n',
        );
      const groupKey = `${requestContentMode}:${normalizedSource}`;
      const existing = groups.get(groupKey);
      if (existing) {
        existing.records.push(record);
        existing.isVisible = existing.isVisible || this.isElementVisible(record.element);
        existing.top = Math.min(existing.top, record.top);
        if (record.priorityScore > existing.priorityScore) {
          existing.priorityScore = record.priorityScore;
          if (record.sectionContext) {
            existing.sectionContext = record.sectionContext;
          }
        }
        return;
      }

      const cacheLookup: TranslationCacheLookup = {
        provider: settings.provider,
        model: settings.model,
        sourceLanguage: context.sourceLanguage,
        targetLanguage: settings.targetLanguage,
        style: settings.style,
        contentMode: requestContentMode,
        normalizedSource,
      };

      groups.set(groupKey, {
        groupKey,
        contentMode: requestContentMode,
        requestFragments,
        normalizedSource,
        joiner: record.contentMode === 'text' ? textJoiner : '',
        cacheLookup,
        cacheLookupKey: serializeTranslationCacheLookup(cacheLookup),
        records: [record],
        estimatedTokens: requestFragments.reduce(
          (sum, fragment) => sum + estimateTokensFromChars(fragment.preparedContent.length),
          0,
        ),
        isVisible: this.isElementVisible(record.element),
        isUnsafeOversizedHtml:
          record.contentMode === 'html' &&
          requestFragments.length === 1 &&
          requestFragments[0]?.requestContentMode === 'html' &&
          estimateTokensFromChars(requestFragments[0]?.preparedContent.length ?? 0) >=
            UNSPLITTABLE_HTML_TOKEN_THRESHOLD,
        sectionContext: record.sectionContext,
        top: record.top,
        priorityScore: record.priorityScore,
        queueClass: 'deferred',
        isLead: false,
      });
    });

    return Array.from(groups.values());
  }

  private buildEstimateBatchShapes(
    groups: TranslationGroup[],
    calibration: EstimateCalibrationSnapshot,
  ): EstimateBatchShape[] {
    const split = this.splitImmediateAndDeferredGroups(groups, calibration);
    const immediateItems = createBatchItems(split.immediateGroups, calibration);
    const deferredItems = createBatchItems(split.deferredGroups, calibration);
    const xmlLikeDocument = isXmlLikeRuntimeDocument(this.documentRef);
    const immediateStrategy = resolveBatchStrategy(
      immediateItems,
      'immediate',
      undefined,
      xmlLikeDocument,
    );
    const deferredStrategy = resolveBatchStrategy(
      deferredItems,
      'deferred',
      undefined,
      xmlLikeDocument,
    );

    return [
      ...batchBatchItems(immediateItems, {
        tokenLimit: immediateStrategy.tokenLimit,
        itemLimit: immediateStrategy.itemLimit,
        minimumTokenFloor: immediateStrategy.minimumTokenFloor,
        xmlLikeDocument,
        ...this.getBatchingOverrides('immediate'),
      }).map(toEstimateBatchShape),
      ...batchBatchItems(deferredItems, {
        tokenLimit: deferredStrategy.tokenLimit,
        itemLimit: deferredStrategy.itemLimit,
        minimumTokenFloor: deferredStrategy.minimumTokenFloor,
        xmlLikeDocument,
        ...this.getBatchingOverrides('deferred'),
      }).map(toEstimateBatchShape),
    ];
  }

  private async analyzePageSnapshot(
    scan: PageScanSnapshot,
    derived: DerivedPageSnapshot,
    settings: ResolvedSettings,
  ): Promise<PageAnalysis> {
    const cachedTranslations = await this.ensureCachedTranslations(derived, settings.cacheEnabled);
    const calibration = await getEstimateCalibrationSnapshot(settings.provider, settings.model);
    const estimatedUsage = estimateTokensForBatches(
      this.buildEstimateBatchShapes(derived.groups, calibration),
      calibration,
    );
    const visibleBlockCount = scan.records.filter((record) => this.isElementVisible(record.element)).length;
    const cacheHits = derived.groups.reduce((count, group) => {
      if (this.findMemoryTranslation(group)) {
        return count + 1;
      }

      return cachedTranslations.has(group.cacheLookupKey) ? count + 1 : count;
    }, 0);

    return {
      blockCount: scan.records.length,
      uniqueBlockCount: derived.groups.length,
      visibleBlockCount,
      sourceChars: derived.sourceChars,
      estimatedInputTokens: estimatedUsage.inputTokens,
      estimatedOutputTokens: estimatedUsage.outputTokens,
      estimatedCacheHitRatio:
        derived.groups.length === 0 ? 0 : cacheHits / derived.groups.length,
    };
  }

  private async ensureCachedTranslations(
    derived: DerivedPageSnapshot,
    cacheEnabled: boolean,
  ): Promise<Map<string, string>> {
    if (!cacheEnabled) {
      return new Map();
    }

    if (!derived.cachedTranslations) {
      derived.cachedTranslations = await this.resolveCachedTranslationsForGroups(derived.groups);
    }

    return derived.cachedTranslations;
  }

  private async resolveCachedTranslationsForGroups(
    groups: TranslationGroup[],
  ): Promise<Map<string, string>> {
    return getCachedTranslations(groups.map((group) => group.cacheLookup));
  }

  private hydrateGroups(
    groups: TranslationGroup[],
    options: {
      forceRefresh: boolean;
      cachedTranslations: Map<string, string>;
      sessionId: string;
      totalJobs: number;
      progressMessage: string;
      showOverlay: boolean;
    },
  ): { pendingGroups: TranslationGroup[]; processedJobs: number } {
    const pendingGroups: TranslationGroup[] = [];
    let processedJobs = 0;
    let refreshedDisplay = false;

    groups.forEach((group) => {
      if (!options.forceRefresh) {
        const memoryTranslation = this.findMemoryTranslation(group);
        if (memoryTranslation) {
          this.recordCacheHit('memoryHits');
          this.applyGroupTranslation(group, memoryTranslation, false);
          refreshedDisplay = true;
          processedJobs += 1;
          this.updateProgress(
            options.sessionId,
            processedJobs,
            options.totalJobs,
            options.progressMessage,
            options.showOverlay,
          );
          return;
        }
      }

      const cached = !options.forceRefresh
        ? options.cachedTranslations.get(group.cacheLookupKey)
        : undefined;
      if (cached) {
        this.recordCacheHit('persistentHits');
        this.applyGroupTranslation(group, cached, false);
        refreshedDisplay = true;
        processedJobs += 1;
        this.updateProgress(
          options.sessionId,
          processedJobs,
          options.totalJobs,
          options.progressMessage,
          options.showOverlay,
        );
        return;
      }

      // Dictionary-first heading translation: apply locally without API call.
      // Check all records in the group — a heading group typically has one
      // record, but may have more if blocks were merged.
      const isHeadingGroup = group.records.some((r) => /^H[1-6]$/.test(r.element.tagName));
      const headingSource = group.records.find((r) => /^H[1-6]$/.test(r.element.tagName));
      const headingOriginal = headingSource?.originalText ?? group.records[0]?.originalText ?? '';
      const headingDict = isHeadingGroup
        ? lookupCommonHeading(headingOriginal, this.sessionSnapshot.targetLanguage)
        : null;
      if (headingDict && group.records.length === 1) {
        this.applyGroupTranslation(group, headingDict, false);
        refreshedDisplay = true;
        processedJobs += 1;
        this.updateProgress(
          options.sessionId,
          processedJobs,
          options.totalJobs,
          options.progressMessage,
          options.showOverlay,
        );
        return;
      }

      this.recordCacheHit('misses');
      pendingGroups.push(group);
    });

    if (refreshedDisplay) {
      this.refreshDisplayState();
    }

    return {
      pendingGroups,
      processedJobs,
    };
  }

  private splitImmediateAndDeferredGroups(
    groups: TranslationGroup[],
    calibration: EstimateCalibrationSnapshot,
  ): {
    immediateGroups: TranslationGroup[];
    deferredGroups: TranslationGroup[];
  } {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const sortedGroups = [...groups].sort(compareGroupsForScheduling);
    const immediateCandidates = sortedGroups.filter(
      (group) => group.top <= viewportHeight * IMMEDIATE_CANDIDATE_VIEWPORT_MULTIPLIER,
    );
    const candidatePool = (immediateCandidates.length > 0 ? immediateCandidates : sortedGroups).sort(
      (left, right) => compareGroupsForImmediateScheduling(left, right, viewportHeight),
    );
    const immediateGroups: TranslationGroup[] = [];
    let scheduledTokens = 0;
    const textCandidates = candidatePool.filter((group) => group.contentMode === 'text');
    const fallbackCandidates = candidatePool.filter((group) => group.contentMode !== 'text');

    const trySchedule = (pool: TranslationGroup[]): void => {
      const safePool = pool.filter((group) => isSafeImmediateGroup(group, calibration));
      const effectivePool = safePool.length > 0 ? safePool : pool;

      effectivePool.forEach((group) => {
        if (immediateGroups.length >= IMMEDIATE_GROUP_LIMIT) {
          return;
        }

        const estimatedTokens = getGroupPromptTokens(group, calibration);
        const exceedsBudget =
          immediateGroups.length > 0 &&
          scheduledTokens + estimatedTokens > IMMEDIATE_GROUP_TOKEN_BUDGET;
        if (exceedsBudget) {
          return;
        }

        immediateGroups.push(group);
        scheduledTokens += estimatedTokens;
      });
    };

    trySchedule(textCandidates.length > 0 ? textCandidates : candidatePool);
    if (immediateGroups.length === 0 || textCandidates.length === 0) {
      trySchedule(fallbackCandidates);
    }

    if (immediateGroups.length === 0 && sortedGroups[0]) {
      immediateGroups.push(sortedGroups[0]);
    }

    const immediateSet = new Set(immediateGroups.map((group) => group.groupKey));
    const deferredGroups = sortedGroups.filter((group) => !immediateSet.has(group.groupKey));
    const lazyVisibleThreshold = viewportHeight * 2.2;

    immediateGroups.forEach((group) => {
      group.queueClass = 'immediate';
      group.isLead = false;
    });
    if (immediateGroups[0]) {
      immediateGroups[0].isLead = true;
    }
    deferredGroups.forEach((group) => {
      group.queueClass =
        group.isVisible || group.top <= lazyVisibleThreshold ? 'lazy-visible' : 'deferred';
      group.isLead = false;
    });

    return {
      immediateGroups,
      deferredGroups,
    };
  }

  private async processGroupBatches(options: {
    groups: TranslationGroup[];
    settings: ResolvedSettings;
    context: TranslationContext;
    sessionId: string;
    totalJobs: number;
    processedJobs: number;
    cacheStore?: Map<string, string>;
    runtimeState: TranslationRuntimeState;
    showOverlay: boolean;
    overlayMessage: string;
    batchProfile: 'immediate' | 'deferred';
    metricsPhase: 'immediate' | 'lazyVisible' | 'deferred';
  }): Promise<number> {
    if (options.groups.length === 0) {
      return options.processedJobs;
    }

    const buildPlan = (
      groups: TranslationGroup[],
      profile: 'immediate' | 'deferred',
    ): { strategy: BatchStrategy; batches: TranslationBatchItem[][] } => {
      const batchItems = createBatchItems(groups, options.runtimeState.calibration);
      const batchOverrides = this.getBatchingOverrides(profile, options.runtimeState);
      const strategy = resolveBatchStrategy(
        batchItems,
        profile,
        options.runtimeState,
        isXmlLikeRuntimeDocument(this.documentRef),
      );
      const batches = batchBatchItems(batchItems, {
        tokenLimit: strategy.tokenLimit,
        itemLimit: strategy.itemLimit,
        minimumTokenFloor: strategy.minimumTokenFloor,
        xmlLikeDocument: isXmlLikeRuntimeDocument(this.documentRef),
        ...batchOverrides,
      });
      return { strategy, batches };
    };

    const leadGroups =
      options.batchProfile === 'immediate'
        ? options.groups.filter((group) => group.isLead)
        : [];
    const remainingGroups =
      leadGroups.length > 0
        ? options.groups.filter((group) => !group.isLead)
        : options.groups;
    const batchPlans =
      leadGroups.length > 0
        ? [buildPlan(leadGroups, 'immediate'), buildPlan(remainingGroups, options.batchProfile)]
        : [buildPlan(remainingGroups, options.batchProfile)];

    this.recordRequestBatches(
      options.metricsPhase,
      batchPlans.reduce((sum, plan) => sum + plan.batches.length, 0),
    );
    const completedFragments = new Map<string, string[]>();
    const pendingFallbackWarnings = new Map<string, string | undefined>();
    const usageSamples: Array<{
      contentMode: TranslationContentMode;
      estimatedPromptTokens: number;
      estimatedCompletionTokens: number;
      usage: NonNullable<NonNullable<TranslateApiResponse['result']>['usage']>;
    }> = [];
    const cacheWriteTasks: Promise<void>[] = [];
    this.setSnapshot(
      {
        status: 'translating',
        activeSessionId: options.sessionId,
      },
      { immediate: true },
    );

    if (options.showOverlay) {
      this.overlay.setWorking();
    }

    let processedJobs = options.processedJobs;
    let failure: unknown = null;

    const executePlan = async (
      plan: { strategy: BatchStrategy; batches: TranslationBatchItem[][] },
    ): Promise<void> => {
      if (plan.batches.length === 0) {
        return;
      }

      const workerCount = Math.min(plan.strategy.concurrency, plan.batches.length);
      let nextBatchIndex = 0;

      const runWorker = async (): Promise<void> => {
        while (nextBatchIndex < plan.batches.length && !failure) {
          this.throwIfSessionCancelled(options.sessionId);
          const batch = plan.batches[nextBatchIndex++];
          try {
            let result: TranslationRequestResult;
            let sourceFallbackMessage: string | null = null;
            try {
              result = await this.requestTranslationsWithRetry({
                items: batch,
                settings: options.settings,
                context: options.context,
                runtimeState: options.runtimeState,
                sessionId: options.sessionId,
                overlayMessage: options.overlayMessage,
                showOverlay: options.showOverlay,
                metricsPhase: options.metricsPhase,
              });
            } catch (error) {
              if (shouldFallbackToOriginalBatch(batch, error)) {
                // Before giving up, retry once with doubled max_tokens.
                // A 26-char fragment hitting the output limit is usually a
                // max_tokens estimation issue, not a genuine content problem.
                try {
                  result = await this.requestTranslationsWithRetry({
                    items: batch,
                    settings: options.settings,
                    context: options.context,
                    runtimeState: options.runtimeState,
                    sessionId: options.sessionId,
                    overlayMessage: '出力制限を回避して再試行中…',
                    showOverlay: options.showOverlay,
                    metricsPhase: options.metricsPhase,
                    maxOutputTokensOverride: 16000,
                  });
                } catch {
                  sourceFallbackMessage = getErrorMessage(error, 'Translation request failed.');
                  logWithContext('warn', '[AI Web Translator] Falling back to source fragment after output-limit failure.', {
                    pageKey: this.pageKey,
                    sessionId: options.sessionId,
                    contentMode: batch[0]?.contentMode ?? 'unknown',
                    fragmentLength: batch[0]?.preparedContent.length ?? 0,
                  });
                  this.recordQualitySignal('sourceFallbackFragments', batch.length);
                  batch.forEach((item) => {
                    pendingFallbackWarnings.set(item.group.groupKey, sourceFallbackMessage ?? undefined);
                  });
                  result = {
                    translations: batch.map((item) => item.preparedContent),
                  };
                }
              } else {
                throw error;
              }
            }
            this.throwIfSessionCancelled(options.sessionId);
            const cacheEntries: Array<{
              lookup: TranslationCacheLookup;
              translation: string;
            }> = [];
            batch.forEach((item, index) => {
              const translatedFragment = normalizeTranslatedFragmentForQuality(
                result.translations[index],
                item,
                options.runtimeState,
                this.recordQualitySignal.bind(this),
              );
              const preparedFragment = restorePreparedContent(
                translatedFragment,
                item.restoreContentMode,
                item.restoreMap,
              );
              const normalizedProtectedFragment =
                item.placeholderTagMap || item.protectedHtmlMap
                  ? tightenProtectedMarkerSpacing(
                      preparedFragment,
                      options.settings.targetLanguage,
                    )
                  : preparedFragment;
              const canonicalProtectedFragment = item.protectedHtmlMap
                ? canonicalizeProtectedHtmlMarkers(
                    normalizedProtectedFragment,
                    item.protectedHtmlMap,
                  )
                : normalizedProtectedFragment;
              let protectedSafeFragment = canonicalProtectedFragment;
              if (item.protectedHtmlMap) {
                const { recovered, missingMarkers } = recoverMissingProtectedMarkers(
                  canonicalProtectedFragment,
                  item.protectedHtmlMap,
                  item.preparedContent,
                );
                protectedSafeFragment = recovered;
                if (missingMarkers.length > 0) {
                  this.recordQualitySignal('protectedMarkerFallbackFragments');
                }
              }
              const placeholderRestoredFragment = item.placeholderTagMap
                ? restorePlaceholderRichText(
                    protectedSafeFragment,
                    item.placeholderTagMap,
                  )
                : protectedSafeFragment;
              const wrappedPlaceholderFragment =
                !item.skipWrapperRestore &&
                item.placeholderWrapperPrefix &&
                item.placeholderWrapperSuffix
                  ? `${item.placeholderWrapperPrefix}${placeholderRestoredFragment}${item.placeholderWrapperSuffix}`
                  : placeholderRestoredFragment;
              const restoredFragment = item.protectedHtmlMap
                ? restoreProtectedHtml(
                    wrappedPlaceholderFragment,
                    item.protectedHtmlMap,
                  )
                : wrappedPlaceholderFragment;
              const bucket =
                completedFragments.get(item.group.groupKey) ??
                new Array(item.group.requestFragments.length).fill('');
              bucket[item.fragmentIndex] = restoredFragment;
              completedFragments.set(item.group.groupKey, bucket);

              if (!bucket.every((fragment) => fragment.length > 0)) {
                return;
              }

              const restored = joinTranslatedGroupOutput(item.group, bucket);
              const hasFallbackWarning =
                pendingFallbackWarnings.has(item.group.groupKey);
              const isHeadingOrLabel =
                item.fragmentRole === 'heading' || item.fragmentRole === 'label';
              let finalRestored = restored;
              const originalText = item.group.records[0]?.originalText ?? '';
              const detectedUntranslated =
                !hasFallbackWarning &&
                isLikelyUntranslated(
                  restored,
                  originalText,
                  options.settings.targetLanguage,
                  isHeadingOrLabel ? { minLetters: 4 } : undefined,
                );
              if (detectedUntranslated) {
                this.recordQualitySignal('untranslatedResponses');
              }

              // Mixed-language quality gate: detect partially translated content
              const detectedMixed =
                !hasFallbackWarning &&
                !detectedUntranslated &&
                hasMixedLanguageContent(
                  restored,
                  originalText,
                  options.settings.targetLanguage,
                );
              if (detectedMixed) {
                this.recordQualitySignal('mixedLanguageDetections');
                this.markItemsMixedLanguage(
                  batch.filter((candidate) => candidate.group.groupKey === item.group.groupKey),
                  '翻訳結果に未翻訳の文が残っています。再試行します。',
                );
                processedJobs += 1;
                return; // Skip apply and cache — will be retried
              }

              const dictTranslation = lookupCommonHeading(
                originalText,
                options.settings.targetLanguage,
              );
              if (dictTranslation && looksUntranslatedShortText(restored, originalText)) {
                finalRestored = dictTranslation;
              }
              if (hasFallbackWarning) {
                // Restore original HTML instead of applying mixed JP/EN content
                item.group.records.forEach((record) => {
                  setElementHtmlContent(record.element, record.originalHtml);
                  record.translatedContent = null;
                  record.displayState = 'original';
                });
                const fallbackMessage = pendingFallbackWarnings.get(item.group.groupKey);
                this.markItemsFallback(
                  batch.filter((candidate) => candidate.group.groupKey === item.group.groupKey),
                  fallbackMessage ?? sourceFallbackMessage ?? undefined,
                );
                pendingFallbackWarnings.delete(item.group.groupKey);
              } else {
                this.applyGroupTranslation(item.group, finalRestored, false);
              }
              if (!hasFallbackWarning) {
                this.captureGlossaryTranslation(item.group, restored, options.runtimeState);
              }
              processedJobs += 1;
              if (options.settings.cacheEnabled && !hasFallbackWarning && !detectedMixed) {
                cacheEntries.push({
                  lookup: item.group.cacheLookup,
                  translation: restored,
                });
                options.cacheStore?.set(item.group.cacheLookupKey, restored);
              }
              this.updateProgress(
                options.sessionId,
                processedJobs,
                options.totalJobs,
                'Applying translations...',
                options.showOverlay,
              );
            });

            if (result.usage) {
              const batchEstimate = toEstimateBatchShape(batch);
              usageSamples.push({
                contentMode: batchEstimate.contentMode,
                estimatedPromptTokens: estimatePromptTokensForBatch(batchEstimate),
                estimatedCompletionTokens: estimateCompletionTokensForBatch(batchEstimate),
                usage: result.usage,
              });
            }

            this.recordBatchSuccess(batch, options.runtimeState);
            this.refreshDisplayState();
            this.recordPageIndexIfNeeded(options.settings);

            if (cacheEntries.length > 0) {
              this.throwIfSessionCancelled(options.sessionId);
              cacheWriteTasks.push(setCachedTranslations(cacheEntries));
            }
          } catch (error) {
            this.recordBatchFailure(batch, error, options.runtimeState);
            failure = error;
            return;
          }
        }
      };

      await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
    };

    for (const plan of batchPlans) {
      if (failure || plan.batches.length === 0) {
        continue;
      }
      await executePlan(plan);
    }

    if (failure) {
      throw failure;
    }

    this.throwIfSessionCancelled(options.sessionId);
    if (cacheWriteTasks.length > 0) {
      await Promise.all(cacheWriteTasks);
    }
    await recordTranslationUsageSamples(
      options.settings.provider,
      options.settings.model,
      usageSamples,
    );

    return processedJobs;
  }

  private async retryWarningGroups(options: {
    sessionId: string;
    settings: ResolvedSettings;
    context: TranslationContext;
    runtimeState: TranslationRuntimeState;
  }): Promise<void> {
    for (let attempt = 0; attempt < MAX_WARNING_REPAIR_ATTEMPTS; attempt += 1) {
      this.throwIfSessionCancelled(options.sessionId);
      const warningRecords = this.collectWarningRecords().filter(
        (record) =>
          record.warningState === 'fallback-source' ||
          record.warningState === 'error-final' ||
          record.warningState === 'mixed-language',
      );
      if (warningRecords.length === 0) {
        return;
      }

      const retryGroups = this.buildDerivedGroups(
        warningRecords,
        options.settings,
        options.context,
        {
          preferOriginalSource: true,
          skipProtectedMarkers: attempt >= 1,
        },
      );
      if (retryGroups.length === 0) {
        return;
      }

      const repairRuntimeState = this.createWarningRepairRuntimeState(options.runtimeState);

      for (const group of retryGroups) {
        this.throwIfSessionCancelled(options.sessionId);
        const items = createBatchItems([group], repairRuntimeState.calibration);
        this.markItemsRetrying(items, '未解決の箇所を再試行しています。');

        let result: TranslationRequestResult | null = null;
        let fallbackMessage: string | undefined;

        try {
          result = await this.requestTranslationsWithRetry({
            items,
            settings: options.settings,
            context: options.context,
            runtimeState: repairRuntimeState,
            sessionId: options.sessionId,
            overlayMessage: '未解決の箇所を再試行しています…',
            showOverlay: false,
            metricsPhase: 'deferred',
          });
        } catch (error) {
          fallbackMessage = getErrorMessage(error, 'Translation request failed.');
          this.applyOriginalGroupContent(group);
          this.markItemsFallback(items, fallbackMessage);
          continue;
        }

        const fragments: string[] = [];

        for (const [index, item] of items.entries()) {
          const translatedFragment = normalizeTranslatedFragmentForQuality(
            result.translations[index],
            item,
            repairRuntimeState,
            this.recordQualitySignal.bind(this),
          );
          const preparedFragment = restorePreparedContent(
            translatedFragment,
            item.restoreContentMode,
            item.restoreMap,
          );
          const normalizedProtectedFragment =
            item.placeholderTagMap || item.protectedHtmlMap
              ? tightenProtectedMarkerSpacing(preparedFragment, options.settings.targetLanguage)
              : preparedFragment;
          const canonicalProtectedFragment = item.protectedHtmlMap
            ? canonicalizeProtectedHtmlMarkers(
                normalizedProtectedFragment,
                item.protectedHtmlMap,
              )
            : normalizedProtectedFragment;
          let protectedSafeFragment = canonicalProtectedFragment;
          if (item.protectedHtmlMap) {
            const { recovered, missingMarkers } = recoverMissingProtectedMarkers(
              canonicalProtectedFragment,
              item.protectedHtmlMap,
              item.preparedContent,
            );
            protectedSafeFragment = recovered;
            if (missingMarkers.length > 0) {
              this.recordQualitySignal('protectedMarkerFallbackFragments');
            }
          }
          const placeholderRestoredFragment = item.placeholderTagMap
            ? restorePlaceholderRichText(protectedSafeFragment, item.placeholderTagMap)
            : protectedSafeFragment;
          const wrappedPlaceholderFragment =
            !item.skipWrapperRestore &&
            item.placeholderWrapperPrefix &&
            item.placeholderWrapperSuffix
              ? `${item.placeholderWrapperPrefix}${placeholderRestoredFragment}${item.placeholderWrapperSuffix}`
              : placeholderRestoredFragment;
          const restoredFragment = item.protectedHtmlMap
            ? restoreProtectedHtml(wrappedPlaceholderFragment, item.protectedHtmlMap)
            : wrappedPlaceholderFragment;
          fragments.push(restoredFragment);
        }

        if (fragments.length !== items.length) {
          this.applyOriginalGroupContent(group);
          this.markItemsFallback(items);
          continue;
        }

        const restored = joinTranslatedGroupOutput(group, fragments);
        this.applyGroupTranslation(group, restored, false, { clearWarnings: true });
      }

      this.refreshDisplayState();
    }
  }

  private createWarningRepairRuntimeState(
    runtimeState: TranslationRuntimeState,
  ): TranslationRuntimeState {
    return {
      ...runtimeState,
      batchScale: {
        text: Math.min(runtimeState.batchScale.text, 0.75),
        html: Math.min(runtimeState.batchScale.html, 0.75),
      },
      maxConcurrency: 1,
    };
  }

  private applyOriginalGroupContent(group: TranslationGroup): void {
    const fallbackContent = getGroupOriginalContent(group);
    this.applyGroupTranslation(group, fallbackContent, false, {
      clearWarnings: false,
    });
  }

  private async requestTranslations(
    items: TranslationBatchItem[],
    settings: ResolvedSettings,
    context: TranslationContext,
    runtimeState: TranslationRuntimeState,
    sessionId: string,
    overrides?: { maxOutputTokens?: number },
  ): Promise<TranslationRequestResult> {
    this.throwIfSessionCancelled(sessionId);
    const requestFragments = items.map((item) => item.preparedContent);
    const contentMode = items[0]?.contentMode ?? 'html';
    const hasProtectedMarkers = items.some((item) => item.hasMarkers);
    const useFragmentIds =
      requestFragments.length >= 4 || (contentMode === 'html' && hasProtectedMarkers);
    const fragmentIds = useFragmentIds
      ? requestFragments.map((_, index) => index.toString(36))
      : undefined;
    const fragmentRoles = items.map((item) => item.fragmentRole);
    const precedingContexts = items.map((item) => item.precedingContext ?? null);
    const hasPrecedingContexts = precedingContexts.some((context) => typeof context === 'string' && context.length > 0);
    if (hasPrecedingContexts) {
      this.recordQualitySignal(
        'continuationContextFragments',
        precedingContexts.filter((context): context is string => typeof context === 'string' && context.length > 0).length,
      );
    }
    const request: TranslationBatchRequest = {
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      sourceLanguage: context.sourceLanguage,
      targetLanguage: settings.targetLanguage,
      style: settings.style,
      pageRegister: runtimeState.pageRegister,
      contentMode,
      context,
      fragments: requestFragments,
      fragmentIds,
      fragmentRoles,
      precedingContexts,
      sectionContext: resolveBatchSectionContext(items),
      glossary: buildGlossaryHints(runtimeState, items),
      hasProtectedMarkers,
      maxOutputTokens: overrides?.maxOutputTokens,
    };

    const response = (await chrome.runtime.sendMessage({
      type: 'TRANSLATE_API',
      request,
    })) as TranslateApiResponse;

    if (!response.ok || !response.result) {
      if (isTranslationCancelledMessage(response.message)) {
        throw new TranslationCancelledError(response.message);
      }
      throw new Error(response.message || 'Translation request failed.');
    }

    if (response.result.translations.length !== requestFragments.length) {
      if (requestFragments.length === 1 && response.result.translations.length > 1) {
        return {
          translations: [
            joinTranslatedFragments(optionsToJoiner(items), response.result.translations),
          ],
          usage: response.result.usage,
          finishReason: response.result.finishReason,
          providerDurationMs: response.timings?.providerDurationMs,
        };
      }
      throw new FragmentCountMismatchTranslationError(
        requestFragments.length,
        response.result.translations.length,
      );
    }

    return {
      translations: response.result.translations,
      usage: response.result.usage,
      finishReason: response.result.finishReason,
      providerDurationMs: response.timings?.providerDurationMs,
    };
  }

  private async requestTranslationsWithRetry(options: {
    items: TranslationBatchItem[];
    settings: ResolvedSettings;
    context: TranslationContext;
    runtimeState: TranslationRuntimeState;
    sessionId: string;
    overlayMessage: string;
    showOverlay: boolean;
    metricsPhase: 'immediate' | 'lazyVisible' | 'deferred';
    maxOutputTokensOverride?: number;
  }): Promise<TranslationRequestResult> {
    let attempt = 0;

    while (true) {
      let waitingNoticeId: number | null = null;
      let showedWaitingNotice = false;
      let requestStartedAt = 0;

      try {
        this.throwIfSessionCancelled(options.sessionId);
        if (attempt > 0) {
          const previousError = this.sessionSnapshot.lastError;
          this.markItemsRetrying(
            options.items,
            previousError || 'もう一度試しています。',
          );
          this.setSnapshot(
            {
              status: 'retrying',
              activeSessionId: options.sessionId,
              lastError: previousError,
            },
            { immediate: true },
          );
          if (options.showOverlay) {
            this.overlay.setRetrying();
          }
          logWithContext('warn', '[AI Web Translator] Retrying translation batch.', {
            pageKey: this.pageKey,
            sessionId: options.sessionId,
            attempt,
            reason: previousError,
          });
          await delay(retryDelayWithJitter(attempt));
          this.throwIfSessionCancelled(options.sessionId);
          this.setSnapshot(
            {
              status: 'translating',
              activeSessionId: options.sessionId,
              lastError: null,
            },
            { immediate: true },
          );
          if (options.showOverlay) {
            this.overlay.setWorking();
          }
        }

        if (options.showOverlay) {
          waitingNoticeId = window.setTimeout(() => {
            showedWaitingNotice = true;
            this.overlay.showNotice('AI の応答を待っています…');
            logWithContext('info', '[AI Web Translator] Waiting on provider response.', {
              pageKey: this.pageKey,
              sessionId: options.sessionId,
              batchSize: options.items.length,
              overlayMessage: options.overlayMessage,
            });
          }, API_WAIT_NOTICE_MS);
        }

        if (options.metricsPhase === 'immediate') {
          this.recordImmediateBatchShape(options.items, options.runtimeState.calibration);
        }

        requestStartedAt = Date.now();
        const result = await this.requestTranslations(
          options.items,
          options.settings,
          options.context,
          options.runtimeState,
          options.sessionId,
          options.maxOutputTokensOverride ? { maxOutputTokens: options.maxOutputTokensOverride } : undefined,
        );
        if (options.metricsPhase === 'immediate' && requestStartedAt > 0) {
          this.recordImmediateBatchLatency(
            Date.now() - requestStartedAt,
            result.providerDurationMs,
          );
        }

        if (result.finishReason === 'length') {
          throw new OutputLimitTranslationError();
        }

        return result;
      } catch (error) {
        if (isTranslationCancelledError(error)) {
          throw error;
        }
        const message = getErrorMessage(error, 'Translation request failed.');
        this.setSnapshot(
          {
            lastError: message,
          },
          { immediate: true },
        );
        if (shouldSplitBatchAfterFailure(error)) {
          const splitResults = splitBatchItemsForRetry(options.items);
          if (!splitResults) {
            const singleItemSplit = splitSingleItemForRetry(options.items[0]);
            if (!singleItemSplit) {
              // Can't split further — retry once with max tokens before giving up
              if (!options.maxOutputTokensOverride) {
                try {
                  return await this.requestTranslationsWithRetry({
                    ...options,
                    maxOutputTokensOverride: 16000,
                  });
                } catch {
                  // Fall through to final error
                }
              }
              this.markItemsFinalError(options.items, message);
              throw error;
            }

            this.markItemsRetrying(options.items, message);
            this.setSnapshot(
              {
                status: 'retrying',
                activeSessionId: options.sessionId,
                lastError: message,
              },
              { immediate: true },
            );
            if (options.showOverlay) {
              this.overlay.setRetrying();
            }
            logWithContext('warn', '[AI Web Translator] Provider item failed. Splitting fragment.', {
              pageKey: this.pageKey,
              sessionId: options.sessionId,
              reason: message,
              contentMode: options.items[0]?.contentMode ?? 'unknown',
              fragmentLength: options.items[0]?.preparedContent.length ?? 0,
              splitSizes: singleItemSplit.map((item) => item.preparedContent.length),
            });
            this.recordRetry('fragmentSplits');
            this.recordFragmentSplitStats(options.items[0]);

            const splitResult = await this.requestTranslationsWithRetry({
              ...options,
              items: singleItemSplit,
            });

            this.setSnapshot(
              {
                status: 'translating',
                activeSessionId: options.sessionId,
                lastError: null,
              },
              { immediate: true },
            );
            if (options.showOverlay) {
              this.overlay.setWorking();
            }

            return {
              translations: [
                joinTranslatedFragments(
                  options.items[0]?.group.joiner ?? '',
                  splitResult.translations,
                ),
              ],
              usage: splitResult.usage,
              finishReason: splitResult.finishReason,
            };
          }

          this.markItemsRetrying(options.items, message);
          this.setSnapshot(
            {
              status: 'retrying',
              activeSessionId: options.sessionId,
              lastError: message,
            },
            { immediate: true },
          );
          if (options.showOverlay) {
            this.overlay.setRetrying();
          }
          logWithContext('warn', '[AI Web Translator] Provider batch failed. Splitting batch.', {
            pageKey: this.pageKey,
            sessionId: options.sessionId,
            reason: message,
            batchSize: options.items.length,
            splitSizes: splitResults.map((items) => items.length),
          });
          this.recordRetry('batchSplits');
          this.recordBatchSplitStats(options.items);
          this.recordBatchSplitEvent(options.items, options.metricsPhase, message);

          const combined: TranslationRequestResult = {
            translations: [],
          };
          for (const splitItems of splitResults) {
            const splitResult = await this.requestTranslationsWithRetry({
              ...options,
              items: splitItems,
            });
            combined.translations.push(...splitResult.translations);
            combined.usage = mergeTranslationUsage(combined.usage, splitResult.usage);
          }

          this.setSnapshot(
            {
              status: 'translating',
              activeSessionId: options.sessionId,
              lastError: null,
            },
            { immediate: true },
          );
          if (options.showOverlay) {
            this.overlay.setWorking();
          }
          return combined;
        }
        if (attempt >= MAX_BATCH_RETRIES || !isRetryableTranslationError(error)) {
          this.markItemsFinalError(options.items, message);
          throw error;
        }
        this.recordRetry('transient');
        attempt += 1;
      } finally {
        if (waitingNoticeId !== null) {
          window.clearTimeout(waitingNoticeId);
        }

        if (showedWaitingNotice && options.showOverlay) {
          this.overlay.clearNotice();
        }
      }
    }
  }

  private async resolveSettings(
    providedSettings?: ExtensionSettings,
    providedScope?: DefaultTranslationScope,
  ): Promise<ResolvedSettings> {
    const stored = normalizeSettings(providedSettings ?? (await loadSettings()));
    this.overlay.setTargetLanguage(stored.targetLanguage);
    return {
      ...stored,
      resolvedScope: providedScope ?? (stored.translateFullPage ? 'page' : 'main'),
    };
  }

  private buildContext(targetLanguage: string): TranslationContext {
    return {
      ...buildTranslationContext(this.documentRef),
      pageUrl: this.pageKey,
      targetLanguage,
    };
  }

  private buildDerivedKey(
    settings: ExtensionSettings,
    context: TranslationContext,
  ): string {
    return [
      settings.provider,
      settings.model,
      context.sourceLanguage,
      settings.targetLanguage,
      settings.style,
    ].join('::');
  }

  private normalizePreparedContent(
    content: string,
    contentMode: TranslationContentMode,
  ): string {
    return contentMode === 'text' ? normalizeText(content) : normalizeHtml(content);
  }

  private buildRequestFragments(
    record: BlockRecord,
    settings: ExtensionSettings,
    options: {
      preferOriginalSource?: boolean;
      skipProtectedMarkers?: boolean;
    } = {},
  ): Array<{
    preparedContent: string;
    sourceHintText: string;
    requestContentMode: TranslationContentMode;
    restoreContentMode: TranslationContentMode;
    fragmentRole: TranslationFragmentRole;
    precedingContext?: string;
    restoreMap: Record<string, string>;
    placeholderTagMap?: Record<string, string>;
    placeholderWrapperPrefix?: string;
    placeholderWrapperSuffix?: string;
    skipWrapperRestore?: boolean;
    protectedHtmlMap?: Record<string, string>;
  }> {
    if (record.contentMode === 'html' && !options.skipProtectedMarkers) {
      // Pre-protect atomic HTML (math, images, etc.) BEFORE attempting
      // placeholder-rich-text conversion. This allows the placeholder lane
      // to succeed for paragraphs containing MathML — the math elements are
      // replaced with [[xN]] markers first, so they no longer trigger the
      // PLACEHOLDER_RICH_TEXT_DISALLOWED_SELECTOR early abort.
      const wrappedSource = options.preferOriginalSource ? record.originalHtml : record.element.outerHTML;
      const wrappedPreProtected = protectAtomicHtmlForTranslation(wrappedSource);

      const wrappedPlaceholderFragments = this.buildHtmlPlaceholderFragments(
        wrappedPreProtected?.content ?? wrappedSource,
        settings,
        true,
        wrappedPreProtected ? { preProtected: wrappedPreProtected } : undefined,
      );
      if (wrappedPlaceholderFragments) {
        return wrappedPlaceholderFragments;
      }

      const inlinePreProtected = protectAtomicHtmlForTranslation(record.originalHtml);
      const inlinePlaceholderFragments = this.buildHtmlPlaceholderFragments(
        inlinePreProtected?.content ?? record.originalHtml,
        settings,
        false,
        inlinePreProtected ? { preProtected: inlinePreProtected } : undefined,
      );
      if (inlinePlaceholderFragments) {
        return inlinePlaceholderFragments;
      }
    }

    const sourceContent =
      record.contentMode === 'text' ? record.originalText : record.originalHtml;
    const protectedHtml =
      record.contentMode === 'html' && !options.skipProtectedMarkers
        ? protectAtomicHtmlForTranslation(sourceContent)
        : null;
    const translatableSourceContent = protectedHtml?.content ?? sourceContent;

    const segments =
      record.contentMode === 'text'
        ? splitTextIntoSegments(sourceContent)
        : splitHtmlIntoSafeSegments(translatableSourceContent, MAX_HTML_FRAGMENT_CHARS);
    const descriptors = buildFragmentDescriptors(record, segments, record.contentMode);

    return descriptors.map((descriptor) => {
      const segment = descriptor.segment;
      const prepared = prepareContentForTranslation(segment, record.contentMode, settings.style);
      return {
        preparedContent: prepared.content,
        sourceHintText: descriptor.sourceHintText,
        requestContentMode: record.contentMode,
        restoreContentMode: record.contentMode,
        fragmentRole: descriptor.fragmentRole,
        precedingContext: descriptor.precedingContext,
        restoreMap: prepared.restoreMap,
        protectedHtmlMap: pickProtectedHtmlMarkersForContent(segment, protectedHtml?.htmlMap),
      };
    });
  }

  private buildHtmlPlaceholderFragments(
    sourceContent: string,
    settings: ExtensionSettings,
    skipWrapperRestore: boolean,
    options?: {
      preProtected?: { content: string; htmlMap: Record<string, string> };
    },
  ): Array<{
    preparedContent: string;
    sourceHintText: string;
    requestContentMode: TranslationContentMode;
    restoreContentMode: TranslationContentMode;
    fragmentRole: TranslationFragmentRole;
    precedingContext?: string;
    restoreMap: Record<string, string>;
    placeholderTagMap?: Record<string, string>;
    placeholderWrapperPrefix?: string;
    placeholderWrapperSuffix?: string;
    skipWrapperRestore?: boolean;
    protectedHtmlMap?: Record<string, string>;
  }> | null {
    const protectedHtml = options?.preProtected ?? protectAtomicHtmlForTranslation(sourceContent);
    const translatableSourceContent = protectedHtml?.content ?? sourceContent;
    const placeholder = preparePlaceholderRichTextForTranslation(translatableSourceContent);
    if (!placeholder) {
      return null;
    }

    if (skipWrapperRestore && (!placeholder.wrapperPrefix || !placeholder.wrapperSuffix)) {
      return null;
    }

    const xmlLikeDocument = isXmlLikeRuntimeDocument(this.documentRef);
    const protectedMarkerCount = protectedHtml ? Object.keys(protectedHtml.htmlMap).length : 0;
    const placeholderTagPairCount = Object.keys(placeholder.tagMap).length / 2;
    const preparedHtml = prepareContentForTranslation(
      translatableSourceContent,
      'html',
      settings.style,
    );
    let placeholderSegments = resolvePlaceholderRequestSegments(
      placeholder.content,
      placeholder.wrapperPrefix,
    );
    if (
      shouldUseConservativeProtectedPlaceholderSplitting({
        protectedMarkerCount,
        placeholderTagPairCount,
      })
    ) {
      placeholderSegments = splitDenseProtectedPlaceholderRichText(
        placeholder.content,
        MAX_PLACEHOLDER_RICH_TEXT_CHARS,
        1,
      );
    }

    if (
      !placeholderSegments ||
      !placeholderSegments.every((segment) => segment.length <= MAX_PLACEHOLDER_RICH_TEXT_CHARS) ||
      shouldPreferHtmlLaneForDenseProtectedPlaceholder({
        protectedMarkerCount,
        placeholderTagPairCount,
        placeholderSegments,
      }) ||
      !isPlaceholderPathWorthUsing({
        protectedHtml,
        protectedMarkerCount,
        placeholderTagPairCount,
        placeholderContentLength: placeholder.content.length,
        preparedHtmlLength: preparedHtml.content.length,
        skipWrapperRestore,
        xmlLikeDocument,
      })
    ) {
      return null;
    }

    const sourceHintContent = placeholder.wrapperPrefix
      ? `${placeholder.wrapperPrefix}${placeholder.content}${placeholder.wrapperSuffix ?? ''}`
      : placeholder.content;
    const descriptors = buildFragmentDescriptorsForSourceText(
      sourceHintContent,
      placeholderSegments,
      'html',
    );

    return descriptors.map((descriptor) => ({
      preparedContent: descriptor.segment,
      sourceHintText: descriptor.sourceHintText,
      requestContentMode: 'text',
      restoreContentMode: 'text',
      fragmentRole: descriptor.fragmentRole,
      precedingContext: descriptor.precedingContext,
      restoreMap: {},
      placeholderTagMap: placeholder.tagMap,
      placeholderWrapperPrefix: placeholder.wrapperPrefix,
      placeholderWrapperSuffix: placeholder.wrapperSuffix,
      skipWrapperRestore,
      protectedHtmlMap: pickProtectedHtmlMarkersForContent(descriptor.segment, protectedHtml?.htmlMap),
    }));
  }

  private findMemoryTranslation(group: TranslationGroup): string | null {
    return group.records.find((record) => record.translatedContent)?.translatedContent ?? null;
  }

  private ensureWarningStyles(): void {
    if (this.documentRef.querySelector('style[data-aiwt-warning-styles="true"]')) {
      return;
    }

    const style = this.documentRef.createElement('style');
    style.dataset.aiwtWarningStyles = 'true';
    style.textContent = `
      [data-aiwt-warning="retrying"] {
        outline: 1px solid rgba(212, 147, 17, 0.34);
        outline-offset: 2px;
      }
      [data-aiwt-warning="fallback-source"] {
        outline: 1px dashed rgba(212, 147, 17, 0.5);
        outline-offset: 2px;
      }
      [data-aiwt-warning="error-final"] {
        outline: 1px solid rgba(187, 79, 58, 0.45);
        outline-offset: 2px;
      }
    `;

    (this.documentRef.head ?? this.documentRef.documentElement).appendChild(style);
  }

  private applyBlockWarningState(record: BlockRecord): void {
    this.ensureWarningStyles();
    if (record.warningState === 'none') {
      delete record.element.dataset.aiwtWarning;
      return;
    }

    record.element.dataset.aiwtWarning = record.warningState;
  }

  private setBlockWarningState(
    record: BlockRecord,
    warningState: BlockWarningState,
    message?: string | null,
  ): void {
    record.warningState = warningState;
    if (message !== undefined) {
      record.lastWarningMessage = message;
    }
    this.applyBlockWarningState(record);
  }

  private clearBlockWarning(
    record: BlockRecord,
    options: { resetRetries?: boolean } = {},
  ): void {
    record.warningState = 'none';
    record.lastWarningMessage = null;
    if (options.resetRetries ?? true) {
      record.retryAttemptCount = 0;
    }
    this.applyBlockWarningState(record);
  }

  private collectWarningRecords(): BlockRecord[] {
    return Array.from(this.blocksByElement.values())
      .filter((record) => record.warningState !== 'none')
      .sort(compareWarningRecords);
  }

  private buildWarningSummary(): SessionWarningSummary | null {
    const warningRecords = this.collectWarningRecords();
    if (warningRecords.length === 0) {
      return null;
    }

    return {
      totalBlocks: warningRecords.length,
      retryingBlocks: warningRecords.filter((record) => record.warningState === 'retrying').length,
      fallbackSourceBlocks: warningRecords.filter(
        (record) => record.warningState === 'fallback-source' || record.warningState === 'mixed-language',
      ).length,
      errorBlocks: warningRecords.filter((record) => record.warningState === 'error-final').length,
    };
  }

  private syncWarningSummary(immediate = true): void {
    const nextWarnings = this.buildWarningSummary();
    const currentWarnings = this.sessionSnapshot.warnings ?? null;
    if (areWarningSummariesEqual(currentWarnings, nextWarnings)) {
      return;
    }

    this.sessionSnapshot.warnings = nextWarnings;
    if (this.sessionMetrics) {
      this.sessionMetrics.warningStats = nextWarnings;
    }
    if (immediate) {
      this.emitSnapshot();
    }
  }

  private markItemsRetrying(items: TranslationBatchItem[], message: string): void {
    const localizedMessage = localizeRuntimeError(message);
    collectBatchRecords(items).forEach((record) => {
      record.retryAttemptCount += 1;
      if (record.retryAttemptCount >= 2 && record.warningState === 'none') {
        this.setBlockWarningState(record, 'retrying', localizedMessage);
      } else if (record.warningState === 'retrying') {
        this.setBlockWarningState(record, 'retrying', localizedMessage);
      } else {
        record.lastWarningMessage = localizedMessage;
      }
    });
    this.syncWarningSummary();
  }

  private markItemsFallback(items: TranslationBatchItem[], message?: string): void {
    const localizedMessage = message ? localizeRuntimeError(message) : 'この部分は原文のまま残っています。';
    collectBatchRecords(items).forEach((record) => {
      this.setBlockWarningState(record, 'fallback-source', localizedMessage);
    });
    this.syncWarningSummary();
  }

  private markItemsMixedLanguage(items: TranslationBatchItem[], message: string): void {
    const localizedMessage = localizeRuntimeError(message);
    collectBatchRecords(items).forEach((record) => {
      this.setBlockWarningState(record, 'mixed-language', localizedMessage);
    });
    this.syncWarningSummary();
  }

  private markItemsFinalError(items: TranslationBatchItem[], message: string): void {
    const localizedMessage = localizeRuntimeError(message);
    collectBatchRecords(items).forEach((record) => {
      this.setBlockWarningState(record, 'error-final', localizedMessage);
    });
    this.syncWarningSummary();
  }

  private applyGroupTranslation(
    group: TranslationGroup,
    translatedContent: string,
    refreshDisplayState = true,
    options: { clearWarnings?: boolean } = {},
  ): void {
    let content = translatedContent;
    const originalText = group.records[0]?.originalText ?? '';
    const dictTranslation = lookupCommonHeading(originalText, this.sessionSnapshot.targetLanguage);
    if (dictTranslation && looksUntranslatedShortText(content, originalText)) {
      content = dictTranslation;
    }

    // Strip any residual protected markers that leaked through restoration
    content = content.replace(/\[\[\/?[tx]\d+\]\]/gi, '');
    // Normalize double punctuation produced by models
    content = content.replace(/。{2,}/g, '。');
    // Remove orphan sentence-final punctuation at the start of text
    // (caused by MathML boundary splitting: "。巡回群の..." → "巡回群の...")
    content = content.replace(/^[。．.]\s*/u, '');
    // Remove duplicate adjacent sentences (model sometimes repeats the same
    // definition in two slightly different phrasings)
    content = deduplicateAdjacentSentences(content);

    group.records.forEach((record) => {
      if (record.contentMode === 'text') {
        record.element.textContent = content;
      } else {
        setElementHtmlContent(record.element, content, { sanitize: true });
      }

      record.translatedContent = content;
      record.displayState = 'translated';
      if (options.clearWarnings ?? true) {
        this.clearBlockWarning(record);
      }
    });

    this.syncWarningSummary(false);
    if (refreshDisplayState) {
      this.refreshDisplayState();
    }
  }

  private restoreRecords(records: BlockRecord[]): void {
    this.removeBilingualElements();
    records.forEach((record) => {
      setElementHtmlContent(record.element, record.originalHtml);
      record.displayState = 'original';
      this.clearBlockWarning(record);
    });
    this.lastFocusedWarningBlockId = null;
    this.syncWarningSummary(false);
    this.refreshDisplayState();
  }

  private applyBilingualDisplay(records: BlockRecord[]): void {
    this.removeBilingualElements();
    records.forEach((record) => {
      if (!record.translatedContent) {
        return;
      }
      // Restore original content in the element
      setElementHtmlContent(record.element, record.originalHtml);
      record.displayState = 'translated';

      // Create a translation element below the original
      const translationDiv = document.createElement('div');
      translationDiv.setAttribute('data-aiwt-bilingual', 'true');
      translationDiv.style.borderLeft = '3px solid rgba(127, 88, 12, 0.25)';
      translationDiv.style.paddingLeft = '0.75em';
      translationDiv.style.marginTop = '0.35em';
      translationDiv.style.fontSize = '0.92em';
      translationDiv.style.opacity = '0.88';

      if (record.contentMode === 'text') {
        translationDiv.textContent = record.translatedContent;
      } else {
        setElementHtmlContent(translationDiv, record.translatedContent, { sanitize: true });
      }

      record.element.insertAdjacentElement('afterend', translationDiv);
    });
  }

  private removeBilingualElements(): void {
    document.querySelectorAll('[data-aiwt-bilingual]').forEach((el) => el.remove());
  }

  private setDisplayMode(mode: PageDisplayState): ActionResponse {
    const records = Array.from(this.blocksByElement.values()).filter(
      (record) => record.translatedContent,
    );
    if (records.length === 0) {
      return { ok: false, message: 'No translations available.' };
    }

    this.removeBilingualElements();

    if (mode === 'translated') {
      records.forEach((record) => {
        if (record.contentMode === 'text') {
          record.element.textContent = record.translatedContent!;
        } else {
          setElementHtmlContent(record.element, record.translatedContent!, { sanitize: true });
        }
        record.displayState = 'translated';
      });
      void loadSettings().then((s) => this.originalTooltip.setEnabled(s.showOriginalOnHover)).catch(() => {});
    } else if (mode === 'bilingual') {
      this.originalTooltip.setEnabled(false);
      this.applyBilingualDisplay(records);
    } else {
      // 'original'
      this.originalTooltip.setEnabled(false);
      records.forEach((record) => {
        setElementHtmlContent(record.element, record.originalHtml);
        record.displayState = 'original';
      });
    }

    this.refreshDisplayState();
    return { ok: true };
  }

  private refreshDisplayState(): void {
    const records = Array.from(this.blocksByElement.values());
    const translatedRecords = records.filter((record) => record.translatedContent);
    const displayedTranslations = translatedRecords.filter(
      (record) => record.displayState === 'translated',
    );

    const hasBilingualElements = document.querySelector('[data-aiwt-bilingual]') !== null;

    let displayState: SessionSnapshot['displayState'] = 'original';
    if (hasBilingualElements && displayedTranslations.length > 0) {
      displayState = 'bilingual';
    } else if (translatedRecords.length > 0 && displayedTranslations.length === translatedRecords.length) {
      displayState = 'translated';
    } else if (displayedTranslations.length > 0) {
      displayState = 'mixed';
    }

    const hasTranslations = translatedRecords.length > 0;
    const warnings = this.buildWarningSummary();
    const warningsChanged = !areWarningSummariesEqual(this.sessionSnapshot.warnings ?? null, warnings);
    if (
      this.sessionSnapshot.displayState === displayState &&
      this.sessionSnapshot.hasTranslations === hasTranslations &&
      !warningsChanged
    ) {
      return;
    }

    this.sessionSnapshot.displayState = displayState;
    this.sessionSnapshot.hasTranslations = hasTranslations;
    this.sessionSnapshot.warnings = warnings;
    this.emitSnapshot();
  }

  private async clearCacheForRecords(
    records: BlockRecord[],
    settings: ExtensionSettings,
  ): Promise<void> {
    const context = this.buildContext(settings.targetLanguage);
    const groups = this.buildDerivedGroups(records, settings, context);
    await removeCachedTranslations(groups.map((group) => group.cacheLookup));
  }

  private setupLazyPageSession(options: {
    sessionId: string;
    groups: TranslationGroup[];
    settings: ResolvedSettings;
    context: TranslationContext;
    totalJobs: number;
    processedJobs: number;
    cacheStore?: Map<string, string>;
    runtimeState: TranslationRuntimeState;
  }): void {
    this.cancelLazyPageSession();

    const session: LazyPageSession = {
      sessionId: options.sessionId,
      settings: options.settings,
      context: options.context,
      totalJobs: options.totalJobs,
      processedJobs: options.processedJobs,
      pendingGroups: new Map(options.groups.map((group) => [group.groupKey, group])),
      queuedGroupKeys: new Set<string>(),
      observedElements: new Map<Element, string>(),
      observer: null,
      scrollListener: null,
      processing: false,
      cancelled: false,
      cacheStore: options.cacheStore,
      runtimeState: options.runtimeState,
    };

    if (typeof IntersectionObserver !== 'undefined') {
      session.observer = new IntersectionObserver(
        (entries) => {
          this.handleLazyPageEntries(session, entries);
        },
        {
          rootMargin: '125% 0px',
        },
      );
    }

    session.scrollListener = () => {
      this.handleLazyPageViewportProgress(session);
    };
    window.addEventListener('scroll', session.scrollListener, { passive: true });
    window.addEventListener('resize', session.scrollListener);

    options.groups.forEach((group) => {
      group.records.forEach((record) => {
        if (session.observedElements.has(record.element)) {
          return;
        }

        session.observedElements.set(record.element, group.groupKey);
        session.observer?.observe(record.element);
      });
    });

    this.lazyPageSession = session;
    const lazyVisibleGroups = options.groups.filter((group) => group.queueClass === 'lazy-visible');
    lazyVisibleGroups.forEach((group) => {
      session.queuedGroupKeys.add(group.groupKey);
      this.stopObservingGroup(session, group.groupKey);
    });

    if (!session.observer) {
      options.groups.forEach((group) => session.queuedGroupKeys.add(group.groupKey));
    }

    if (session.queuedGroupKeys.size > 0) {
      this.setSnapshot(
        {
          status: 'translating',
          activeSessionId: session.sessionId,
          progressPercent: this.calculateProgress(
            options.processedJobs,
            options.totalJobs,
          ),
        },
        { immediate: true },
      );
      this.overlay.setWorking();
      void this.flushLazyPageSession(session);
      return;
    }

    this.setSnapshot(
      {
        status: 'lazy',
        activeSessionId: null,
        progressPercent: this.calculateProgress(
          options.processedJobs,
          options.totalJobs,
        ),
      },
      { immediate: true },
    );
    this.overlay.setResting();
  }

  private handleLazyPageEntries(
    session: LazyPageSession,
    entries: IntersectionObserverEntry[],
  ): void {
    if (this.lazyPageSession !== session || session.cancelled) {
      return;
    }

    let queued = false;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const groupKey = session.observedElements.get(entry.target);
      if (!groupKey || !session.pendingGroups.has(groupKey)) {
        return;
      }

      this.stopObservingGroup(session, groupKey);
      session.queuedGroupKeys.add(groupKey);
      queued = true;
    });

    if (queued) {
      void this.flushLazyPageSession(session);
    }
  }

  private handleLazyPageViewportProgress(session: LazyPageSession): void {
    if (
      this.lazyPageSession !== session ||
      session.cancelled ||
      session.processing ||
      session.pendingGroups.size === 0 ||
      session.queuedGroupKeys.size > 0
    ) {
      return;
    }

    if (!this.isNearBottomOfPage()) {
      return;
    }

    session.pendingGroups.forEach((_group, groupKey) => {
      this.stopObservingGroup(session, groupKey);
      session.queuedGroupKeys.add(groupKey);
    });
    void this.flushLazyPageSession(session);
  }

  private async flushLazyPageSession(session: LazyPageSession): Promise<void> {
    if (
      this.lazyPageSession !== session ||
      session.cancelled ||
      session.processing ||
      session.queuedGroupKeys.size === 0
    ) {
      return;
    }

    session.processing = true;
    this.setSnapshot(
      {
        status: 'translating',
        activeSessionId: session.sessionId,
      },
      { immediate: true },
    );
    this.overlay.setWorking({ message: '翻訳を再開しています' });
    const queuedGroups = Array.from(session.queuedGroupKeys)
      .map((groupKey) => session.pendingGroups.get(groupKey))
      .filter((group): group is TranslationGroup => Boolean(group));
    session.queuedGroupKeys.clear();
    const scheduledGroups = this.expandLazyFlushGroups(session, queuedGroups);

    const cachedTranslations = await this.resolveLazyCachedTranslations(session, scheduledGroups);
    const hydrated = this.hydrateGroups(scheduledGroups, {
      forceRefresh: false,
      cachedTranslations,
      sessionId: session.sessionId,
      totalJobs: session.totalJobs,
      progressMessage: 'Using saved translations...',
      showOverlay: false,
    });
    const prioritizedPendingGroups = [...hydrated.pendingGroups].sort(compareGroupsForLazyExecution);

    scheduledGroups.forEach((group) => {
      if (!hydrated.pendingGroups.includes(group)) {
        session.pendingGroups.delete(group.groupKey);
      }
    });
    session.processedJobs += hydrated.processedJobs;

    try {
      if (hydrated.pendingGroups.length > 0) {
        session.processedJobs = await this.processGroupBatches({
          groups: prioritizedPendingGroups,
          settings: session.settings,
          context: session.context,
          sessionId: session.sessionId,
          totalJobs: session.totalJobs,
          processedJobs: session.processedJobs,
          cacheStore: session.cacheStore,
          runtimeState: session.runtimeState,
          showOverlay: true,
          overlayMessage: 'Translating newly visible content...',
          batchProfile: 'deferred',
          metricsPhase: scheduledGroups.some((group) => group.queueClass === 'lazy-visible')
            ? 'lazyVisible'
            : 'deferred',
        });
      }

      hydrated.pendingGroups.forEach((group) => {
        session.pendingGroups.delete(group.groupKey);
      });
    } catch (error) {
      if (isTranslationCancelledError(error) || session.cancelled) {
        session.processing = false;
        return;
      }
      if (this.lazyPageSession === session && !session.cancelled) {
        const message = getErrorMessage(error, 'Translation failed.');
        logTranslationError('Lazy translation failed.', error, {
          pageKey: this.pageKey,
          sessionId: session.sessionId,
          scope: session.settings.resolvedScope,
        });
        this.setSnapshot(
          {
            status: 'failed',
            lastError: message,
            activeSessionId: null,
          },
          { immediate: true },
        );
        this.cleanupLazyPageSessionResources(session);
        this.lazyPageSession = null;
        this.overlay.setError(message);
      }
      session.processing = false;
      throw error;
    }

    if (this.lazyPageSession !== session || session.cancelled) {
      return;
    }

    session.processing = false;
    this.recordLazyVisibleCompletion(session);
    if (session.pendingGroups.size === 0) {
      await this.retryWarningGroups({
        sessionId: session.sessionId,
        settings: session.settings,
        context: session.context,
        runtimeState: session.runtimeState,
      });
      const completion = this.finishSession(session.sessionId);
      this.cleanupLazyPageSessionResources(session);
      this.presentCompletionOverlay('ページ全体を訳し終えました。', completion?.warnings ?? null);
      this.setupDynamicContentObserver(session.settings.resolvedScope, session.settings, session.context);
      this.lazyPageSession = null;
      return;
    }

    this.setSnapshot(
      {
        status: 'lazy',
        activeSessionId: null,
        progressPercent: this.calculateProgress(
          session.processedJobs,
          session.totalJobs,
        ),
      },
      { immediate: true },
    );
    this.overlay.setResting();

    if (session.queuedGroupKeys.size > 0) {
      void this.flushLazyPageSession(session);
    }
  }

  private expandLazyFlushGroups(
    session: LazyPageSession,
    queuedGroups: TranslationGroup[],
  ): TranslationGroup[] {
    if (queuedGroups.length === 0) {
      return queuedGroups;
    }

    const selected = [...queuedGroups].sort(compareGroupsForScheduling);
    let totalTokens = selected.reduce(
      (sum, group) => sum + getGroupPromptTokens(group, session.runtimeState.calibration),
      0,
    );
    if (totalTokens >= LAZY_PREFETCH_MIN_TOKENS || this.isNearBottomOfPage()) {
      return selected;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const maxTop = Math.max(...selected.map((group) => group.top));
    const topThreshold = maxTop + viewportHeight * LAZY_PREFETCH_VIEWPORT_MULTIPLIER;
    const selectedKeys = new Set(selected.map((group) => group.groupKey));
    const candidates = Array.from(session.pendingGroups.values())
      .filter((group) => !selectedKeys.has(group.groupKey))
      .sort(compareGroupsForScheduling);

    for (const candidate of candidates) {
      if (selected.length >= queuedGroups.length + LAZY_PREFETCH_MAX_EXTRA_GROUPS) {
        break;
      }

      if (candidate.top > topThreshold) {
        break;
      }

      selected.push(candidate);
      selectedKeys.add(candidate.groupKey);
      totalTokens += getGroupPromptTokens(candidate, session.runtimeState.calibration);
      this.stopObservingGroup(session, candidate.groupKey);

      if (totalTokens >= LAZY_PREFETCH_MIN_TOKENS) {
        break;
      }
    }

    return selected;
  }

  private recordLazyVisibleCompletion(session: LazyPageSession): void {
    if (this.sessionMetrics?.phaseTimings.lazyVisibleCompletedMs !== null) {
      return;
    }

    const hasRemainingLazyVisible = Array.from(session.pendingGroups.values()).some(
      (group) => group.queueClass === 'lazy-visible',
    );
    const hasQueuedLazyVisible = Array.from(session.queuedGroupKeys).some((groupKey) => {
      return session.pendingGroups.get(groupKey)?.queueClass === 'lazy-visible';
    });

    if (!hasRemainingLazyVisible && !hasQueuedLazyVisible) {
      this.recordPhaseTiming('lazyVisibleCompletedMs');
    }
  }

  private stopObservingGroup(session: LazyPageSession, groupKey: string): void {
    session.observedElements.forEach((registeredGroupKey, element) => {
      if (registeredGroupKey !== groupKey) {
        return;
      }

      session.observer?.unobserve(element);
      session.observedElements.delete(element);
    });
  }

  private cancelLazyPageSession(refreshOverlay = true): void {
    if (!this.lazyPageSession) {
      return;
    }

    this.lazyPageSession.cancelled = true;
    this.cleanupLazyPageSessionResources(this.lazyPageSession);
    this.lazyPageSession = null;
    if (refreshOverlay) {
      this.refreshOverlayForIdleState();
    }
  }

  private cleanupLazyPageSessionResources(session: LazyPageSession): void {
    session.observer?.disconnect();
    if (session.scrollListener) {
      window.removeEventListener('scroll', session.scrollListener);
      window.removeEventListener('resize', session.scrollListener);
      session.scrollListener = null;
    }
  }

  // --- Dynamic content observation (post-translation) ---

  private setupDynamicContentObserver(
    scope: DefaultTranslationScope,
    settings: ResolvedSettings,
    context: TranslationContext,
  ): void {
    this.teardownDynamicContentObserver();
    this.lastCompletedSettings = settings;
    this.lastCompletedContext = context;
    this.lastCompletedScope = scope;

    const root = resolveScopeRoot(this.documentRef, scope);
    const observerOptions: MutationObserverInit = { childList: true, subtree: true };

    this.dynamicContentObserver = new MutationObserver((mutations) => {
      let hasNewElements = false;

      for (const mutation of mutations) {
        for (const node of Array.from(mutation.removedNodes)) {
          if (node.nodeType === 1) {
            const el = node as HTMLElement;
            this.blocksByElement.delete(el);
            for (const descendant of el.querySelectorAll('*')) {
              this.blocksByElement.delete(descendant as HTMLElement);
            }
          }
        }
        if (!hasNewElements) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === 1) {
              hasNewElements = true;
              break;
            }
          }
        }
      }

      if (!hasNewElements) return;

      if (this.dynamicContentDebounceId !== null) {
        window.clearTimeout(this.dynamicContentDebounceId);
      }
      this.dynamicContentDebounceId = window.setTimeout(() => {
        this.dynamicContentDebounceId = null;
        void this.handleDynamicContentMutation(root, observerOptions);
      }, 500);
    });

    this.dynamicContentObserver.observe(root, observerOptions);
  }

  private async handleDynamicContentMutation(
    root: HTMLElement,
    observerOptions: MutationObserverInit,
  ): Promise<void> {
    if (this.dynamicContentTranslating) {
      this.dynamicContentPendingRescan = true;
      return;
    }
    const activeStatus = this.sessionSnapshot.status;
    if (activeStatus === 'translating' || activeStatus === 'scanning' || activeStatus === 'retrying' || activeStatus === 'queued') {
      return;
    }
    if (!this.lastCompletedSettings || !this.lastCompletedContext || !this.lastCompletedScope) {
      return;
    }

    const settings = this.lastCompletedSettings;
    const context = this.lastCompletedContext;

    const allBlocks = collectTranslatableBlocks(root);
    const newSeeds = allBlocks.filter((seed) => !this.blocksByElement.has(seed.element));
    if (newSeeds.length === 0) {
      return;
    }

    this.dynamicContentTranslating = true;
    this.dynamicContentPendingRescan = false;

    try {
      const newRecords = this.registerBlocks(newSeeds);
      await this.translateDynamicBlocks(newRecords, settings, context, root, observerOptions);
      this.pageScans.delete(this.lastCompletedScope);
    } catch (error) {
      logWithContext('warn', '[AI Web Translator] Dynamic content translation failed.', {
        pageKey: this.pageKey,
        error,
      });
    } finally {
      this.dynamicContentTranslating = false;
      if (this.dynamicContentPendingRescan) {
        this.dynamicContentPendingRescan = false;
        void this.handleDynamicContentMutation(root, observerOptions);
      }
    }
  }

  private async translateDynamicBlocks(
    records: BlockRecord[],
    settings: ResolvedSettings,
    context: TranslationContext,
    root: HTMLElement,
    observerOptions: MutationObserverInit,
  ): Promise<void> {
    const groups = this.buildDerivedGroups(records, settings, context);
    if (groups.length === 0) return;

    const calibration = await getEstimateCalibrationSnapshot(settings.provider, settings.model);
    const runtimeState = this.createRuntimeState(groups, calibration, settings.style);
    const sessionId = crypto.randomUUID();
    this.dynamicContentSessionId = sessionId;

    // Disconnect observer to prevent reentrant mutations from DOM writes
    this.dynamicContentObserver?.disconnect();
    try {
      await this.processGroupBatches({
        groups,
        settings,
        context,
        sessionId,
        totalJobs: groups.length,
        processedJobs: 0,
        runtimeState,
        showOverlay: false,
        overlayMessage: '',
        batchProfile: 'deferred',
        metricsPhase: 'deferred',
      });
      this.refreshDisplayState();
    } finally {
      this.dynamicContentSessionId = null;
      // Reconnect observer
      this.dynamicContentObserver?.observe(root, observerOptions);
    }
  }

  private teardownDynamicContentObserver(): void {
    if (this.dynamicContentDebounceId !== null) {
      window.clearTimeout(this.dynamicContentDebounceId);
      this.dynamicContentDebounceId = null;
    }
    if (this.dynamicContentSessionId) {
      this.cancelledSessionIds.add(this.dynamicContentSessionId);
      this.dynamicContentSessionId = null;
    }
    this.dynamicContentObserver?.disconnect();
    this.dynamicContentObserver = null;
    this.lastCompletedSettings = null;
    this.lastCompletedContext = null;
    this.lastCompletedScope = null;
    this.dynamicContentTranslating = false;
    this.dynamicContentPendingRescan = false;
  }

  private refreshDerivedSnapshotVisibility(scan: PageScanSnapshot): void {
    scan.derivedSnapshots.forEach((derived) => {
      derived.groups.forEach((group) => {
        group.isVisible = group.records.some((record) => this.isElementVisible(record.element));
        group.top = Math.min(...group.records.map((record) => record.element.getBoundingClientRect().top));
        group.priorityScore = Math.max(...group.records.map((record) => record.priorityScore));
      });
    });
  }

  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return false;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    return rect.bottom >= -viewportHeight && rect.top <= viewportHeight * 2;
  }

  private isNearBottomOfPage(): boolean {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
    );

    return scrollTop + viewportHeight >= scrollHeight - LAZY_FORCE_FLUSH_BOTTOM_THRESHOLD_PX;
  }

  private isSessionCancelled(sessionId: string): boolean {
    return this.cancelledSessionIds.has(sessionId);
  }

  private throwIfSessionCancelled(sessionId: string): void {
    if (this.isSessionCancelled(sessionId)) {
      throw new TranslationCancelledError();
    }
  }

  private startSessionMetrics(): void {
    this.sessionMetricsStartedAt = Date.now();
    this.sessionMetrics = {
      phaseTimings: {
        immediateCompletedMs: null,
        lazyVisibleCompletedMs: null,
        completedMs: null,
      },
      retryCounts: {
        total: 0,
        transient: 0,
        outputLimit: 0,
        fragmentCountMismatch: 0,
        invalidPayload: 0,
        batchSplits: 0,
        fragmentSplits: 0,
      },
      cacheStats: {
        memoryHits: 0,
        persistentHits: 0,
        misses: 0,
      },
      requestCountsByPhase: {
        immediate: 0,
        lazyVisible: 0,
        deferred: 0,
      },
      splitStats: {
        batchByContentMode: {
          text: 0,
          html: 0,
        },
        batchByMarkerPresence: {
          marked: 0,
          plain: 0,
        },
        batchBySize: {
          one: 0,
          two: 0,
          threeOrFour: 0,
          fiveOrMore: 0,
        },
        fragmentByContentMode: {
          text: 0,
          html: 0,
        },
      },
      splitEventSamples: [],
      immediateBatch: null,
      qualitySignals: {
        sourceFallbackFragments: 0,
        protectedMarkerFallbackFragments: 0,
        mixedRegisterSignals: 0,
        labelPunctuationCorrections: 0,
        continuationContextFragments: 0,
        untranslatedResponses: 0,
        mixedLanguageDetections: 0,
      },
      warningStats: null,
    };
  }

  private cloneSessionMetrics(): SessionRuntimeMetrics | null {
    return this.sessionMetrics
      ? structuredClone(this.sessionMetrics)
      : null;
  }

  private recordPhaseTiming(
    phase: keyof SessionRuntimeMetrics['phaseTimings'],
  ): void {
    if (!this.sessionMetrics || this.sessionMetricsStartedAt === 0) {
      return;
    }

    if (this.sessionMetrics.phaseTimings[phase] !== null) {
      return;
    }

    this.sessionMetrics.phaseTimings[phase] = Date.now() - this.sessionMetricsStartedAt;
  }

  private recordRequestBatches(
    phase: keyof SessionRuntimeMetrics['requestCountsByPhase'],
    count: number,
  ): void {
    if (!this.sessionMetrics || count <= 0) {
      return;
    }

    this.sessionMetrics.requestCountsByPhase[phase] += count;
  }

  private recordCacheHit(
    kind: keyof SessionRuntimeMetrics['cacheStats'],
    count = 1,
  ): void {
    if (!this.sessionMetrics || count <= 0) {
      return;
    }

    this.sessionMetrics.cacheStats[kind] += count;
  }

  private recordRetry(reason: keyof SessionRuntimeMetrics['retryCounts']): void {
    if (!this.sessionMetrics) {
      return;
    }

    this.sessionMetrics.retryCounts.total += 1;
    this.sessionMetrics.retryCounts[reason] += 1;
  }

  private recordQualitySignal(
    signal: keyof SessionRuntimeMetrics['qualitySignals'],
    count = 1,
  ): void {
    if (!this.sessionMetrics || count <= 0) {
      return;
    }

    this.sessionMetrics.qualitySignals[signal] += count;
  }

  private recordBatchSplitStats(items: TranslationBatchItem[]): void {
    if (!this.sessionMetrics || items.length === 0) {
      return;
    }

    const contentMode = items[0]?.contentMode ?? 'html';
    this.sessionMetrics.splitStats.batchByContentMode[contentMode] += 1;

    const hasMarkers = items.some(
      (item) => Boolean(item.placeholderTagMap) || Boolean(item.protectedHtmlMap),
    );
    this.sessionMetrics.splitStats.batchByMarkerPresence[hasMarkers ? 'marked' : 'plain'] += 1;

    if (items.length <= 1) {
      this.sessionMetrics.splitStats.batchBySize.one += 1;
    } else if (items.length === 2) {
      this.sessionMetrics.splitStats.batchBySize.two += 1;
    } else if (items.length <= 4) {
      this.sessionMetrics.splitStats.batchBySize.threeOrFour += 1;
    } else {
      this.sessionMetrics.splitStats.batchBySize.fiveOrMore += 1;
    }
  }

  private recordBatchSplitEvent(
    items: TranslationBatchItem[],
    phase: keyof SessionRuntimeMetrics['requestCountsByPhase'],
    reason: string,
  ): void {
    if (!this.sessionMetrics || items.length === 0) {
      return;
    }

    const bucketKey = getBatchBucketKey(items[0], isXmlLikeRuntimeDocument(this.documentRef));
    const averageEstimatedTokens =
      items.reduce((sum, item) => sum + item.estimatedTokens, 0) / items.length;
    const flattenedFragmentCount = items.reduce(
      (sum, item) => sum + item.group.requestFragments.length,
      0,
    );
    const maxGroupEstimatedTokens = Math.max(...items.map((item) => item.group.estimatedTokens));
    const maxGroupFragmentCount = Math.max(
      ...items.map((item) => item.group.requestFragments.length),
    );
    const hasMarkers = items.some(
      (item) => Boolean(item.placeholderTagMap) || Boolean(item.protectedHtmlMap),
    );

    this.sessionMetrics.splitEventSamples.push({
      phase,
      bucketKey,
      contentMode: items[0].contentMode,
      hasMarkers,
      itemCount: items.length,
      flattenedFragmentCount,
      averageEstimatedTokens: Number(averageEstimatedTokens.toFixed(3)),
      maxGroupEstimatedTokens,
      maxGroupFragmentCount,
      reason,
    });

    if (this.sessionMetrics.splitEventSamples.length > 5) {
      this.sessionMetrics.splitEventSamples.shift();
    }
  }

  private recordFragmentSplitStats(item: TranslationBatchItem | undefined): void {
    if (!this.sessionMetrics || !item) {
      return;
    }

    this.sessionMetrics.splitStats.fragmentByContentMode[item.contentMode] += 1;
  }

  private recordImmediateBatchShape(
    items: TranslationBatchItem[],
    calibration: EstimateCalibrationSnapshot,
  ): void {
    if (!this.sessionMetrics || this.sessionMetrics.immediateBatch || items.length === 0) {
      return;
    }

    const contentMode = resolveImmediateBatchContentMode(items);
    const preparedChars = items.reduce((sum, item) => sum + item.preparedContent.length, 0);
    const hasMarkers = items.some(
      (item) => Boolean(item.placeholderTagMap) || Boolean(item.protectedHtmlMap),
    );
    const batchEstimate: EstimateBatchShape = {
      contentMode: contentMode === 'mixed' ? items[0].contentMode : contentMode,
      preparedChars,
      fragmentCount: items.length,
    };

    this.sessionMetrics.immediateBatch = {
      groupCount: new Set(items.map((item) => item.group.groupKey)).size,
      fragmentCount: items.length,
      contentMode,
      preparedChars,
      estimatedPromptTokens: estimatePromptTokensForBatch(batchEstimate, calibration),
      hasMarkers,
      providerLatencyMs: null,
      backgroundProviderLatencyMs: null,
      bridgeLatencyMs: null,
    };
  }

  private recordImmediateBatchLatency(latencyMs: number, providerDurationMs?: number): void {
    if (
      !this.sessionMetrics?.immediateBatch ||
      this.sessionMetrics.immediateBatch.providerLatencyMs !== null
    ) {
      return;
    }

    this.sessionMetrics.immediateBatch.providerLatencyMs = latencyMs;
    if (typeof providerDurationMs === 'number' && Number.isFinite(providerDurationMs)) {
      this.sessionMetrics.immediateBatch.backgroundProviderLatencyMs = providerDurationMs;
      this.sessionMetrics.immediateBatch.bridgeLatencyMs = Math.max(
        0,
        latencyMs - providerDurationMs,
      );
    }
  }

  private recordBatchSuccess(
    batch: TranslationBatchItem[],
    runtimeState: TranslationRuntimeState,
  ): void {
    if (batch.length === 0) {
      return;
    }

    const contentMode = batch[0].contentMode;
    runtimeState.successStreak[contentMode] += 1;
    runtimeState.stableBatchWins += 1;
    if (
      runtimeState.stableBatchWins >= RUNTIME_CONCURRENCY_PROMOTION_STREAK &&
      runtimeState.maxConcurrency < MAX_RUNTIME_CONCURRENCY
    ) {
      runtimeState.maxConcurrency += 1;
      runtimeState.stableBatchWins = 0;
    }
  }

  private recordBatchFailure(
    batch: TranslationBatchItem[],
    error: unknown,
    runtimeState: TranslationRuntimeState,
  ): void {
    if (batch.length === 0) {
      return;
    }

    const contentMode = batch[0].contentMode;
    runtimeState.successStreak[contentMode] = 0;
    runtimeState.stableBatchWins = 0;
    runtimeState.maxConcurrency = Math.max(
      MIN_RUNTIME_CONCURRENCY,
      runtimeState.maxConcurrency - 1,
    );
    runtimeState.batchScale[contentMode] = Math.max(
      BATCH_SCALE_MIN,
      runtimeState.batchScale[contentMode] * BATCH_SCALE_BACKOFF,
    );

    if (error instanceof OutputLimitTranslationError) {
      this.recordRetry('outputLimit');
      return;
    }

    if (error instanceof FragmentCountMismatchTranslationError) {
      this.recordRetry('fragmentCountMismatch');
      return;
    }

    const lowerMessage = getErrorMessage(error, '').trim().toLowerCase();
    if (lowerMessage.includes('invalid translations payload')) {
      this.recordRetry('invalidPayload');
      return;
    }

    if (isRetryableTranslationError(error)) {
      this.recordRetry('transient');
    }
  }

  private setSnapshot(
    partial: Partial<SessionSnapshot>,
    options: { immediate?: boolean } = {},
  ): void {
    const warnings =
      partial.warnings === undefined ? this.buildWarningSummary() : partial.warnings;
    if (this.sessionMetrics) {
      this.sessionMetrics.warningStats = warnings;
    }
    this.sessionSnapshot = {
      ...this.sessionSnapshot,
      ...partial,
      pageKey: this.pageKey,
      warnings,
      metrics:
        partial.metrics === undefined
          ? this.cloneSessionMetrics()
          : partial.metrics,
    };

    if (options.immediate ?? true) {
      this.emitSnapshot();
    }
  }

  private recordPageIndexIfNeeded(settings: ResolvedSettings): void {
    if (this.pageIndexRecorded) return;
    this.pageIndexRecorded = true;
    this.lastUsedModel = settings.model;
    void setPageIndexEntry({
      url: this.pageKey,
      title: this.documentRef.title,
      translatedAt: Date.now(),
      model: settings.model,
      targetLanguage: settings.targetLanguage,
      scope: this.sessionSnapshot.scope ?? 'main',
    }).catch(() => {});
  }

  private finishSession(
    sessionId: string,
  ): { status: TranslationStatus; warnings: SessionWarningSummary | null } | null {
    if (this.sessionSnapshot.activeSessionId !== sessionId && this.lazyPageSession?.sessionId !== sessionId) {
      return null;
    }

    this.cancelledSessionIds.delete(sessionId);
    this.recordPhaseTiming('immediateCompletedMs');
    this.recordPhaseTiming('lazyVisibleCompletedMs');
    this.recordPhaseTiming('completedMs');
    const warnings = this.buildWarningSummary();
    const status: TranslationStatus = warnings ? 'completed_with_warnings' : 'completed';
    // Update final timestamp if batches actually ran (lastUsedModel is set by recordPageIndexIfNeeded)
    if (this.lastUsedModel) {
      void setPageIndexEntry({
        url: this.pageKey,
        title: this.documentRef.title,
        translatedAt: Date.now(),
        model: this.lastUsedModel,
        targetLanguage: this.sessionSnapshot.targetLanguage,
        scope: this.sessionSnapshot.scope ?? 'main',
      }).catch(() => {});
    }
    this.setSnapshot(
      {
        status,
        progressPercent: 100,
        activeSessionId: null,
        lastError: null,
      },
      { immediate: true },
    );
    return { status, warnings };
  }

  private presentCompletionOverlay(
    successMessage: string,
    warnings: SessionWarningSummary | null,
  ): void {
    if (warnings) {
      this.overlay.setWarningResting(buildWarningSummaryMessage(warnings), {
        warningAvailable: true,
      });
      return;
    }

    this.overlay.complete(successMessage);
  }

  private updateProgress(
    sessionId: string,
    processedJobs: number,
    totalJobs: number,
    _message: string,
    showOverlay = true,
  ): void {
    if (
      this.sessionSnapshot.activeSessionId !== sessionId &&
      this.lazyPageSession?.sessionId !== sessionId
    ) {
      return;
    }

    const percent = this.calculateProgress(processedJobs, totalJobs);
    const now = Date.now();
    const shouldEmit =
      percent === 100 ||
      this.lastProgressPercent === -1 ||
      (percent !== this.lastProgressPercent &&
        (now - this.lastProgressEmitAt >= PROGRESS_EMIT_INTERVAL_MS ||
          Math.abs(percent - this.lastProgressPercent) >= 10));

    this.setSnapshot(
      {
        progressPercent: percent,
      },
      { immediate: shouldEmit },
    );
    if (showOverlay && this.sessionSnapshot.activeSessionId === sessionId) {
      this.overlay.setWorking({ completed: processedJobs, total: totalJobs });
    }

    if (shouldEmit) {
      this.lastProgressEmitAt = now;
      this.lastProgressPercent = percent;
    }
  }

  private calculateProgress(processedJobs: number, totalJobs: number): number {
    if (totalJobs === 0) {
      return 100;
    }
    return Math.round((processedJobs / totalJobs) * 100);
  }

  private emitSnapshot(): void {
    void chrome.runtime.sendMessage({
      type: 'SESSION_STATE_CHANGED',
      snapshot: this.sessionSnapshot,
    }).catch((error: unknown) => {
      if (isIgnorableRuntimeMessageError(error)) {
        return;
      }

      logWithContext('debug', '[AI Web Translator] Session snapshot delivery failed.', {
        pageKey: this.pageKey,
        error,
      });
    });
  }

  private refreshOverlayForIdleState(): void {
    if (this.lazyPageSession) {
      this.overlay.setResting();
      return;
    }

    if (this.sessionSnapshot.warnings?.totalBlocks) {
      this.overlay.setWarningResting(buildWarningSummaryMessage(this.sessionSnapshot.warnings), {
        warningAvailable: true,
      });
      return;
    }

    if (this.sessionSnapshot.hasTranslations) {
      this.overlay.setResting();
      return;
    }

    this.overlay.showIdleIcon();
  }

  private createRuntimeState(
    groups: TranslationGroup[],
    calibration: EstimateCalibrationSnapshot,
    style: TranslationStyle,
  ): TranslationRuntimeState {
    const glossaryCandidates = new Map<string, { source: string; count: number }>();

    groups.forEach((group) => {
      if (!isGlossaryCandidateGroup(group)) {
        return;
      }

      glossaryCandidates.set(group.groupKey, {
        source: group.records[0]?.originalText ?? '',
        count: group.records.length,
      });
    });

    return {
      calibration,
      glossary: new Map(),
      glossaryCandidates,
      pageRegister: resolvePageRegister(style),
      batchScale: {
        text: 1,
        html: 1,
      },
      successStreak: {
        text: 0,
        html: 0,
      },
      maxConcurrency: DEFAULT_RUNTIME_CONCURRENCY,
      stableBatchWins: 0,
    };
  }

  private captureGlossaryTranslation(
    group: TranslationGroup,
    translatedContent: string,
    runtimeState: TranslationRuntimeState,
  ): void {
    const candidate = runtimeState.glossaryCandidates.get(group.groupKey);
    if (!candidate || candidate.count < 3) {
      return;
    }

    const target = normalizeText(translatedContent);
    if (target.length === 0 || target.length > 80) {
      return;
    }

    runtimeState.glossary.set(candidate.source, target);
  }

  private async resolveLazyCachedTranslations(
    session: LazyPageSession,
    groups: TranslationGroup[],
  ): Promise<Map<string, string>> {
    if (!session.settings.cacheEnabled || groups.length === 0) {
      return new Map();
    }

    if (!session.cacheStore) {
      session.cacheStore = await this.resolveCachedTranslationsForGroups(groups);
      return session.cacheStore;
    }

    const missingGroups = groups.filter((group) => !session.cacheStore?.has(group.cacheLookupKey));
    if (missingGroups.length === 0) {
      return session.cacheStore;
    }

    const fetched = await this.resolveCachedTranslationsForGroups(missingGroups);
    fetched.forEach((translation, lookupKey) => {
      session.cacheStore?.set(lookupKey, translation);
    });
    return session.cacheStore;
  }

  private getBatchingOverrides(
    profile: 'immediate' | 'deferred',
    _runtimeState?: TranslationRuntimeState,
  ): {
    plainHtmlItemLimit?: number;
    plainHtmlMinimumTokenFloor?: number;
    plainHtmlAverageTokenThreshold?: number;
    xmlHeavyPlainHtmlItemLimit?: number;
    xmlHeavyPlainHtmlMinimumTokenFloor?: number;
    xmlMarkedTextItemLimit?: number;
    xmlMarkedTextMinimumTokenFloor?: number;
  } {
    if (isXmlLikeRuntimeDocument(this.documentRef)) {
      return {
        xmlHeavyPlainHtmlItemLimit: 4,
        xmlHeavyPlainHtmlMinimumTokenFloor: 1600,
        xmlMarkedTextItemLimit: 4,
        xmlMarkedTextMinimumTokenFloor: 1400,
      };
    }

    if (profile === 'deferred') {
      return {
        plainHtmlItemLimit: 4,
        plainHtmlMinimumTokenFloor: 1800,
        plainHtmlAverageTokenThreshold: 260,
      };
    }

    return {};
  }
}

function createBatchItems(
  groups: TranslationGroup[],
  calibration: EstimateCalibrationSnapshot,
): TranslationBatchItem[] {
  return groups.flatMap((group) =>
    group.requestFragments.map((fragment, fragmentIndex) => ({
      group,
      fragmentIndex,
      contentMode: fragment.requestContentMode,
      restoreContentMode: fragment.restoreContentMode,
      preparedContent: fragment.preparedContent,
      sourceHintText: fragment.sourceHintText,
      fragmentRole: fragment.fragmentRole,
      precedingContext: fragment.precedingContext,
      restoreMap: fragment.restoreMap,
      placeholderTagMap: fragment.placeholderTagMap,
      placeholderWrapperPrefix: fragment.placeholderWrapperPrefix,
      placeholderWrapperSuffix: fragment.placeholderWrapperSuffix,
      skipWrapperRestore: fragment.skipWrapperRestore,
      protectedHtmlMap: fragment.protectedHtmlMap,
      hasMarkers: Boolean(fragment.placeholderTagMap || fragment.protectedHtmlMap),
      estimatedTokens: estimatePromptTokensForContent(
        fragment.requestContentMode,
        fragment.preparedContent.length,
        calibration,
      ),
      rawEstimatedTokens: estimateTokensFromChars(fragment.preparedContent.length),
    })),
  );
}

function batchBatchItems(
  items: TranslationBatchItem[],
  options: {
    tokenLimit: number;
    itemLimit: number;
    minimumTokenFloor?: number;
    plainHtmlItemLimit?: number;
    plainHtmlMinimumTokenFloor?: number;
    plainHtmlAverageTokenThreshold?: number;
    xmlHeavyPlainHtmlItemLimit?: number;
    xmlHeavyPlainHtmlMinimumTokenFloor?: number;
    xmlMarkedTextItemLimit?: number;
    xmlMarkedTextMinimumTokenFloor?: number;
    xmlLikeDocument?: boolean;
  } = {
    tokenLimit: DEFERRED_BATCH_TOKEN_LIMIT,
    itemLimit: DEFERRED_BATCH_ITEM_LIMIT,
  },
): TranslationBatchItem[][] {
  const batches: TranslationBatchItem[][] = [];
  const modeBuckets = new Map<string, TranslationBatchItem[]>();

  items.forEach((item) => {
    const bucketKey = getBatchBucketKey(item, options.xmlLikeDocument === true);
    const bucket = modeBuckets.get(bucketKey) ?? [];
    bucket.push(item);
    modeBuckets.set(bucketKey, bucket);
  });

  modeBuckets.forEach((bucket, bucketKey) => {
    const bucketLimits = resolveBucketBatchLimits(bucketKey, bucket, options, {
      plainHtmlItemLimit: options.plainHtmlItemLimit,
      plainHtmlMinimumTokenFloor: options.plainHtmlMinimumTokenFloor,
      plainHtmlAverageTokenThreshold: options.plainHtmlAverageTokenThreshold,
      xmlHeavyPlainHtmlItemLimit: options.xmlHeavyPlainHtmlItemLimit,
      xmlHeavyPlainHtmlMinimumTokenFloor: options.xmlHeavyPlainHtmlMinimumTokenFloor,
      xmlMarkedTextItemLimit: options.xmlMarkedTextItemLimit,
      xmlMarkedTextMinimumTokenFloor: options.xmlMarkedTextMinimumTokenFloor,
    });
    const bucketBatches: TranslationBatchItem[][] = [];
    let currentBatch: TranslationBatchItem[] = [];
    let currentTokens = 0;

    bucket.forEach((item) => {
      const nextTokens = currentTokens + item.estimatedTokens;
      if (
        currentBatch.length > 0 &&
        (nextTokens > bucketLimits.tokenLimit || currentBatch.length >= bucketLimits.itemLimit)
      ) {
        bucketBatches.push(currentBatch);
        currentBatch = [];
        currentTokens = 0;
      }

      currentBatch.push(item);
      currentTokens += item.estimatedTokens;
    });

    if (currentBatch.length > 0) {
      bucketBatches.push(currentBatch);
    }

    if (bucketLimits.minimumTokenFloor && bucketBatches.length >= 2) {
      const lastBatch = bucketBatches[bucketBatches.length - 1];
      const previousBatch = bucketBatches[bucketBatches.length - 2];
      const lastBatchTokens = lastBatch.reduce((sum, item) => sum + item.estimatedTokens, 0);
      const mergedCount = previousBatch.length + lastBatch.length;
      const mergedTokens =
        previousBatch.reduce((sum, item) => sum + item.estimatedTokens, 0) + lastBatchTokens;

      if (
        lastBatchTokens < bucketLimits.minimumTokenFloor &&
        mergedCount <= bucketLimits.itemLimit &&
        mergedTokens <= bucketLimits.tokenLimit
      ) {
        previousBatch.push(...lastBatch);
        bucketBatches.pop();
      }
    }

    batches.push(...bucketBatches);
  });

  return batches;
}

function toEstimateBatchShape(items: TranslationBatchItem[]): EstimateBatchShape {
  return {
    contentMode: items[0]?.contentMode ?? 'html',
    preparedChars: items.reduce((sum, item) => sum + item.preparedContent.length, 0),
    fragmentCount: items.length,
  };
}

function resolveBatchStrategy(
  items: TranslationBatchItem[],
  profile: 'immediate' | 'deferred',
  runtimeState?: TranslationRuntimeState,
  xmlLikeDocument = false,
): BatchStrategy {
  const concurrencyCap = runtimeState?.maxConcurrency ?? DEFAULT_RUNTIME_CONCURRENCY;
  const capConcurrency = (value: number): number =>
    Math.max(1, Math.min(value, concurrencyCap));

  if (items.length === 0) {
    return {
      tokenLimit:
        profile === 'immediate' ? IMMEDIATE_BATCH_TOKEN_LIMIT : DEFERRED_BATCH_TOKEN_LIMIT,
      itemLimit: profile === 'immediate' ? IMMEDIATE_BATCH_ITEM_LIMIT : DEFERRED_BATCH_ITEM_LIMIT,
      concurrency: 1,
      minimumTokenFloor: profile === 'deferred' ? 1200 : undefined,
    };
  }

  const totalEstimatedTokens = items.reduce((sum, item) => sum + item.estimatedTokens, 0);
  const averageEstimatedTokens = totalEstimatedTokens / items.length;
  const htmlHeavy =
    items.filter((item) => item.contentMode === 'html').length / items.length >= 0.5;
  const hasLargeItem = items.some(
    (item) =>
      item.rawEstimatedTokens >= UNSPLITTABLE_HTML_TOKEN_THRESHOLD ||
      item.preparedContent.length >=
        (item.contentMode === 'html'
          ? MAX_HTML_FRAGMENT_CHARS
          : MAX_PLACEHOLDER_RICH_TEXT_CHARS),
  );
  const textOnly = items.every((item) => item.contentMode === 'text');
  const contentMode = items[0]?.contentMode ?? 'html';
  const batchScale = runtimeState?.batchScale[contentMode] ?? 1;

  const scaled = (value: number): number => Math.max(1, Math.round(value * batchScale));

  if (profile === 'immediate') {
    if (textOnly && !hasLargeItem && averageEstimatedTokens <= 190) {
      return { tokenLimit: scaled(1150), itemLimit: 6, concurrency: 1 };
    }

    if (!hasLargeItem && !htmlHeavy && averageEstimatedTokens <= 240) {
      return { tokenLimit: scaled(1100), itemLimit: 5, concurrency: 1 };
    }

    return {
      tokenLimit: scaled(IMMEDIATE_BATCH_TOKEN_LIMIT),
      itemLimit: IMMEDIATE_BATCH_ITEM_LIMIT,
      concurrency: 1,
    };
  }

  if (xmlLikeDocument) {
    if (textOnly && !hasLargeItem && averageEstimatedTokens <= 180) {
      return {
        tokenLimit: scaled(7200),
        itemLimit: 38,
        concurrency: capConcurrency(5),
        minimumTokenFloor: 3200,
      };
    }

    if (!hasLargeItem && !htmlHeavy && averageEstimatedTokens <= 280) {
      return {
        tokenLimit: scaled(6400),
        itemLimit: 30,
        concurrency: capConcurrency(5),
        minimumTokenFloor: 3000,
      };
    }

    if (!hasLargeItem && averageEstimatedTokens <= 380) {
      return {
        tokenLimit: scaled(4400),
        itemLimit: 18,
        concurrency: capConcurrency(5),
        minimumTokenFloor: 2400,
      };
    }

    return {
      tokenLimit: scaled(3400),
      itemLimit: 14,
      concurrency: capConcurrency(5),
      minimumTokenFloor: 2000,
    };
  }

  if (textOnly && !hasLargeItem && averageEstimatedTokens <= 180) {
    return {
      tokenLimit: scaled(6200),
      itemLimit: 34,
      concurrency: capConcurrency(5),
      minimumTokenFloor: 2800,
    };
  }

  if (!hasLargeItem && !htmlHeavy && averageEstimatedTokens <= 260) {
    return {
      tokenLimit: scaled(5600),
      itemLimit: 28,
      concurrency: capConcurrency(5),
      minimumTokenFloor: 2600,
    };
  }

  if (!hasLargeItem && averageEstimatedTokens <= 340) {
    return {
      tokenLimit: scaled(3800),
      itemLimit: 16,
      concurrency: capConcurrency(5),
      minimumTokenFloor: 2200,
    };
  }

  return {
    tokenLimit: scaled(3000),
    itemLimit: 14,
    concurrency: capConcurrency(5),
    minimumTokenFloor: 1800,
  };
}

function getBatchBucketKey(item: TranslationBatchItem, xmlLikeDocument = false): string {
  if (item.contentMode === 'html') {
    if (item.hasMarkers) {
      return 'html:marked';
    }

    if (
      xmlLikeDocument &&
      (item.group.requestFragments.length >= 4 || item.group.estimatedTokens >= 350)
    ) {
      return 'html:plain:xml-heavy';
    }

    return 'html:plain';
  }

  if (
    xmlLikeDocument &&
    item.hasMarkers &&
    (item.group.requestFragments.length >= 2 || item.group.estimatedTokens >= 320)
  ) {
    return 'text:marked:xml-heavy';
  }

  return item.contentMode;
}

function resolveBucketBatchLimits(
  bucketKey: string,
  bucket: TranslationBatchItem[],
  defaults: BatchBucketLimits,
  overrides: {
    plainHtmlItemLimit?: number;
    plainHtmlMinimumTokenFloor?: number;
    plainHtmlAverageTokenThreshold?: number;
    xmlHeavyPlainHtmlItemLimit?: number;
    xmlHeavyPlainHtmlMinimumTokenFloor?: number;
    xmlMarkedTextItemLimit?: number;
    xmlMarkedTextMinimumTokenFloor?: number;
  } = {},
): BatchBucketLimits {
  if (bucket.length === 0) {
    return defaults;
  }

  const first = bucket[0];
  if (bucketKey === 'text:marked:xml-heavy') {
    if (!overrides.xmlMarkedTextItemLimit) {
      return defaults;
    }

    return {
      tokenLimit: defaults.tokenLimit,
      itemLimit: Math.min(defaults.itemLimit, overrides.xmlMarkedTextItemLimit),
      minimumTokenFloor:
        defaults.minimumTokenFloor === undefined
          ? undefined
          : Math.min(
              defaults.minimumTokenFloor,
              overrides.xmlMarkedTextMinimumTokenFloor ?? defaults.minimumTokenFloor,
            ),
    };
  }

  if (first.contentMode !== 'html') {
    return defaults;
  }

  const hasMarkers = bucket.some((item) => item.hasMarkers);
  if (hasMarkers) {
    return defaults;
  }

  if (bucketKey === 'html:plain:xml-heavy') {
    if (!overrides.xmlHeavyPlainHtmlItemLimit) {
      return defaults;
    }

    return {
      tokenLimit: defaults.tokenLimit,
      itemLimit: Math.min(defaults.itemLimit, overrides.xmlHeavyPlainHtmlItemLimit),
      minimumTokenFloor:
        defaults.minimumTokenFloor === undefined
          ? undefined
          : Math.min(
              defaults.minimumTokenFloor,
              overrides.xmlHeavyPlainHtmlMinimumTokenFloor ?? defaults.minimumTokenFloor,
            ),
    };
  }

  if (!overrides.plainHtmlItemLimit) {
    return defaults;
  }

  const averageEstimatedTokens =
    bucket.reduce((sum, item) => sum + item.estimatedTokens, 0) / bucket.length;
  if (
    overrides.plainHtmlAverageTokenThreshold !== undefined &&
    averageEstimatedTokens < overrides.plainHtmlAverageTokenThreshold
  ) {
    return defaults;
  }

  return {
    tokenLimit: defaults.tokenLimit,
    itemLimit: Math.min(defaults.itemLimit, overrides.plainHtmlItemLimit),
    minimumTokenFloor:
      defaults.minimumTokenFloor === undefined
        ? undefined
        : Math.min(
            defaults.minimumTokenFloor,
            overrides.plainHtmlMinimumTokenFloor ?? defaults.minimumTokenFloor,
          ),
  };
}

function isXmlLikeRuntimeDocument(documentRef: Document): boolean {
  const contentType = (documentRef.contentType || '').toLowerCase();
  return contentType.includes('xml') && contentType !== 'text/html';
}

function isRetryableTranslationError(error: unknown): boolean {
  return error instanceof Error && isRetryableRuntimeError(error.message);
}

function isTranslationCancelledError(error: unknown): boolean {
  return error instanceof TranslationCancelledError || isTranslationCancelledMessage(getErrorMessage(error, ''));
}

function isTranslationCancelledMessage(message: string | null | undefined): boolean {
  return (message ?? '').trim().toLowerCase().includes('cancelled');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function retryDelayWithJitter(attempt: number): number {
  const base = RETRY_BACKOFF_MS * Math.pow(2, attempt - 1);
  const jitter = base * 0.2 * (2 * Math.random() - 1);
  return Math.max(0, base + jitter);
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function logTranslationError(
  summary: string,
  error: unknown,
  context: Record<string, unknown>,
): void {
  const message = getErrorMessage(error, 'Translation failed.');
  logWithContext('error', `[AI Web Translator] ${summary}`, {
    ...context,
    technicalMessage: message,
    localizedMessage: localizeRuntimeError(message),
    error,
  });
}

function isIgnorableRuntimeMessageError(error: unknown): boolean {
  const message = getErrorMessage(error, '').toLowerCase();
  return (
    message.includes('receiving end does not exist') ||
    message.includes('could not establish connection') ||
    message.includes('extension context invalidated')
  );
}

function getGroupPreparedChars(group: TranslationGroup): number {
  return group.requestFragments.reduce(
    (sum, fragment) => sum + fragment.preparedContent.length,
    0,
  );
}

function resolveImmediateBatchContentMode(
  items: TranslationBatchItem[],
): TranslationContentMode | 'mixed' {
  const firstMode = items[0]?.contentMode;
  if (!firstMode) {
    return 'text';
  }

  return items.every((item) => item.contentMode === firstMode) ? firstMode : 'mixed';
}

function getGroupPromptTokens(
  group: TranslationGroup,
  calibration: EstimateCalibrationSnapshot,
): number {
  return estimatePromptTokensForBatch(
    {
      contentMode: group.contentMode,
      preparedChars: getGroupPreparedChars(group),
      fragmentCount: group.requestFragments.length,
    },
    calibration,
  );
}

function isSafeImmediateGroup(
  group: TranslationGroup,
  calibration: EstimateCalibrationSnapshot,
): boolean {
  const estimatedTokens = getGroupPromptTokens(group, calibration);
  if (estimatedTokens > IMMEDIATE_GROUP_HARD_TOKEN_CAP) {
    return false;
  }

  if (group.requestFragments.length > IMMEDIATE_GROUP_MAX_FRAGMENT_COUNT) {
    return false;
  }

  const hasOversizedFragment = group.requestFragments.some(
    (fragment) =>
      estimatePromptTokensForContent(
        fragment.requestContentMode,
        fragment.preparedContent.length,
        calibration,
      ) >
      IMMEDIATE_GROUP_HARD_TOKEN_CAP,
  );

  return !hasOversizedFragment;
}

function compareGroupsForScheduling(left: TranslationGroup, right: TranslationGroup): number {
  if (left.priorityScore !== right.priorityScore) {
    return right.priorityScore - left.priorityScore;
  }

  if (left.top !== right.top) {
    return left.top - right.top;
  }

  return left.groupKey.localeCompare(right.groupKey);
}

function compareGroupsForLazyExecution(left: TranslationGroup, right: TranslationGroup): number {
  const leftPriority = left.queueClass === 'lazy-visible' ? 1 : 0;
  const rightPriority = right.queueClass === 'lazy-visible' ? 1 : 0;
  if (leftPriority !== rightPriority) {
    return rightPriority - leftPriority;
  }

  if (left.top !== right.top) {
    return left.top - right.top;
  }

  return compareGroupsForScheduling(left, right);
}

function compareGroupsForImmediateScheduling(
  left: TranslationGroup,
  right: TranslationGroup,
  viewportHeight: number,
): number {
  const leftScore = resolveImmediateSchedulingScore(left, viewportHeight);
  const rightScore = resolveImmediateSchedulingScore(right, viewportHeight);
  if (leftScore !== rightScore) {
    return rightScore - leftScore;
  }

  return compareGroupsForScheduling(left, right);
}

function resolveImmediateSchedulingScore(
  group: TranslationGroup,
  viewportHeight: number,
): number {
  let score = group.priorityScore;
  const preparedChars = getGroupPreparedChars(group);
  const fragmentCount = group.requestFragments.length;
  if (group.contentMode === 'text') {
    score += 180;
  }
  if (group.top <= Math.max(220, viewportHeight * 0.4)) {
    score += 240;
  }
  if (group.records.some((record) => /^H[1-3]$/.test(record.element.tagName))) {
    score += 160;
  }
  if (group.sectionContext && group.records.some((record) => record.element.tagName === 'P')) {
    score += 90;
  }
  if (fragmentCount === 1) {
    score += 140;
  } else {
    score -= Math.min(240, (fragmentCount - 1) * 140);
  }
  if (preparedChars <= 260) {
    score += 110;
  } else if (preparedChars <= 420) {
    score += 45;
  } else if (preparedChars >= 720) {
    score -= 80;
  }
  return score;
}

function resolveBatchSectionContext(items: TranslationBatchItem[]): string | undefined {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const sectionContext = item.group.sectionContext.trim();
    if (!sectionContext) {
      return;
    }

    counts.set(sectionContext, (counts.get(sectionContext) ?? 0) + 1);
  });

  return Array.from(counts.entries()).sort((left, right) => right[1] - left[1])[0]?.[0];
}

function buildGlossaryHints(
  runtimeState: TranslationRuntimeState,
  items: TranslationBatchItem[],
): Array<{ source: string; target: string }> | undefined {
  if (runtimeState.glossary.size === 0 || !items.every((item) => item.contentMode === 'text')) {
    return undefined;
  }

  const currentSources = new Set(
    items
      .map((item) => item.group.records[0]?.originalText ?? '')
      .filter((value) => value.length > 0),
  );
  const hints = Array.from(runtimeState.glossary.entries())
    .filter(([source]) => !currentSources.has(source))
    .slice(0, MAX_GLOSSARY_HINTS)
    .map(([source, target]) => ({ source, target }));

  return hints.length > 0 ? hints : undefined;
}

function isGlossaryCandidateGroup(group: TranslationGroup): boolean {
  const source = group.records[0]?.originalText ?? '';
  const wordCount = source.split(/\s+/u).filter(Boolean).length;
  return (
    group.contentMode === 'text' &&
    group.requestFragments.length === 1 &&
    source.length >= 3 &&
    source.length <= 80 &&
    wordCount <= 8
  );
}

function joinTranslatedGroupOutput(group: TranslationGroup, translatedFragments: string[]): string {
  return translatedFragments.join(group.joiner);
}

function getGroupOriginalContent(group: TranslationGroup): string {
  const firstRecord = group.records[0];
  if (!firstRecord) {
    return '';
  }

  return firstRecord.contentMode === 'text'
    ? firstRecord.originalText
    : firstRecord.originalHtml;
}

function tightenProtectedMarkerSpacing(content: string, targetLanguage: string): string {
  if (!/^(ja|zh|ko)\b/i.test(targetLanguage)) {
    return content;
  }

  // Remove spaces around markers for CJK, but preserve a space between
  // a particle (を、は、が、に etc.) and a marker when the marker is followed
  // by another particle (の、に、で etc.). Without this, "V を [[x1]] の表現"
  // becomes "Vを[[x1]]の表現" → "Vをの表現" after marker restoration.
  let result = content
    .replace(/\s*(\[\[(?:\/?t\d+|x\d+)\]\])\s*/gi, '$1')
    .replace(/\s+([。、！？])/g, '$1');
  // Re-insert space: particle + marker + particle → particle + space + marker
  result = result.replace(
    /([はがをにもへや])(\[\[(?:x\d+)\]\])([のにでがをはもへ])/gi,
    '$1 $2$3',
  );
  return result;
}


function pickProtectedHtmlMarkersForContent(
  content: string,
  htmlMap?: Record<string, string>,
): Record<string, string> | undefined {
  if (!htmlMap) {
    return undefined;
  }

  const matchedEntries = Object.entries(htmlMap).filter(([marker]) => content.includes(marker));
  if (matchedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(matchedEntries);
}

function isPlaceholderPathWorthUsing(options: {
  protectedHtml: { content: string; htmlMap: Record<string, string> } | null;
  protectedMarkerCount: number;
  placeholderTagPairCount: number;
  placeholderContentLength: number;
  preparedHtmlLength: number;
  skipWrapperRestore: boolean;
  xmlLikeDocument: boolean;
}): boolean {
  if (
    options.protectedMarkerCount >= 8 ||
    (options.protectedMarkerCount >= 6 && options.placeholderTagPairCount >= 4)
  ) {
    return false;
  }

  if (options.protectedHtml) {
    return true;
  }

  if (options.placeholderContentLength + 12 < options.preparedHtmlLength) {
    return true;
  }

  if (
    options.xmlLikeDocument &&
    options.skipWrapperRestore &&
    options.placeholderContentLength <= options.preparedHtmlLength + 24
  ) {
    return true;
  }

  return false;
}

function shouldPreferHtmlLaneForDenseProtectedPlaceholder(options: {
  protectedMarkerCount: number;
  placeholderTagPairCount: number;
  placeholderSegments: string[];
}): boolean {
  if (
    options.protectedMarkerCount < 2 ||
    options.placeholderSegments.length <= 1 ||
    options.placeholderTagPairCount > 2
  ) {
    return false;
  }

  const markerCounts = options.placeholderSegments.map((segment) =>
    countProtectedMarkersInPlaceholderSegment(segment),
  );
  const maxMarkersInSegment = Math.max(0, ...markerCounts);

  return maxMarkersInSegment >= 2;
}

function countProtectedMarkersInPlaceholderSegment(content: string): number {
  return content.match(/\[\[\s*x\d+\s*\]\]/gi)?.length ?? 0;
}

function shouldUseConservativeProtectedPlaceholderSplitting(options: {
  protectedMarkerCount: number;
  placeholderTagPairCount: number;
}): boolean {
  return options.protectedMarkerCount >= 2 && options.placeholderTagPairCount <= 2;
}

function splitTextIntoSegments(text: string, maxChars = MAX_TEXT_FRAGMENT_CHARS): string[] {
  if (text.length <= maxChars) {
    return [text];
  }

  const segments: string[] = [];
  const sentences =
    text.match(/[^.!?。！？]+(?:[.!?。！？]+|$)/g)?.map((sentence) => sentence.trim()) ?? [text];

  let current = '';
  sentences.forEach((sentence) => {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) {
      segments.push(current);
    }

    if (sentence.length <= MAX_TEXT_FRAGMENT_CHARS) {
      current = sentence;
      return;
    }

    const chunks = chunkLongText(sentence, MAX_TEXT_FRAGMENT_CHARS);
    segments.push(...chunks.slice(0, -1));
    current = chunks[chunks.length - 1] ?? '';
  });

  if (current) {
    segments.push(current);
  }

  return segments;
}

function splitSingleItemForRetry(item: TranslationBatchItem | undefined): TranslationBatchItem[] | null {
  if (!item) {
    return null;
  }

  const segments =
    item.contentMode === 'text'
      ? splitTextIntoSegments(
          item.preparedContent,
          Math.max(160, Math.floor(item.preparedContent.length / 2)),
        )
      : splitHtmlIntoSafeSegments(
          item.preparedContent,
          Math.max(120, Math.floor(item.preparedContent.length / 2)),
        );

  if (segments.length < 2) {
    return null;
  }

  const descriptors = buildFragmentDescriptorsForSourceText(
    item.sourceHintText,
    segments,
    item.contentMode,
    item.fragmentRole,
  );

  return descriptors.map((descriptor) => ({
    ...item,
    preparedContent: descriptor.segment,
    sourceHintText: descriptor.sourceHintText,
    fragmentRole: descriptor.fragmentRole,
    precedingContext: descriptor.precedingContext,
    estimatedTokens: estimateTokensFromChars(descriptor.segment.length),
    rawEstimatedTokens: estimateTokensFromChars(descriptor.segment.length),
  }));
}

function joinTranslatedFragments(joiner: string, translatedFragments: string[]): string {
  return translatedFragments.join(joiner);
}

function optionsToJoiner(items: TranslationBatchItem[]): string {
  return items[0]?.group.joiner ?? '';
}

function chunkLongText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    const chunks: string[] = [];
    for (let start = 0; start < text.length; start += maxChars) {
      chunks.push(text.slice(start, start + maxChars).trim());
    }
    return chunks.filter(Boolean);
  }

  const chunks: string[] = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) {
      chunks.push(current);
    }
    current = word;
  });

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function preferredTextJoiner(targetLanguage: string): string {
  const normalized = targetLanguage.toLowerCase();
  if (normalized.startsWith('ja') || normalized.startsWith('zh') || normalized.startsWith('th')) {
    return '';
  }

  return ' ';
}

function resolvePlaceholderRequestSegments(
  content: string,
  wrapperPrefix?: string,
): string[] {
  if (!wrapperPrefix) {
    return [content];
  }

  const wrapperTag = wrapperPrefix.match(/^<([a-z0-9-]+)/i)?.[1]?.toLowerCase() ?? '';
  if (!['div', 'section', 'article', 'blockquote', 'figcaption', 'p', 'li', 'dd', 'dt'].includes(wrapperTag)) {
    return [content];
  }

  return splitPlaceholderRichTextIntoSafeSegments(content, MAX_PLACEHOLDER_RICH_TEXT_CHARS);
}

function splitBatchItemsForRetry(
  items: TranslationBatchItem[],
): [TranslationBatchItem[], TranslationBatchItem[]] | null {
  if (items.length < 2) {
    return null;
  }

  const totalEstimatedTokens = items.reduce((sum, item) => sum + item.estimatedTokens, 0);
  let splitIndex = 0;
  let consumedTokens = 0;

  while (splitIndex < items.length - 1 && consumedTokens < totalEstimatedTokens / 2) {
    consumedTokens += items[splitIndex].estimatedTokens;
    splitIndex += 1;
  }

  if (splitIndex <= 0 || splitIndex >= items.length) {
    splitIndex = Math.ceil(items.length / 2);
  }

  return [items.slice(0, splitIndex), items.slice(splitIndex)];
}

function shouldSplitBatchAfterFailure(error: unknown): boolean {
  if (
    error instanceof OutputLimitTranslationError ||
    error instanceof FragmentCountMismatchTranslationError
  ) {
    return true;
  }

  const lowerMessage = getErrorMessage(error, '').trim().toLowerCase();
  return lowerMessage.includes('invalid translations payload') ||
    lowerMessage.includes('output limit');
}

function shouldFallbackToOriginalBatch(
  _batch: TranslationBatchItem[],
  error: unknown,
): boolean {
  // Allow fallback for any batch size to prevent session crashes.
  // For multi-item batches this is a last resort after splitting failed.
  // Single-item unsplittable fragments get a 16000-token retry first
  // (inside requestTranslationsWithRetry) before reaching this path.
  return (
    error instanceof OutputLimitTranslationError ||
    getErrorMessage(error, '').trim().toLowerCase().includes('output limit')
  );
}

function mergeTranslationUsage(
  left: TranslationRequestResult['usage'],
  right: TranslationRequestResult['usage'],
): TranslationRequestResult['usage'] {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return {
    promptTokens: left.promptTokens + right.promptTokens,
    completionTokens: left.completionTokens + right.completionTokens,
    totalTokens: left.totalTokens + right.totalTokens,
  };
}

function collectBatchRecords(items: TranslationBatchItem[]): BlockRecord[] {
  const records = new Map<string, BlockRecord>();
  items.forEach((item) => {
    item.group.records.forEach((record) => {
      records.set(record.blockId, record);
    });
  });
  return [...records.values()];
}

function compareWarningRecords(left: BlockRecord, right: BlockRecord): number {
  if (left.element === right.element) {
    return 0;
  }

  const relation = left.element.compareDocumentPosition(right.element);
  if (relation & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  }
  if (relation & Node.DOCUMENT_POSITION_PRECEDING) {
    return 1;
  }

  return left.top - right.top;
}

function areWarningSummariesEqual(
  left: SessionWarningSummary | null,
  right: SessionWarningSummary | null,
): boolean {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.totalBlocks === right.totalBlocks &&
    left.retryingBlocks === right.retryingBlocks &&
    left.fallbackSourceBlocks === right.fallbackSourceBlocks &&
    left.errorBlocks === right.errorBlocks
  );
}

function buildWarningSummaryMessage(summary: SessionWarningSummary | null): string {
  const count = summary?.totalBlocks ?? 0;
  if (count <= 0) {
    return '一部そのまま残っています。';
  }

  return `${count}箇所はそのまま残っています。`;
}

function resolvePageRegister(style: TranslationStyle): TranslationRegister {
  return style === 'readable' ? 'desumasu' : 'dearu';
}

function buildFragmentDescriptors(
  record: BlockRecord,
  segments: string[],
  sourceMode: TranslationContentMode,
): Array<{
  segment: string;
  sourceHintText: string;
  fragmentRole: TranslationFragmentRole;
  precedingContext?: string;
}> {
  const sourceContent = sourceMode === 'html' ? record.originalHtml : record.originalText;
  const preferredRole = resolveRecordFragmentRole(record);
  return buildFragmentDescriptorsForSourceText(sourceContent, segments, sourceMode, preferredRole);
}

function buildFragmentDescriptorsForSourceText(
  sourceContent: string,
  segments: string[],
  sourceMode: TranslationContentMode,
  preferredRole?: TranslationFragmentRole,
): Array<{
  segment: string;
  sourceHintText: string;
  fragmentRole: TranslationFragmentRole;
  precedingContext?: string;
}> {
  const normalizedSource = extractRoleSourceText(sourceContent, sourceMode);
  const baseRole = preferredRole ?? resolveFragmentRoleFromSourceText(normalizedSource);
  let previousHintText = '';

  return segments.map((segment, index) => {
    const sourceHintText = extractRoleSourceText(segment, sourceMode);
    const fragmentRole = resolveFragmentRoleForSegment(sourceHintText, baseRole);
    const precedingContext =
      index > 0 && fragmentRole !== 'label' && fragmentRole !== 'heading'
        ? buildPrecedingContext(previousHintText)
        : undefined;
    previousHintText = sourceHintText;
    return {
      segment,
      sourceHintText,
      fragmentRole,
      precedingContext,
    };
  });
}

function resolveRecordFragmentRole(record: BlockRecord): TranslationFragmentRole {
  const tagName = record.element.tagName.toUpperCase();
  if (/^H[1-6]$/.test(tagName)) {
    return 'heading';
  }
  if (tagName === 'LI' || tagName === 'DT' || tagName === 'DD') {
    return 'list-item';
  }
  if (tagName === 'FIGCAPTION' || tagName === 'CAPTION') {
    return 'caption';
  }

  const sourceText = extractRoleSourceText(
    record.contentMode === 'html' ? record.originalHtml : record.originalText,
    record.contentMode,
  );
  return resolveFragmentRoleFromSourceText(sourceText);
}

function resolveFragmentRoleForSegment(
  sourceHintText: string,
  baseRole: TranslationFragmentRole,
): TranslationFragmentRole {
  if (baseRole === 'heading' || baseRole === 'list-item' || baseRole === 'caption') {
    return baseRole;
  }
  if (looksLikeStructuralLabel(sourceHintText)) {
    return 'label';
  }
  return baseRole;
}

function resolveFragmentRoleFromSourceText(sourceText: string): TranslationFragmentRole {
  return looksLikeStructuralLabel(sourceText) ? 'label' : 'prose';
}

function extractRoleSourceText(
  content: string,
  contentMode: TranslationContentMode,
): string {
  if (contentMode === 'html') {
    return extractTextFromProtectedHtml(content);
  }

  const withoutMarkers = content
    .replace(/\[\[\s*\/?\s*t\d+\s*\]\]/gi, ' ')
    .replace(/\[\[\s*x\d+\s*\]\]/gi, ' ');
  return normalizeText(withoutMarkers);
}

function buildPrecedingContext(previousHintText: string): string | undefined {
  const normalized = normalizeText(previousHintText);
  if (!normalized) {
    return undefined;
  }

  return normalized.slice(-CONTINUATION_CONTEXT_CHARS);
}

function looksLikeStructuralLabel(sourceText: string): boolean {
  const normalized = normalizeStructuralLabelKey(sourceText);
  return Boolean(normalized && STRUCTURAL_LABEL_TRANSLATIONS[normalized]);
}

function normalizeStructuralLabelKey(sourceText: string): string {
  return normalizeText(sourceText)
    .replace(/^[\[(【「『]+|[\])】」』]+$/g, '')
    .replace(/[.。:：]+$/g, '')
    .trim()
    .toLowerCase();
}

function normalizeTranslatedFragmentForQuality(
  translatedContent: string,
  item: TranslationBatchItem,
  runtimeState: TranslationRuntimeState,
  recordQualitySignal: (
    signal: keyof SessionRuntimeMetrics['qualitySignals'],
    count?: number,
  ) => void,
): string {
  let normalized = translatedContent;

  if (item.fragmentRole === 'label') {
    const structuralLabel = STRUCTURAL_LABEL_TRANSLATIONS[
      normalizeStructuralLabelKey(item.sourceHintText)
    ];
    if (structuralLabel) {
      if (normalizeText(normalized) !== structuralLabel) {
        recordQualitySignal('labelPunctuationCorrections');
      }
      return structuralLabel;
    }

    const stripped = normalized.replace(/[。．]+\s*$/u, '');
    if (stripped !== normalized) {
      recordQualitySignal('labelPunctuationCorrections');
      normalized = stripped;
    }
    return normalized;
  }

  const registerNormalized = normalizeRegisterForPage(normalized, runtimeState.pageRegister);
  if (registerNormalized !== normalized) {
    recordQualitySignal('mixedRegisterSignals');
    normalized = registerNormalized;
  }

  return normalized;
}

function normalizeRegisterForPage(
  content: string,
  pageRegister: TranslationRegister,
): string {
  if (pageRegister === 'desumasu') {
    return content
      .replace(/である(?=[。．]|$)/gu, 'です')
      .replace(/であった(?=[。．]|$)/gu, 'でした');
  }

  return content
    .replace(/でした(?=[。．]|$)/gu, 'であった')
    .replace(/です(?=[。．]|$)/gu, 'である');
}
