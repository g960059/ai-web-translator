# Metrics Workflow

This directory stores measured outputs and durable baselines.

Files:
- Current narrative baseline note: [2026-03-28-representation-theory-gemini-runtime-improvements.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-28-representation-theory-gemini-runtime-improvements.md)
- Historical baseline note: [2026-03-28-representation-theory.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-28-representation-theory.md)
- Model evaluation note: [2026-03-28-openrouter-model-evaluation.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-28-openrouter-model-evaluation.md)
- Real-page comparison note: [2026-03-28-representation-theory-real-page-model-comparison.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-28-representation-theory-real-page-model-comparison.md)
- Optimization comparison note: [en-wikipedia-org-representation-theory-gemini-3-1-flash-lite-preview-optimized-2026-03-28-vs-pre-optimization.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons/en-wikipedia-org-representation-theory-gemini-3-1-flash-lite-preview-optimized-2026-03-28-vs-pre-optimization.md)
- Baselines: [baselines](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines)
- Comparisons: [comparisons](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons)
- Latest live metrics JSON: [test-results](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results)
- Operational procedure: [live-full-page-metrics.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/runbook/live-full-page-metrics.md)

Run a live full-page measurement:

```bash
npm run test:e2e:live:page -- https://en.wikipedia.org/wiki/Representation_theory
```

Run the small high-difficulty model shootout:

```bash
npm run metrics:model-eval
```

Compare the latest run against the default baseline:

```bash
npm run metrics:compare
```

Compare arbitrary files:

```bash
node tests/e2e/compare-live-metrics.mjs \
  docs/metrics/baselines/representation-theory.json \
  test-results/en-wikipedia-org-representation-theory-metrics.json \
  --out docs/metrics/comparisons/custom.md
```

Tracked comparison metrics:
- `requestCount`
- `usage.promptTokens`
- `usage.completionTokens`
- `usage.totalTokens`
- `elapsedMs.toFirstVisibleTranslation`
- `elapsedMs.toFullCompletion`
- `concurrency.peakInFlightRequests`
- `costUsd`

Cost note:
- If an OpenRouter activity log is available, prefer replacing `costUsd` in the metrics JSON with the activity-log verified value before comparing runs.
- If `.env` overrides `E2E_TRANSLATION_MODEL`, explicitly set `E2E_TRANSLATION_MODEL=google/gemini-3.1-flash-lite-preview` when measuring the default production path.
