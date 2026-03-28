# Live Translation Baseline Refresh: Representation Theory on Gemini 3.1 Flash Lite

Date:
2026-03-28 23:06:34 JST

Target URL:
`https://en.wikipedia.org/wiki/Representation_theory`

Goal:
- Re-measure the long real-page baseline after the runtime pipeline changes:
  - lead-first scheduling with a dedicated first-screen slot
  - higher deferred throughput with runtime backpressure
  - placeholder-rich text for lightweight inline HTML
  - fragment-id request/response matching
  - protected atomic HTML markers for math/media preservation
- Keep the default provider/model fixed at:
  - `openrouter`
  - `google/gemini-3.1-flash-lite-preview`

Execution:
- Provider: `openrouter`
- Model: `google/gemini-3.1-flash-lite-preview`
- Scope: `page` (`translateFullPage: true`)
- Target language: `ja`
- Style: `auto`
- Cache: `false`
- Harness: [run-live-page-metrics.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/run-live-page-metrics.mjs)
- Metrics JSON: [en-wikipedia-org-representation-theory-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-metrics.json)
- Screenshot: [en-wikipedia-org-representation-theory-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-translated.png)
- Comparison vs the previous durable baseline: [en-wikipedia-org-representation-theory-metrics-vs-representation-theory.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons/en-wikipedia-org-representation-theory-metrics-vs-representation-theory.md)

Outcome:
- Full-page translation completed successfully
- Final session state: `completed`
- Display state: `translated`
- Progress: `100%`
- Coarse page preservation remained exact:
  - math elements: `129 -> 129`
  - fallback images: `118 -> 118`
  - media images: `5 -> 5`

Timing:
- First visible translation: `2,428 ms` (`2.4 s`)
- Full completion: `50,373 ms` (`50.4 s`)

Usage:
- Request count: `17`
- Prompt tokens: `18,079`
- Completion tokens: `17,962`
- Total tokens: `36,041`
- Harness-estimated cost from current OpenRouter pricing: `$0.03146275`

Concurrency:
- Actual peak in-flight OpenRouter requests observed in this run: `3`
- The runtime stayed stable without any retry-driven backoff.

Phase timings:
- Immediate phase complete: `2,370 ms`
- Lazy-visible phase complete: `13,120 ms`
- Full completion: `50,052 ms`

Retry and cache notes:
- Retry count: `0`
- Batch splits: `0`
- Fragment splits: `0`
- Cache misses: `259`
- Cache was intentionally disabled for this benchmark run

Comparison vs the previous Gemini 3.1 Flash Lite real-page baseline:
- Old durable baseline metrics JSON: [representation-theory.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json)
- Request count: `101 -> 17` (`-83.17%`)
- Prompt tokens: `63,404 -> 18,079` (`-71.49%`)
- Completion tokens: `57,447 -> 17,962` (`-68.73%`)
- Total tokens: `120,851 -> 36,041` (`-70.18%`)
- First visible translation: `3.8 s -> 2.428 s` (`-36.11%`)
- Full completion: `244.049 s -> 50.373 s` (`-79.36%`)
- Peak concurrency: `2 -> 3`
- Estimated cost: `$0.1020215 -> $0.03146275` (`-69.16%`)

Interpretation:
- The runtime no longer needs the old trade-off between first readable paint and total throughput.
- This run improved every primary production metric on the same page:
  - first visible translation is faster
  - full completion is dramatically faster
  - request count is much lower
  - total token volume is much lower
  - estimated cost is much lower
- The biggest contributors were:
  - isolating the lead reading cluster
  - bundling more text into fewer dense batches
  - protecting math/media HTML with markers so the model only translates surrounding text

Quality review:
- The lead paragraphs remain fluent Japanese and finish as complete sentences.
- The coarse preservation checks stayed exact on the real page:
  - math elements: `129 -> 129`
  - fallback images: `118 -> 118`
  - media images: `5 -> 5`
- The earlier quality regression from lost math/media nodes is no longer present.
- Section-level consistency remains good enough that this run is a stronger production baseline than the earlier one.

Important note:
- `.env` was corrected so that `E2E_TRANSLATION_MODEL=google/gemini-3.1-flash-lite-preview`.
- The adopted baseline in this note is the run captured at `2026-03-28T14:06:34.012Z`.

Why this is now the durable baseline:
- It matches the current default production model.
- It reflects the current optimized runtime pipeline.
- It preserves the real-page math/media counts exactly.
- It is the most representative benchmark for future speed/cost/quality comparisons in this repository.

Next metrics worth adding:
- Activity-log verified cost for this exact run, if an OpenRouter CSV is provided later
- Repeat-run comparison with cache enabled
- A curated medium-size `Representation_theory_of_finite_groups` fixture for structure-stress regression
