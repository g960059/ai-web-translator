# Stability Sample: Representation Theory on Gemini 3.1 Flash Lite

Date:
2026-03-29 JST

Target URL:
`https://en.wikipedia.org/wiki/Representation_theory`

Purpose:
- Measure repeated-run stability on the current HTML durable benchmark.
- Check whether the current durable baseline is representative enough to keep.
- Capture median and spread before doing any further pipeline tuning.

Execution:
- Provider: `openrouter`
- Model: `google/gemini-3.1-flash-lite-preview`
- Scope: `page`
- Target language: `ja`
- Style: `auto`
- Cache: `false`
- Harness: [run-live-page-stability.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/run-live-page-stability.mjs)
- Summary JSON: [en-wikipedia-org-representation-theory-stability-v5-summary.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v5-summary.json)

Per-run artifacts:
- Run 1 metrics: [en-wikipedia-org-representation-theory-stability-v5-run-1-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v5-run-1-metrics.json)
- Run 1 screenshot: [en-wikipedia-org-representation-theory-stability-v5-run-1-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v5-run-1-translated.png)
- Run 2 metrics: [en-wikipedia-org-representation-theory-stability-v5-run-2-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v5-run-2-metrics.json)
- Run 2 screenshot: [en-wikipedia-org-representation-theory-stability-v5-run-2-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v5-run-2-translated.png)
- Run 3 metrics: [en-wikipedia-org-representation-theory-stability-v5-run-3-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v5-run-3-metrics.json)
- Run 3 screenshot: [en-wikipedia-org-representation-theory-stability-v5-run-3-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v5-run-3-translated.png)
- Current durable baseline note: [2026-03-29-representation-theory-durable-baseline.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-representation-theory-durable-baseline.md)

Median metrics across 3 runs:
- First visible translation: `1,999 ms`
- Full completion: `36,105 ms`
- Request count: `15`
- Total tokens: `28,428`
- Estimated cost: `$0.02492075`
- Peak in-flight requests: `5`
- Immediate provider latency: `1,929 ms`

Spread:
- First visible translation: `1,904 ms -> 2,355 ms` (spread `451 ms`)
- Full completion: `30,143 ms -> 38,454 ms` (spread `8,311 ms`)
- Request count: `15 -> 15`
- Total tokens: `28,089 -> 28,549`
- Estimated cost: `$0.02443725 -> $0.02512225`
- Immediate provider latency: `1,835 ms -> 2,285 ms`

Run-by-run notes:
- Run 1:
  - `2,355 ms / 38,454 ms / 15 requests / 28,089 tokens / $0.02443725`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - immediate batch: `1 group / 1 fragment / text / 24 chars / 201 est. prompt tokens / 2,285 ms provider latency / 2,283 ms background-provider / 2 ms bridge`
- Run 2:
  - `1,999 ms / 36,105 ms / 15 requests / 28,549 tokens / $0.02512225`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - immediate batch: `1 group / 1 fragment / text / 24 chars / 201 est. prompt tokens / 1,929 ms provider latency / 1,927 ms background-provider / 2 ms bridge`
- Run 3:
  - `1,904 ms / 30,143 ms / 15 requests / 28,428 tokens / $0.02492075`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - immediate batch: `1 group / 1 fragment / text / 24 chars / 201 est. prompt tokens / 1,835 ms provider latency / 1,834 ms background-provider / 1 ms bridge`

Interpretation:
- The current pipeline is materially stable on structure:
  - all 3 runs preserved math, fallback images, and media images exactly.
- The HTML lane is now much more stable on throughput than the earlier samples:
  - all 3 runs stayed split-free
  - request count is now fixed at `15`
  - token and cost spread is very small
- The remaining instability is now clearly background/provider-side on the first request, not payload-side and not content/background bridge-side:
  - all 3 runs used the same immediate batch shape
  - `1 group / 1 fragment / text / 24 chars / 201 est. prompt tokens`
  - the visible spread tracks the first provider round-trip closely: `1.84s -> 2.29s`
  - the content/background bridge overhead was effectively negligible: `1ms -> 2ms`
- Full completion remains much better than the old durable baseline, but still widens when later XHTML-like heavy sections happen to resolve more slowly.

Baseline decision:
- Keep the current durable baseline in [representation-theory.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json) for now.
- Do not promote the repeated-run median into the durable baseline yet.
- Reason:
  - the current baseline still represents the best exact-count production run
  - the new sample proves that completion-time stability is good enough to keep optimizing from here
  - but the remaining first-request provider variance is still the main source of visible spread, so a single median run should not replace the durable baseline yet

What this means for next work:
- The HTML lane is structurally stable enough to optimize further without losing confidence.
- The next HTML task should focus on hiding or amortizing first-request provider variance, not shrinking the immediate payload further.
- Candidate directions:
  - overlapping the first visible commit with more aggressive prewarm/readiness work
  - investigating whether an even smaller invite/lead request is useful in practice
  - treating the bridge path as solved and focusing on provider-facing mitigation only
  - keeping exact coarse counts while reducing the user-visible impact of a `2s+` first provider round-trip
