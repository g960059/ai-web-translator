import {
  estimateCompletionTokensForContent,
  estimateCompletionTokensForBatch,
  estimatePromptTokensForContent,
  estimatePromptTokensForBatch,
  estimateTokensForBatches,
} from '../src/core/analysis';
import {
  getEstimateCalibrationSnapshot,
  recordTranslationUsageSamples,
} from '../src/shared/estimate-calibration';

describe('analysis estimates', () => {
  it('applies richer overhead for html batches than plain text batches', () => {
    const htmlBatch = {
      contentMode: 'html' as const,
      preparedChars: 1200,
      fragmentCount: 3,
    };
    const textBatch = {
      contentMode: 'text' as const,
      preparedChars: 1200,
      fragmentCount: 3,
    };

    expect(estimatePromptTokensForBatch(htmlBatch)).toBeGreaterThan(
      estimatePromptTokensForBatch(textBatch),
    );
    expect(estimateCompletionTokensForBatch(htmlBatch)).toBeGreaterThan(
      estimateCompletionTokensForBatch(textBatch),
    );
  });

  it('learns prompt and completion multipliers from real usage samples', async () => {
    const baseBatches = [
      {
        contentMode: 'html' as const,
        preparedChars: 1600,
        fragmentCount: 2,
      },
    ];
    const baseEstimate = estimateTokensForBatches(baseBatches);

    await recordTranslationUsageSamples('openrouter', 'test-model', [
      {
        contentMode: 'html',
        estimatedPromptTokens: baseEstimate.inputTokens,
        estimatedCompletionTokens: baseEstimate.outputTokens,
        usage: {
          promptTokens: Math.round(baseEstimate.inputTokens * 1.35),
          completionTokens: Math.round(baseEstimate.outputTokens * 1.25),
          totalTokens: Math.round(baseEstimate.inputTokens * 1.35 + baseEstimate.outputTokens * 1.25),
        },
      },
    ]);

    const calibration = await getEstimateCalibrationSnapshot('openrouter', 'test-model');
    const learnedEstimate = estimateTokensForBatches(baseBatches, calibration);

    expect(calibration.html.sampleCount).toBe(1);
    expect(calibration.html.promptMultiplier).toBeGreaterThan(1);
    expect(calibration.html.completionMultiplier).toBeGreaterThan(1);
    expect(learnedEstimate.inputTokens).toBeGreaterThan(baseEstimate.inputTokens);
    expect(learnedEstimate.outputTokens).toBeGreaterThan(baseEstimate.outputTokens);
  });

  it('applies calibration to fragment-level runtime estimates too', async () => {
    const baselinePrompt = estimatePromptTokensForContent('text', 400);
    const baselineCompletion = estimateCompletionTokensForContent('text', 400);

    await recordTranslationUsageSamples('openrouter', 'fragment-model', [
      {
        contentMode: 'text',
        estimatedPromptTokens: baselinePrompt,
        estimatedCompletionTokens: baselineCompletion,
        usage: {
          promptTokens: Math.round(baselinePrompt * 1.4),
          completionTokens: Math.round(baselineCompletion * 1.3),
          totalTokens: Math.round(baselinePrompt * 1.4 + baselineCompletion * 1.3),
        },
      },
    ]);

    const calibration = await getEstimateCalibrationSnapshot('openrouter', 'fragment-model');

    expect(estimatePromptTokensForContent('text', 400, calibration)).toBeGreaterThan(
      baselinePrompt,
    );
    expect(estimateCompletionTokensForContent('text', 400, calibration)).toBeGreaterThan(
      baselineCompletion,
    );
  });
});
