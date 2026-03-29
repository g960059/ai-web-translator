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
- Summary JSON: [en-wikipedia-org-representation-theory-stability-v4-summary.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v4-summary.json)

Per-run artifacts:
- Run 1 metrics: [en-wikipedia-org-representation-theory-stability-v4-run-1-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v4-run-1-metrics.json)
- Run 1 screenshot: [en-wikipedia-org-representation-theory-stability-v4-run-1-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v4-run-1-translated.png)
- Run 2 metrics: [en-wikipedia-org-representation-theory-stability-v4-run-2-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v4-run-2-metrics.json)
- Run 2 screenshot: [en-wikipedia-org-representation-theory-stability-v4-run-2-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v4-run-2-translated.png)
- Run 3 metrics: [en-wikipedia-org-representation-theory-stability-v4-run-3-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v4-run-3-metrics.json)
- Run 3 screenshot: [en-wikipedia-org-representation-theory-stability-v4-run-3-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v4-run-3-translated.png)
- Current durable baseline note: [2026-03-29-representation-theory-durable-baseline.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-representation-theory-durable-baseline.md)

Median metrics across 3 runs:
- First visible translation: `3,222 ms`
- Full completion: `31,136 ms`
- Request count: `15`
- Total tokens: `28,411`
- Estimated cost: `$0.02491025`
- Peak in-flight requests: `5`
- Immediate provider latency: `3,146 ms`

Spread:
- First visible translation: `2,261 ms -> 3,506 ms` (spread `1,245 ms`)
- Full completion: `31,093 ms -> 39,336 ms` (spread `8,243 ms`)
- Request count: `15 -> 15`
- Total tokens: `28,289 -> 28,520`
- Estimated cost: `$0.02473225 -> $0.02506375`
- Immediate provider latency: `2,190 ms -> 3,445 ms`

Run-by-run notes:
- Run 1:
  - `2,261 ms / 31,136 ms / 15 requests / 28,520 tokens / $0.02506375`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - immediate batch: `1 group / 1 fragment / text / 24 chars / 201 est. prompt tokens / 2,190 ms provider latency`
- Run 2:
  - `3,506 ms / 31,093 ms / 15 requests / 28,411 tokens / $0.02491025`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - immediate batch: `1 group / 1 fragment / text / 24 chars / 201 est. prompt tokens / 3,445 ms provider latency`
- Run 3:
  - `3,222 ms / 39,336 ms / 15 requests / 28,289 tokens / $0.02473225`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - immediate batch: `1 group / 1 fragment / text / 24 chars / 201 est. prompt tokens / 3,146 ms provider latency`

Interpretation:
- The current pipeline is materially stable on structure:
  - all 3 runs preserved math, fallback images, and media images exactly.
- The HTML lane is now much more stable on throughput than the earlier samples:
  - all 3 runs stayed split-free
  - request count is now fixed at `15`
  - token and cost spread is very small
- The remaining instability is now clearly provider-side on the first request, not payload-side:
  - all 3 runs used the same immediate batch shape
  - `1 group / 1 fragment / text / 24 chars / 201 est. prompt tokens`
  - the visible spread tracks the first provider round-trip closely: `2.19s -> 3.45s`
- Full completion remains much better than the old durable baseline, but still widens when the first provider response is slow.

Baseline decision:
- Keep the current durable baseline in [representation-theory.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json) for now.
- Do not promote the repeated-run median into the durable baseline yet.
- Reason:
  - the current baseline still represents the best exact-count production run
  - the new sample proves that completion-time stability is good enough to keep optimizing from here
  - but the remaining `2.19s -> 3.45s` first-request provider variance is still large enough that a single median run should not replace the durable baseline yet

What this means for next work:
- The HTML lane is structurally stable enough to optimize further without losing confidence.
- The next HTML task should focus on hiding or amortizing first-request provider variance, not shrinking the immediate payload further.
- Candidate directions:
  - overlapping the first visible commit with more aggressive prewarm/readiness work
  - investigating whether an even smaller invite/lead request is useful in practice
  - keeping exact coarse counts while reducing the user-visible impact of a `3s+` first provider round-trip
