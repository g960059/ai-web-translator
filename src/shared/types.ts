export type ProviderId = 'openrouter';

export type TranslationScope = 'page' | 'main' | 'selection';

export type DefaultTranslationScope = Exclude<TranslationScope, 'selection'>;

export type TranslationStyle = 'auto' | 'readable' | 'precise' | 'source-like';
export type ModelPreset = 'accurate' | 'balanced' | 'fast' | 'custom';
export type TranslationContentMode = 'html' | 'text';
export type TranslationRegister = 'dearu' | 'desumasu';
export type TranslationFragmentRole = 'prose' | 'heading' | 'label' | 'list-item' | 'caption';

export type TranslationStatus =
  | 'idle'
  | 'scanning'
  | 'queued'
  | 'translating'
  | 'retrying'
  | 'lazy'
  | 'completed'
  | 'completed_with_warnings'
  | 'failed'
  | 'cancelled';

export type WidgetState = 'off' | 'working' | 'resting' | 'retrying' | 'error' | 'done';

export type BlockDisplayState = 'original' | 'translated';
export type BlockWarningState = 'none' | 'retrying' | 'fallback-source' | 'error-final';

export type PageDisplayState = 'original' | 'translated' | 'bilingual' | 'mixed';

export interface ExtensionSettings {
  provider: ProviderId;
  apiKey: string;
  model: string;
  modelPreset: ModelPreset;
  targetLanguage: string;
  style: TranslationStyle;
  translateFullPage: boolean;
  cacheEnabled: boolean;
}

export interface ProviderModelInfo {
  id: string;
  name: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export interface TranslationContext {
  pageTitle: string;
  pageDescription: string;
  pageUrl: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface PageAnalysis {
  blockCount: number;
  uniqueBlockCount: number;
  visibleBlockCount: number;
  sourceChars: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCacheHitRatio: number;
}

export interface SessionPhaseTimings {
  immediateCompletedMs: number | null;
  lazyVisibleCompletedMs: number | null;
  completedMs: number | null;
}

export interface SessionRetryCounts {
  total: number;
  transient: number;
  outputLimit: number;
  fragmentCountMismatch: number;
  invalidPayload: number;
  batchSplits: number;
  fragmentSplits: number;
}

export interface SessionCacheStats {
  memoryHits: number;
  persistentHits: number;
  misses: number;
}

export interface SessionRequestCountsByPhase {
  immediate: number;
  lazyVisible: number;
  deferred: number;
}

export interface SessionSplitStats {
  batchByContentMode: {
    text: number;
    html: number;
  };
  batchByMarkerPresence: {
    marked: number;
    plain: number;
  };
  batchBySize: {
    one: number;
    two: number;
    threeOrFour: number;
    fiveOrMore: number;
  };
  fragmentByContentMode: {
    text: number;
    html: number;
  };
}

export interface SessionSplitEvent {
  phase: keyof SessionRequestCountsByPhase;
  bucketKey: string;
  contentMode: TranslationContentMode;
  hasMarkers: boolean;
  itemCount: number;
  flattenedFragmentCount: number;
  averageEstimatedTokens: number;
  maxGroupEstimatedTokens: number;
  maxGroupFragmentCount: number;
  reason: string;
}

export interface SessionImmediateBatchMetrics {
  groupCount: number;
  fragmentCount: number;
  contentMode: TranslationContentMode | 'mixed';
  preparedChars: number;
  estimatedPromptTokens: number;
  hasMarkers: boolean;
  providerLatencyMs: number | null;
  backgroundProviderLatencyMs: number | null;
  bridgeLatencyMs: number | null;
}

export interface SessionQualitySignals {
  sourceFallbackFragments: number;
  protectedMarkerFallbackFragments: number;
  mixedRegisterSignals: number;
  labelPunctuationCorrections: number;
  continuationContextFragments: number;
}

export interface SessionWarningSummary {
  totalBlocks: number;
  retryingBlocks: number;
  fallbackSourceBlocks: number;
  errorBlocks: number;
}

export interface SessionRuntimeMetrics {
  phaseTimings: SessionPhaseTimings;
  retryCounts: SessionRetryCounts;
  cacheStats: SessionCacheStats;
  requestCountsByPhase: SessionRequestCountsByPhase;
  splitStats: SessionSplitStats;
  splitEventSamples: SessionSplitEvent[];
  immediateBatch: SessionImmediateBatchMetrics | null;
  qualitySignals: SessionQualitySignals;
  warningStats: SessionWarningSummary | null;
}

export interface SessionSnapshot {
  pageKey: string;
  status: TranslationStatus;
  displayState: PageDisplayState;
  hasTranslations: boolean;
  progressPercent: number;
  targetLanguage: string;
  scope: DefaultTranslationScope | null;
  activeSessionId: string | null;
  lastError: string | null;
  warnings?: SessionWarningSummary | null;
  metrics?: SessionRuntimeMetrics | null;
}

export interface TabSessionState extends SessionSnapshot {
  tabId: number;
}

export interface TranslationBatchRequest {
  provider: ProviderId;
  apiKey: string;
  model: string;
  sourceLanguage: string;
  targetLanguage: string;
  style: TranslationStyle;
  pageRegister?: TranslationRegister;
  contentMode: TranslationContentMode;
  context: TranslationContext;
  fragments: string[];
  fragmentIds?: string[];
  fragmentRoles?: TranslationFragmentRole[];
  precedingContexts?: Array<string | null>;
  sectionContext?: string;
  glossary?: Array<{
    source: string;
    target: string;
  }>;
  hasProtectedMarkers?: boolean;
  maxOutputTokens?: number;
}

export interface TranslationUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface TranslationBatchResult {
  translations: string[];
  usage?: TranslationUsage;
  finishReason?: string;
}
