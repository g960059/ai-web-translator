import type { ProviderId, ProviderModelInfo, TranslationBatchRequest, TranslationBatchResult } from '../shared/types';
import {
  getOpenRouterModels,
  translateWithOpenRouter,
  warmOpenRouterConnection,
  validateOpenRouterApiKey,
} from './providers/openrouter';

export interface TranslationProvider {
  listModels(): Promise<ProviderModelInfo[]>;
  warmup?(): Promise<void>;
  validateApiKey?(apiKey: string): Promise<{ valid: boolean; error?: string }>;
  translateBatch(
    request: TranslationBatchRequest,
    options?: { signal?: AbortSignal },
  ): Promise<TranslationBatchResult>;
}

const providerRegistry: Record<ProviderId, TranslationProvider> = {
  openrouter: {
    listModels: getOpenRouterModels,
    warmup: warmOpenRouterConnection,
    validateApiKey: validateOpenRouterApiKey,
    translateBatch: translateWithOpenRouter,
  },
};

export function getTranslationProvider(provider: ProviderId): TranslationProvider {
  return providerRegistry[provider];
}
