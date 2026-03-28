# Live Translation Baseline Refresh: Representation Theory on Gemini 3.1 Flash Lite

Date:
2026-03-28 17:42:46 JST

Target URL:
`https://en.wikipedia.org/wiki/Representation_theory`

Goal:
- Re-measure the long real-page baseline after the runtime pipeline changes:
  - first-screen budget scheduling
  - `lazy-visible` follow-up
  - calibrated runtime batching
  - stronger reader-only pruning
  - section-context and glossary hints
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
- Metrics JSON: [en-wikipedia-org-representation-theory-gemini-3-1-flash-lite-preview-optimized-2026-03-28-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-gemini-3-1-flash-lite-preview-optimized-2026-03-28-metrics.json)
- Screenshot: [en-wikipedia-org-representation-theory-gemini-3-1-flash-lite-preview-optimized-2026-03-28-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-gemini-3-1-flash-lite-preview-optimized-2026-03-28-translated.png)
- Comparison vs pre-optimization Gemini baseline: [en-wikipedia-org-representation-theory-gemini-3-1-flash-lite-preview-optimized-2026-03-28-vs-pre-optimization.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons/en-wikipedia-org-representation-theory-gemini-3-1-flash-lite-preview-optimized-2026-03-28-vs-pre-optimization.md)

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
- First visible translation: `3,800 ms` (`3.8 s`)
- Full completion: `244,049 ms` (`244.0 s`, about `4m 4.0s`)

Usage:
- Request count: `101`
- Prompt tokens: `63,404`
- Completion tokens: `57,447`
- Total tokens: `120,851`
- Harness-estimated cost from current OpenRouter pricing: `$0.1020215`

Concurrency:
- Actual peak in-flight OpenRouter requests observed in this run: `2`
- The optimized scheduler stayed within the conservative concurrency path for this page.

Comparison vs the previous Gemini 3.1 Flash Lite real-page baseline:
- Old baseline metrics JSON: [en-wikipedia-org-representation-theory-google-gemini-3-1-flash-lite-preview-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-google-gemini-3-1-flash-lite-preview-metrics.json)
- Request count: `82 -> 101` (`+23.17%`)
- Prompt tokens: `76,082 -> 63,404` (`-16.66%`)
- Completion tokens: `74,580 -> 57,447` (`-22.97%`)
- Total tokens: `150,662 -> 120,851` (`-19.79%`)
- First visible translation: `98.974 s -> 3.8 s` (`-96.16%`)
- Full completion: `270.160 s -> 244.049 s` (`-9.67%`)
- Peak concurrency: `3 -> 2`
- Estimated cost: `$0.1308905 -> $0.1020215` (`-22.06%`)

Interpretation:
- The optimization clearly traded more, smaller requests for a dramatically faster first readable paint.
- That trade was worth it on this page:
  - first visible latency dropped from unusable to acceptable
  - total token volume dropped materially
  - estimated cost dropped materially
  - full completion also improved
- The remaining obvious regression is request count. The scheduler is now much more reader-friendly, but it still fragments the workload more than ideal.

Quality review:
- The lead paragraphs remain fluent Japanese and finish as complete sentences.
- The coarse preservation checks stayed exact on the real page.
- Section-level consistency improved enough that this run is a better production baseline than the earlier Gemini 3.1 Flash Lite run.

Important note:
- An earlier rerun in this session accidentally picked up `E2E_TRANSLATION_MODEL=google/gemini-3-flash-preview` from `.env`.
- The adopted baseline in this note is not that run.
- The adopted baseline is the later run that explicitly overrode:
  - `E2E_TRANSLATION_MODEL=google/gemini-3.1-flash-lite-preview`

Why this is now the durable baseline:
- It matches the current default production model.
- It reflects the current optimized runtime pipeline.
- It is the most representative benchmark for future speed/cost/quality comparisons in this repository.

Next metrics worth adding:
- Activity-log verified cost for this exact run, if an OpenRouter CSV is provided later
- Immediate-phase vs `lazy-visible` vs fully deferred timings
- Retry counters by failure class
- Fragment-cache hit ratio on repeat runs
