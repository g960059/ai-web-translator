import {
  buildTranslationContext,
  collectSelectionBlocks,
  collectTranslatableBlocks,
  debugCollectRecoveryProbe,
  isLikelyAlreadyTargetLanguage,
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
  restoreProtectedHtml,
  restorePlaceholderRichText,
  setElementHtmlContent,
  splitHtmlIntoSafeSegments,
} from '../core/html';
import {
  getCachedTranslations,
  removeCachedTranslations,
  serializeTranslationCacheLookup,
  setCachedTranslations,
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
} from '../shared/messages';
import {
  getEstimateCalibrationSnapshot,
  recordTranslationUsageSamples,
  type EstimateCalibrationSnapshot,
} from '../shared/estimate-calibration';
import { logWithContext } from '../shared/debug-log';
import { isRetryableRuntimeError, localizeRuntimeError } from '../shared/error-messages';
import { loadSettings } from '../shared/settings';
import type {
  BlockDisplayState,
  DefaultTranslationScope,
  ExtensionSettings,
  PageAnalysis,
  SessionRuntimeMetrics,
  SessionSnapshot,
  TranslationBatchRequest,
  TranslationContentMode,
  TranslationContext,
} from '../shared/types';
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
}

interface TranslationGroup {
  groupKey: string;
  contentMode: TranslationContentMode;
    requestFragments: Array<{
      preparedContent: string;
      requestContentMode: TranslationContentMode;
      restoreContentMode: TranslationContentMode;
      restoreMap: Record<string, string>;
      placeholderTagMap?: Record<string, string>;
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
  restoreMap: Record<string, string>;
  placeholderTagMap?: Record<string, string>;
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
const MAX_BATCH_RETRIES = 1;
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
    this.overlay.onRetry = () => {
      void this.translatePage();
    };
    this.overlay.onCancel = () => {
      void this.cancelTranslation();
    };
    this.overlay.attachSelectionListener();
  }

  detectAndShowPrompt(): void {
    void loadSettings()
      .then((settings) => {
        this.overlay.setTargetLanguage(settings.targetLanguage);
        this.overlay.detectAndPrompt(settings.targetLanguage);
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
      metrics: null,
    };
    this.emitSnapshot();
  }

  private async cancelTranslation(): Promise<ActionResponse> {
    const sessionId = this.sessionSnapshot.activeSessionId ?? this.lazyPageSession?.sessionId;
    if (!sessionId) {
      return { ok: true, message: 'Cancelled. Start a new run when ready.' };
    }

    this.cancelledSessionIds.add(sessionId);
    this.cancelLazyPageSession(false);
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

  private async translatePage(
    providedSettings?: ExtensionSettings,
    providedScope?: DefaultTranslationScope,
  ): Promise<ActionResponse> {
    this.cancelLazyPageSession();
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

  private async clearPageCache(providedSettings?: ExtensionSettings): Promise<ActionResponse> {
    this.cancelLazyPageSession();
    const settings = await this.resolveSettings(providedSettings);
    const records = this.collectPageScan(settings.resolvedScope).records;
    await this.clearCacheForRecords(records, settings);
    this.restoreRecords(records);
    records.forEach((record) => {
      record.translatedContent = null;
    });
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
      this.overlay.complete(statusLabel);
      this.finishSession(sessionId);
      return { ok: true, message: statusLabel };
    }

    const calibration = await getEstimateCalibrationSnapshot(settings.provider, settings.model);
    const runtimeState = this.createRuntimeState(pendingGroups, calibration);

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
        this.overlay.setResting('続きを読み進めると、自動で訳していきます。', 1800);
      }
      return {
        ok: true,
        message: lazyMessage,
      };
    }

    this.throwIfSessionCancelled(sessionId);
    this.overlay.complete(statusLabel);
    this.finishSession(sessionId);
    return { ok: true, message: statusLabel };
  }

  private collectPageScan(scope: DefaultTranslationScope): PageScanSnapshot {
    const cached = this.pageScans.get(scope);
    if (cached && cached.pageSignature === this.pageSignature) {
      this.refreshDerivedSnapshotVisibility(cached);
      return cached;
    }

    const root = resolveScopeRoot(this.documentRef, scope);
    const records = this.registerBlocks(collectTranslatableBlocks(root));
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
  }

