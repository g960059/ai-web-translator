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

Artifacts produced:
- metrics JSON in [test-results](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results)
- screenshot in [test-results](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results)

Compare against the durable baseline:

```bash
npm run metrics:compare
```

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
2. Copy the chosen values into [representation-theory.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json).
3. Update the narrative note in [2026-03-28-representation-theory.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-28-representation-theory.md) or create a new dated metrics note if this is a new baseline.
4. If the change reflects a durable project decision, update or add an ADR.
