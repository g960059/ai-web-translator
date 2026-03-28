import type { ProviderId, TranslationContentMode, TranslationUsage } from './types';

const ESTIMATE_CALIBRATION_STORAGE_KEY = 'estimate_calibration_v1';
const MAX_SAMPLE_COUNT = 25;
const MIN_MULTIPLIER = 0.75;
const MAX_MULTIPLIER = 2.5;

interface CalibrationBucket {
  sampleCount: number;
  promptMultiplier: number;
  completionMultiplier: number;
}

type CalibrationStore = Record<string, CalibrationBucket>;

export interface EstimateCalibration {
  promptMultiplier: number;
  completionMultiplier: number;
  sampleCount: number;
}

export interface EstimateCalibrationSnapshot {
  text: EstimateCalibration;
  html: EstimateCalibration;
}

export interface TranslationUsageSample {
  contentMode: TranslationContentMode;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  usage: TranslationUsage;
}

let cachedStore: CalibrationStore | null = null;

export function resetEstimateCalibrationCache(): void {
  cachedStore = null;
}

export async function getEstimateCalibrationSnapshot(
  provider: ProviderId,
  model: string,
): Promise<EstimateCalibrationSnapshot> {
  const store = await loadCalibrationStore();
  return {
    text: resolveCalibrationBucket(store, buildCalibrationKey(provider, model, 'text')),
    html: resolveCalibrationBucket(store, buildCalibrationKey(provider, model, 'html')),
  };
}

export async function recordTranslationUsageSamples(
  provider: ProviderId,
  model: string,
  samples: TranslationUsageSample[],
): Promise<void> {
  if (samples.length === 0) {
    return;
  }

  const store = await loadCalibrationStore();

  samples.forEach((sample) => {
    if (sample.estimatedPromptTokens <= 0 || sample.estimatedCompletionTokens <= 0) {
      return;
    }

    const key = buildCalibrationKey(provider, model, sample.contentMode);
    const current = resolveCalibrationBucket(store, key);
    const promptRatio = clampRatio(sample.usage.promptTokens / sample.estimatedPromptTokens);
    const completionRatio = clampRatio(
      sample.usage.completionTokens / sample.estimatedCompletionTokens,
    );
    const nextSampleCount = Math.min(current.sampleCount + 1, MAX_SAMPLE_COUNT);

    store[key] = {
      sampleCount: nextSampleCount,
      promptMultiplier: weightedAverage(current.promptMultiplier, promptRatio, current.sampleCount),
      completionMultiplier: weightedAverage(
        current.completionMultiplier,
        completionRatio,
        current.sampleCount,
      ),
    };
  });

  cachedStore = store;
  await chrome.storage.local.set({
    [ESTIMATE_CALIBRATION_STORAGE_KEY]: store,
  });
}

function weightedAverage(currentValue: number, nextValue: number, sampleCount: number): number {
  if (sampleCount <= 0) {
    return nextValue;
  }

  const normalizedSampleCount = Math.min(sampleCount, MAX_SAMPLE_COUNT - 1);
  return (
    (currentValue * normalizedSampleCount + nextValue) /
    (normalizedSampleCount + 1)
  );
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return Math.min(MAX_MULTIPLIER, Math.max(MIN_MULTIPLIER, value));
}

function buildCalibrationKey(
  provider: ProviderId,
  model: string,
  contentMode: TranslationContentMode,
): string {
  return `${provider}::${model}::${contentMode}`;
}

function resolveCalibrationBucket(
  store: CalibrationStore,
  key: string,
): EstimateCalibration {
  const bucket = store[key];
  if (!bucket) {
    return {
      sampleCount: 0,
      promptMultiplier: 1,
      completionMultiplier: 1,
    };
  }

  return bucket;
}

async function loadCalibrationStore(): Promise<CalibrationStore> {
  if (cachedStore) {
    return cachedStore;
  }

  const result = await chrome.storage.local.get(ESTIMATE_CALIBRATION_STORAGE_KEY);
  const store = result[ESTIMATE_CALIBRATION_STORAGE_KEY];
  cachedStore = isCalibrationStore(store) ? store : {};
  return cachedStore;
}

function isCalibrationStore(value: unknown): value is CalibrationStore {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Object.values(value).every((bucket) => {
    if (typeof bucket !== 'object' || bucket === null) {
      return false;
    }

    const candidate = bucket as Partial<CalibrationBucket>;
    return (
      typeof candidate.sampleCount === 'number' &&
      typeof candidate.promptMultiplier === 'number' &&
      typeof candidate.completionMultiplier === 'number'
    );
  });
}
