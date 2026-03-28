import type { EstimateCalibrationSnapshot } from '../shared/estimate-calibration';
import type { ProviderModelInfo, TranslationContentMode } from '../shared/types';

const PROMPT_CHAR_DIVISOR: Record<TranslationContentMode, number> = {
  text: 3.9,
  html: 3.2,
};

const COMPLETION_CHAR_DIVISOR: Record<TranslationContentMode, number> = {
  text: 3.5,
  html: 2.95,
};

const PROMPT_BATCH_OVERHEAD = 170;
const COMPLETION_BATCH_OVERHEAD = 120;
const PROMPT_FRAGMENT_OVERHEAD = 24;
const COMPLETION_FRAGMENT_OVERHEAD = 18;

export interface EstimateBatchShape {
  contentMode: TranslationContentMode;
  preparedChars: number;
  fragmentCount: number;
}

const DEFAULT_CALIBRATION: EstimateCalibrationSnapshot = {
  text: {
    sampleCount: 0,
    promptMultiplier: 1,
    completionMultiplier: 1,
  },
  html: {
    sampleCount: 0,
    promptMultiplier: 1,
    completionMultiplier: 1,
  },
};

export function estimateTokensFromChars(charCount: number): number {
  return Math.ceil(charCount / 4);
}

export function estimatePromptTokensForContent(
  contentMode: TranslationContentMode,
  preparedChars: number,
  calibration: EstimateCalibrationSnapshot = DEFAULT_CALIBRATION,
): number {
  const basePromptTokens =
    Math.ceil(preparedChars / PROMPT_CHAR_DIVISOR[contentMode]) + PROMPT_FRAGMENT_OVERHEAD;
  return Math.ceil(basePromptTokens * calibration[contentMode].promptMultiplier);
}

export function estimateCompletionTokensForContent(
  contentMode: TranslationContentMode,
  preparedChars: number,
  calibration: EstimateCalibrationSnapshot = DEFAULT_CALIBRATION,
): number {
  const baseCompletionTokens =
    Math.ceil(preparedChars / COMPLETION_CHAR_DIVISOR[contentMode]) +
    COMPLETION_FRAGMENT_OVERHEAD;
  return Math.ceil(baseCompletionTokens * calibration[contentMode].completionMultiplier);
}

export function estimatePromptTokensForBatch(
  batch: EstimateBatchShape,
  calibration: EstimateCalibrationSnapshot = DEFAULT_CALIBRATION,
): number {
  const basePromptTokens =
    Math.ceil(batch.preparedChars / PROMPT_CHAR_DIVISOR[batch.contentMode]) +
    PROMPT_BATCH_OVERHEAD +
    batch.fragmentCount * PROMPT_FRAGMENT_OVERHEAD;
  return Math.ceil(basePromptTokens * calibration[batch.contentMode].promptMultiplier);
}

export function estimateCompletionTokensForBatch(
  batch: EstimateBatchShape,
  calibration: EstimateCalibrationSnapshot = DEFAULT_CALIBRATION,
): number {
  const baseCompletionTokens =
    Math.ceil(batch.preparedChars / COMPLETION_CHAR_DIVISOR[batch.contentMode]) +
    COMPLETION_BATCH_OVERHEAD +
    batch.fragmentCount * COMPLETION_FRAGMENT_OVERHEAD;
  return Math.ceil(baseCompletionTokens * calibration[batch.contentMode].completionMultiplier);
}

export function estimateTokensForBatches(
  batches: EstimateBatchShape[],
  calibration: EstimateCalibrationSnapshot = DEFAULT_CALIBRATION,
): {
  inputTokens: number;
  outputTokens: number;
} {
  return batches.reduce(
    (totals, batch) => ({
      inputTokens: totals.inputTokens + estimatePromptTokensForBatch(batch, calibration),
      outputTokens:
        totals.outputTokens + estimateCompletionTokensForBatch(batch, calibration),
    }),
    {
      inputTokens: 0,
      outputTokens: 0,
    },
  );
}

export function estimateCostUsd(
  modelId: string,
  models: ProviderModelInfo[],
  estimatedInputTokens: number,
  estimatedOutputTokens: number,
): number {
  const model = models.find((item) => item.id === modelId);
  if (model?.pricing) {
    const promptPrice = Number.parseFloat(model.pricing.prompt);
    const completionPrice = Number.parseFloat(model.pricing.completion);
    if (Number.isFinite(promptPrice) && Number.isFinite(completionPrice)) {
      return estimatedInputTokens * promptPrice + estimatedOutputTokens * completionPrice;
    }
  }

  return (estimatedInputTokens + estimatedOutputTokens) * 0.0000015;
}