  private buildDerivedGroups(
    records: BlockRecord[],
    settings: ExtensionSettings,
    context: TranslationContext,
  ): TranslationGroup[] {
    const groups = new Map<string, TranslationGroup>();
    const textJoiner = preferredTextJoiner(settings.targetLanguage);

    records.forEach((record) => {
      if (isLikelyAlreadyTargetLanguage(record.originalText, settings.targetLanguage)) {
        return;
      }

      const requestFragments = this.buildRequestFragments(record, settings);
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
                logWithContext('warn', '[AI Web Translator] Falling back to source fragment after output-limit failure.', {
                  pageKey: this.pageKey,
                  sessionId: options.sessionId,
                  contentMode: batch[0]?.contentMode ?? 'unknown',
                  fragmentLength: batch[0]?.preparedContent.length ?? 0,
                });
                result = {
                  translations: batch.map((item) => item.preparedContent),
                };
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
              const preparedFragment = restorePreparedContent(
                result.translations[index],
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
              const protectedSafeFragment =
                item.protectedHtmlMap &&
                !hasAllProtectedMarkers(
                  normalizedProtectedFragment,
                  item.protectedHtmlMap,
                )
                  ? item.preparedContent
                  : normalizedProtectedFragment;
              const placeholderRestoredFragment = item.placeholderTagMap
                ? restorePlaceholderRichText(
                    protectedSafeFragment,
                    item.placeholderTagMap,
                  )
                : protectedSafeFragment;
              const restoredFragment = item.protectedHtmlMap
                ? restoreProtectedHtml(
                    placeholderRestoredFragment,
                    item.protectedHtmlMap,
                  )
                : placeholderRestoredFragment;
              const bucket =
                completedFragments.get(item.group.groupKey) ??
                new Array(item.group.requestFragments.length).fill('');
              bucket[item.fragmentIndex] = restoredFragment;
              completedFragments.set(item.group.groupKey, bucket);

              if (!bucket.every((fragment) => fragment.length > 0)) {
                return;
              }

              const restored = joinTranslatedGroupOutput(item.group, bucket);
              this.applyGroupTranslation(item.group, restored, false);
              this.captureGlossaryTranslation(item.group, restored, options.runtimeState);
              processedJobs += 1;
              if (options.settings.cacheEnabled) {
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

  private async requestTranslations(
    items: TranslationBatchItem[],
    settings: ResolvedSettings,
    context: TranslationContext,
    runtimeState: TranslationRuntimeState,
    sessionId: string,
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
    const batchEstimate = toEstimateBatchShape(items);
    const request: TranslationBatchRequest = {
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      sourceLanguage: context.sourceLanguage,
      targetLanguage: settings.targetLanguage,
      style: settings.style,
      contentMode,
      context,
      fragments: requestFragments,
      fragmentIds,
      sectionContext: resolveBatchSectionContext(items),
      glossary: buildGlossaryHints(runtimeState, items),
      hasProtectedMarkers,
      maxOutputTokens: estimateCompletionTokensForBatch(
        batchEstimate,
        runtimeState.calibration,
      ),
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
          await delay(RETRY_BACKOFF_MS * attempt);
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
              throw error;
            }

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
    const stored = providedSettings ?? (await loadSettings());
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
  ): Array<{
    preparedContent: string;
    requestContentMode: TranslationContentMode;
    restoreContentMode: TranslationContentMode;
    restoreMap: Record<string, string>;
    placeholderTagMap?: Record<string, string>;
    protectedHtmlMap?: Record<string, string>;
  }> {
    const sourceContent =
      record.contentMode === 'text' ? record.originalText : record.originalHtml;
    const protectedHtml =
      record.contentMode === 'html' ? protectAtomicHtmlForTranslation(sourceContent) : null;
    const translatableSourceContent = protectedHtml?.content ?? sourceContent;

    if (record.contentMode === 'html') {
      const placeholder = preparePlaceholderRichTextForTranslation(translatableSourceContent);
      const preparedHtml = prepareContentForTranslation(
        translatableSourceContent,
        'html',
        settings.style,
      );
      if (
        placeholder &&
        placeholder.content.length <= MAX_PLACEHOLDER_RICH_TEXT_CHARS &&
        placeholder.content.length + 12 < preparedHtml.content.length
      ) {
        return [
          {
            preparedContent: placeholder.content,
            requestContentMode: 'text',
            restoreContentMode: 'text',
            restoreMap: {},
            placeholderTagMap: placeholder.tagMap,
            protectedHtmlMap: protectedHtml?.htmlMap,
          },
        ];
      }
    }

    const segments =
      record.contentMode === 'text'
        ? splitTextIntoSegments(sourceContent)
        : splitHtmlIntoSafeSegments(translatableSourceContent, MAX_HTML_FRAGMENT_CHARS);

    return segments.map((segment) => {
      const prepared = prepareContentForTranslation(segment, record.contentMode, settings.style);
      return {
        preparedContent: prepared.content,
        requestContentMode: record.contentMode,
        restoreContentMode: record.contentMode,
        restoreMap: prepared.restoreMap,
        protectedHtmlMap: protectedHtml?.htmlMap,
      };
    });
  }

  private findMemoryTranslation(group: TranslationGroup): string | null {
    return group.records.find((record) => record.translatedContent)?.translatedContent ?? null;
  }

  private applyGroupTranslation(
    group: TranslationGroup,
    translatedContent: string,
    refreshDisplayState = true,
  ): void {
    group.records.forEach((record) => {
      if (record.contentMode === 'text') {
        record.element.textContent = translatedContent;
      } else {
        setElementHtmlContent(record.element, translatedContent, { sanitize: true });
      }

      record.translatedContent = translatedContent;
      record.displayState = 'translated';
      record.element.style.outline = 'none';
    });

    if (refreshDisplayState) {
      this.refreshDisplayState();
    }
  }

  private restoreRecords(records: BlockRecord[]): void {
    records.forEach((record) => {
      setElementHtmlContent(record.element, record.originalHtml);
      record.displayState = 'original';
      record.element.style.outline = 'none';
    });
    this.refreshDisplayState();
  }

  private refreshDisplayState(): void {
    const records = Array.from(this.blocksByElement.values());
    const translatedRecords = records.filter((record) => record.translatedContent);
    const displayedTranslations = translatedRecords.filter(
      (record) => record.displayState === 'translated',
    );

    let displayState: SessionSnapshot['displayState'] = 'original';
    if (translatedRecords.length > 0 && displayedTranslations.length === translatedRecords.length) {
      displayState = 'translated';
    } else if (displayedTranslations.length > 0) {
      displayState = 'mixed';
    }

    const hasTranslations = translatedRecords.length > 0;
    if (
      this.sessionSnapshot.displayState === displayState &&
      this.sessionSnapshot.hasTranslations === hasTranslations
    ) {
      return;
    }

    this.sessionSnapshot.displayState = displayState;
    this.sessionSnapshot.hasTranslations = hasTranslations;
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
    this.overlay.setWorking();
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
      this.finishSession(session.sessionId);
      this.cleanupLazyPageSessionResources(session);
      this.overlay.complete('ページ全体を訳し終えました。');
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
      immediateBatch: null,
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
    this.sessionSnapshot = {
      ...this.sessionSnapshot,
      ...partial,
      pageKey: this.pageKey,
      metrics:
        partial.metrics === undefined
          ? this.cloneSessionMetrics()
          : partial.metrics,
    };

    if (options.immediate ?? true) {
      this.emitSnapshot();
    }
  }

  private finishSession(sessionId: string): void {
    if (this.sessionSnapshot.activeSessionId !== sessionId && this.lazyPageSession?.sessionId !== sessionId) {
      return;
    }

    this.cancelledSessionIds.delete(sessionId);
    this.recordPhaseTiming('immediateCompletedMs');
    this.recordPhaseTiming('lazyVisibleCompletedMs');
    this.recordPhaseTiming('completedMs');
    this.setSnapshot(
      {
        status: 'completed',
        progressPercent: 100,
        activeSessionId: null,
        lastError: null,
      },
      { immediate: true },
    );
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
      this.overlay.setWorking();
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

    if (this.sessionSnapshot.hasTranslations) {
      this.overlay.setResting();
      return;
    }

    this.overlay.showIdleIcon();
  }

  private createRuntimeState(
    groups: TranslationGroup[],
    calibration: EstimateCalibrationSnapshot,
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
  } {
    if (isXmlLikeRuntimeDocument(this.documentRef)) {
      return {
        xmlHeavyPlainHtmlItemLimit: 5,
        xmlHeavyPlainHtmlMinimumTokenFloor: 1800,
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
      restoreMap: fragment.restoreMap,
      placeholderTagMap: fragment.placeholderTagMap,
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
  } = {},
): BatchBucketLimits {
  if (bucket.length === 0) {
    return defaults;
  }

  const first = bucket[0];
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

function tightenProtectedMarkerSpacing(content: string, targetLanguage: string): string {
  if (!/^(ja|zh|ko)\b/i.test(targetLanguage)) {
    return content;
  }

  return content
    .replace(/\s*(\[\[(?:\/?t\d+|x\d+)\]\])\s*/gi, '$1')
    .replace(/\s+([。、！？])/g, '$1');
}

function hasAllProtectedMarkers(
  content: string,
  htmlMap: Record<string, string>,
): boolean {
  return Object.keys(htmlMap).every((marker) => content.includes(marker));
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
          Math.max(240, Math.floor(item.preparedContent.length / 2)),
        );

  if (segments.length < 2) {
    return null;
  }

  return segments.map((segment) => ({
    ...item,
    preparedContent: segment,
    estimatedTokens: estimateTokensFromChars(segment.length),
    rawEstimatedTokens: estimateTokensFromChars(segment.length),
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
  return lowerMessage.includes('invalid translations payload');
}

function shouldFallbackToOriginalBatch(
  batch: TranslationBatchItem[],
  error: unknown,
): boolean {
  if (batch.length !== 1) {
    return false;
  }

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
