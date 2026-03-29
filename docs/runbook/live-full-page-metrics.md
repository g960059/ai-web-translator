# Runbook: Live Full-Page Metrics

Purpose:
- Measure full-page translation against a real URL
- Save screenshot and metrics JSON
- Compare the latest run against the durable baseline
- Optionally reconcile cost with an OpenRouter activity CSV

Prerequisites:
- `.env` contains `E2E_OPENROUTER_API_KEY`
- model is `google/gemini-3.1-flash-lite-preview` unless you are intentionally measuring another model
- extension builds cleanly

Important:
- If `.env` still contains an older `E2E_TRANSLATION_MODEL`, override it explicitly when measuring the default path:

```bash
E2E_TRANSLATION_MODEL=google/gemini-3.1-flash-lite-preview \
  npm run test:e2e:live:page -- https://en.wikipedia.org/wiki/Representation_theory
```

Run:

```bash
npm run test:e2e:live:page -- https://en.wikipedia.org/wiki/Representation_theory
```

Run a small stability sample against the same page:

```bash
npm run metrics:stability -- https://en.wikipedia.org/wiki/Representation_theory --runs 3 --label stability
```

Evaluate the resulting stability summary against the scenario gate:

```bash
npm run metrics:gate -- \
  test-results/en-wikipedia-org-representation-theory-stability-summary.json \
  docs/metrics/gates/representation-theory-stability.json
```

Artifacts produced:
- metrics JSON in [test-results](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results)
- screenshot in [test-results](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results)
- stability summary JSON in [test-results](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results) when using `metrics:stability`
- stability gate report in [docs/metrics/comparisons](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons) when using `metrics:gate`

Compare against the durable baseline:

```bash
npm run metrics:compare
```

Run the fixture-based quality bench alongside the live benchmark:

```bash
npm run test:quality-bench
```

This keeps two quality surfaces in place:
- real-page runtime quality on `Representation_theory`
- structure-sensitive regression checks on the curated Wikipedia fixtures

If you need a custom comparison:

```bash
node tests/e2e/compare-live-metrics.mjs \
  docs/metrics/baselines/representation-theory.json \
  test-results/en-wikipedia-org-representation-theory-metrics.json \
  --out docs/metrics/comparisons/custom.md
```

If an OpenRouter activity CSV is available:
1. Match the successful run by timestamp.
2. Prefer a small padded window around the measured run because CSV `created_at` is request-creation time.
3. Reconcile:
   - request count
   - prompt tokens
   - completion tokens
   - cost
4. If the CSV is the better source of truth, update `costUsd` in the metrics JSON and note `costSource`.

Update the durable baseline when appropriate:
1. Confirm the run is stable and representative.
2. Prefer a small repeated-run sample when you are refreshing the durable baseline for the same URL and model.
3. Copy the chosen values into [representation-theory.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json).
4. Archive the previous baseline JSON if this is a durable step-change rather than a one-off measurement.
5. Update the current dated metrics note in [docs/metrics](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics) and keep the quality scorecard note current.
6. If the change reflects a durable project decision, update or add an ADR.
