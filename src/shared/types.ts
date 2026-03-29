export type ProviderId = 'openrouter';

export type TranslationScope = 'page' | 'main' | 'selection';

export type DefaultTranslationScope = Exclude<TranslationScope, 'selection'>;

export type TranslationStyle = 'auto' | 'readable' | 'precise' | 'source-like';
export type TranslationContentMode = 'html' | 'text';

export type TranslationStatus =
  | 'idle'
  | 'scanning'
  | 'queued'
  | 'translating'
  | 'retrying'
  | 'lazy'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type WidgetState = 'off' | 'working' | 'resting' | 'retrying' | 'error' | 'done';

export type BlockDisplayState = 'original' | 'translated';

export type PageDisplayState = 'original' | 'translated' | 'mixed';

export interface ExtensionSettings {
  provider: ProviderId;
  apiKey: string;
  model: string;
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

export interface SessionRuntimeMetrics {
  phaseTimings: SessionPhaseTimings;
  retryCounts: SessionRetryCounts;
  cacheStats: SessionCacheStats;
  requestCountsByPhase: SessionRequestCountsByPhase;
  splitStats: SessionSplitStats;
  immediateBatch: SessionImmediateBatchMetrics | null;
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
  contentMode: TranslationContentMode;
  context: TranslationContext;
  fragments: string[];
  fragmentIds?: string[];
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
