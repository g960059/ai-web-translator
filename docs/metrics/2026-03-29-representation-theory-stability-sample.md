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
- Summary JSON: [en-wikipedia-org-representation-theory-stability-v10-protected-summary.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v10-protected-summary.json)

Per-run artifacts:
- Run 1 metrics: [en-wikipedia-org-representation-theory-stability-v10-protected-run-1-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v10-protected-run-1-metrics.json)
- Run 1 screenshot: [en-wikipedia-org-representation-theory-stability-v10-protected-run-1-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v10-protected-run-1-translated.png)
- Run 2 metrics: [en-wikipedia-org-representation-theory-stability-v10-protected-run-2-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v10-protected-run-2-metrics.json)
- Run 2 screenshot: [en-wikipedia-org-representation-theory-stability-v10-protected-run-2-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v10-protected-run-2-translated.png)
- Run 3 metrics: [en-wikipedia-org-representation-theory-stability-v10-protected-run-3-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v10-protected-run-3-metrics.json)
- Run 3 screenshot: [en-wikipedia-org-representation-theory-stability-v10-protected-run-3-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v10-protected-run-3-translated.png)
- Current durable baseline note: [2026-03-29-representation-theory-durable-baseline.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-representation-theory-durable-baseline.md)
- Latest gate summary: [en-wikipedia-org-representation-theory-stability-v7-gate-summary.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v7-gate-summary.json)
- Latest gate config: [representation-theory-stability.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/gates/representation-theory-stability.json)
- Latest gate report: [en-wikipedia-org-representation-theory-stability-v7-gate-summary-gate.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons/en-wikipedia-org-representation-theory-stability-v7-gate-summary-gate.md)

Median metrics across 3 runs:
- First visible translation: `2,340 ms`
- Full completion: `33,837 ms`
- Request count: `15`
- Total tokens: `28,969`
- Estimated cost: `$0.02528975`
- Peak in-flight requests: `5`
- Immediate provider latency: `2,265 ms`
- Warning blocks: `1`
- Protected-marker fallback fragments: `1`

Spread:
- First visible translation: `1,681 ms -> 2,379 ms` (spread `698 ms`)
- Full completion: `30,560 ms -> 34,546 ms` (spread `3,986 ms`)
- Request count: `15 -> 15`
- Total tokens: `28,939 -> 28,999`
- Estimated cost: `$0.02523975 -> $0.02533225`
- Immediate provider latency: `1,604 ms -> 2,304 ms`
- Warning blocks: `0 -> 1`
- Protected-marker fallback fragments: `0 -> 1`

Run-by-run notes:
- Run 1:
  - `2,340 ms / 33,837 ms / 15 requests / 28,999 tokens / $0.02533225`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - warning summary: `0 blocks`
  - immediate batch: `1 group / 1 fragment / text / 272 chars / 264 est. prompt tokens / 2,265 ms provider latency / 2,263 ms background-provider / 2 ms bridge`
- Run 2:
  - `1,681 ms / 30,560 ms / 15 requests / 28,939 tokens / $0.02523975`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - warning summary: `1 block / fallback-source 1 / error 0`
  - immediate batch: `1 group / 1 fragment / text / 272 chars / 264 est. prompt tokens / 1,604 ms provider latency / 1,603 ms background-provider / 1 ms bridge`
- Run 3:
  - `2,379 ms / 34,546 ms / 15 requests / 28,969 tokens / $0.02528975`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - warning summary: `1 block / fallback-source 1 / error 0`
  - immediate batch: `1 group / 1 fragment / text / 272 chars / 264 est. prompt tokens / 2,304 ms provider latency / 2,302 ms background-provider / 2 ms bridge`

Interpretation:
- The current pipeline is materially stable on structure:
  - all 3 runs preserved math, fallback images, and media images exactly.
- The HTML lane is now much more stable on throughput than the earlier samples:
  - all 3 runs stayed split-free
  - request count is now fixed at `15`
  - token and cost spread is very small
- The remaining quality caveat is smaller and now visible instead of hidden:
  - 1 run finished as full `completed`
  - 2 runs finished as `completed_with_warnings`
  - sampled English residual is still `0`
  - `protectedMarkerFallbackFragments` stayed at `0 -> 1`
  - warning blocks stayed at `0 -> 1`
- The remaining instability is now clearly background/provider-side on the first request, not payload-side and not content/background bridge-side:
  - all 3 runs used the same immediate batch shape
  - `1 group / 1 fragment / text / 272 chars / 264 est. prompt tokens`
  - the visible spread still tracks the first provider round-trip closely: `1.60s -> 2.30s`
  - the content/background bridge overhead remained effectively negligible: `1ms -> 2ms`
- Full completion remains much better than the old durable baseline and now sits in the low-30s range on the median.

Baseline decision:
- Keep the current durable baseline in [representation-theory.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json) for now.
- Do not promote the repeated-run median into the durable baseline yet.
- Reason:
  - the current baseline still represents the best exact-count production run
  - the new sample proves that split-driven outliers are now largely gone
  - but the HTML lane is not yet warning-free in repeated runs, so a new durable baseline should wait until `protectedMarkerFallbackFragments` drops to `0` more consistently

What this means for next work:
- The HTML lane is structurally stable enough to optimize further without losing confidence.
- The next HTML task should focus on the single remaining protected-marker fallback paragraph before any further speed tuning.
- Candidate directions:
  - inspect the exact protected-marker fragment shape that still falls back on Wikipedia
  - reduce fallback frequency without reintroducing split-driven outliers
  - keep the bridge path treated as solved
  - defer further first-request tuning until warnings are lower

Gate status update:
- The new `stability-v10-protected` sample is clean on throughput:
  - first visible median `2,340 ms`
  - full completion median `33,837 ms`
  - requests `15`
  - total tokens `28,969`
  - sampled English residual ratio `0`
  - split median `0`
- Important nuance:
  - the tail is no longer driven by split outliers
  - the remaining caution is one protected-marker fallback paragraph, not batch instability
