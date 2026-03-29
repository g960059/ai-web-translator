# Durable Baseline Refresh: Representation Theory on Gemini 3.1 Flash Lite

Date:
2026-03-29 JST

Target URL:
`https://en.wikipedia.org/wiki/Representation_theory`

Purpose:
- Promote the best recent `Representation_theory` live run to the durable baseline.
- Keep the production path fixed at:
  - `openrouter`
  - `google/gemini-3.1-flash-lite-preview`
- Make the real-page benchmark and the fixture-based quality benchmark work together as the default regression surface.

Execution:
- Provider: `openrouter`
- Model: `google/gemini-3.1-flash-lite-preview`
- Scope: `page`
- Target language: `ja`
- Style: `auto`
- Cache: `false`
- Harness: [run-live-page-metrics.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/run-live-page-metrics.mjs)
- Metrics JSON: [en-wikipedia-org-representation-theory-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-metrics.json)
- Screenshot: [en-wikipedia-org-representation-theory-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-translated.png)
- Archived previous baseline: [representation-theory-2026-03-28-phase1.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory-2026-03-28-phase1.json)
- Comparison vs the archived baseline: [en-wikipedia-org-representation-theory-metrics-vs-representation-theory.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons/en-wikipedia-org-representation-theory-metrics-vs-representation-theory.md)

Outcome:
- Full-page translation completed successfully.
- Final session state: `completed`
- Display state: `translated`
- Progress: `100%`
- Coarse page preservation stayed exact:
  - math elements: `129 -> 129`
  - fallback images: `118 -> 118`
  - media images: `5 -> 5`

Timing:
- First visible translation: `1,724 ms`
- Full completion: `32,627 ms`

Usage:
- Request count: `15`
- Prompt tokens: `14,163`
- Completion tokens: `14,160`
- Total tokens: `28,323`
- Harness-estimated cost: `$0.02478075`

Runtime stability:
- Peak in-flight requests: `5`
- Retry count: `0`
- Batch splits: `0`
- Fragment splits: `0`
- Cache misses: `259`

Phase breakdown:
- Immediate phase complete: `1,659 ms`
- Lazy-visible phase complete: `16,015 ms`
- Full completion: `32,463 ms`

Comparison vs the archived 2026-03-28 phase-1 baseline:
- Request count: `17 -> 15`
- Prompt tokens: `18,079 -> 14,163`
- Completion tokens: `17,962 -> 14,160`
- Total tokens: `36,041 -> 28,323`
- First visible translation: `2,428 ms -> 1,724 ms`
- Full completion: `50,373 ms -> 32,627 ms`
- Peak concurrency: `3 -> 5`
- Estimated cost: `$0.03146275 -> $0.02478075`

Interpretation:
- The current pipeline is now materially better than the already-optimized 2026-03-28 baseline, not just better than the original pre-optimization run.
- The biggest wins came from:
  - denser deferred throughput
  - safer placeholder-rich text routing
  - conditional fragment IDs
  - split-free batching on the real page

Quality review:
- The lead section remains fluent Japanese and finishes as complete sentences.
- Structural preservation remains exact on the page-level coarse counters.
- The high-difficulty fixture suite now complements this baseline:
  - [wikipedia-fixture.test.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/wikipedia-fixture.test.ts)
  - [wikipedia-finite-groups-fixture.test.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/wikipedia-finite-groups-fixture.test.ts)

Why this is now the durable baseline:
- It matches the current default production model.
- It improves both the earlier durable baseline and the original pre-optimization baseline.
- It preserves the real-page coarse structure exactly.
- It sits alongside the new high-difficulty fixture benchmark rather than carrying all quality risk on one live page.
- A separate repeated-run stability sample now exists:
  - [2026-03-29-representation-theory-stability-sample.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-representation-theory-stability-sample.md)

Next gaps:
- Remove the remaining repeated-run latency outlier on the HTML page while keeping exact coarse counts.
- Keep the XHTML/XML lane improving from its current tracked state:
  - [2026-03-29-yoneda-lemma-xhtml-track.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-yoneda-lemma-xhtml-track.md)
- Keep the fixture scorecard current as the default quality regression surface.
