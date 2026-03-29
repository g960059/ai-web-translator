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
- Summary JSON: [en-wikipedia-org-representation-theory-stability-v9-warning-summary.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v9-warning-summary.json)

Per-run artifacts:
- Run 1 metrics: [en-wikipedia-org-representation-theory-stability-v9-warning-run-1-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v9-warning-run-1-metrics.json)
- Run 1 screenshot: [en-wikipedia-org-representation-theory-stability-v9-warning-run-1-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v9-warning-run-1-translated.png)
- Run 2 metrics: [en-wikipedia-org-representation-theory-stability-v9-warning-run-2-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v9-warning-run-2-metrics.json)
- Run 2 screenshot: [en-wikipedia-org-representation-theory-stability-v9-warning-run-2-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v9-warning-run-2-translated.png)
- Run 3 metrics: [en-wikipedia-org-representation-theory-stability-v9-warning-run-3-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v9-warning-run-3-metrics.json)
- Run 3 screenshot: [en-wikipedia-org-representation-theory-stability-v9-warning-run-3-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v9-warning-run-3-translated.png)
- Current durable baseline note: [2026-03-29-representation-theory-durable-baseline.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-representation-theory-durable-baseline.md)
- Latest gate summary: [en-wikipedia-org-representation-theory-stability-v7-gate-summary.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v7-gate-summary.json)
- Latest gate config: [representation-theory-stability.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/gates/representation-theory-stability.json)
- Latest gate report: [en-wikipedia-org-representation-theory-stability-v7-gate-summary-gate.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons/en-wikipedia-org-representation-theory-stability-v7-gate-summary-gate.md)

Median metrics across 3 runs:
- First visible translation: `2,263 ms`
- Full completion: `32,234 ms`
- Request count: `15`
- Total tokens: `28,947`
- Estimated cost: `$0.02534675`
- Peak in-flight requests: `5`
- Immediate provider latency: `2,184 ms`
- Warning blocks: `1`
- Protected-marker fallback fragments: `1`

Spread:
- First visible translation: `2,230 ms -> 2,666 ms` (spread `436 ms`)
- Full completion: `29,801 ms -> 36,410 ms` (spread `6,609 ms`)
- Request count: `15 -> 15`
- Total tokens: `28,928 -> 29,031`
- Estimated cost: `$0.02531825 -> $0.02548025`
- Immediate provider latency: `2,149 ms -> 2,590 ms`
- Warning blocks: `1 -> 2`
- Protected-marker fallback fragments: `1 -> 2`

Run-by-run notes:
- Run 1:
  - `2,666 ms / 32,234 ms / 15 requests / 29,031 tokens / $0.02548025`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - warning summary: `1 block / fallback-source 1 / error 0`
  - immediate batch: `1 group / 1 fragment / text / 272 chars / 264 est. prompt tokens / 2,590 ms provider latency / 2,589 ms background-provider / 1 ms bridge`
- Run 2:
  - `2,263 ms / 36,410 ms / 15 requests / 28,928 tokens / $0.02531825`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - warning summary: `1 block / fallback-source 1 / error 0`
  - immediate batch: `1 group / 1 fragment / text / 272 chars / 264 est. prompt tokens / 2,184 ms provider latency / 2,184 ms background-provider / 0 ms bridge`
- Run 3:
  - `2,230 ms / 29,801 ms / 15 requests / 28,947 tokens / $0.02534675`
  - no retries, no splits
  - coarse structure exact: `129 / 118 / 5`
  - warning summary: `2 blocks / fallback-source 2 / error 0`
  - immediate batch: `1 group / 1 fragment / text / 272 chars / 264 est. prompt tokens / 2,149 ms provider latency / 2,148 ms background-provider / 1 ms bridge`

Interpretation:
- The current pipeline is materially stable on structure:
  - all 3 runs preserved math, fallback images, and media images exactly.
- The HTML lane is now much more stable on throughput than the earlier samples:
  - all 3 runs stayed split-free
  - request count is now fixed at `15`
  - token and cost spread is very small
- The remaining quality caveat is now visible instead of hidden:
  - all 3 runs finished as `completed_with_warnings`
  - sampled English residual is still `0`
  - but `protectedMarkerFallbackFragments` stayed at `1 -> 2`
  - warning blocks stayed at `1 -> 2`
- The remaining instability is now clearly background/provider-side on the first request, not payload-side and not content/background bridge-side:
  - all 3 runs used the same immediate batch shape
  - `1 group / 1 fragment / text / 272 chars / 264 est. prompt tokens`
  - the visible spread tracks the first provider round-trip closely: `2.15s -> 2.59s`
  - the content/background bridge overhead remained effectively negligible: `0ms -> 1ms`
- Full completion remains much better than the old durable baseline and now sits in the low-30s range on the median.

Baseline decision:
- Keep the current durable baseline in [representation-theory.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json) for now.
- Do not promote the repeated-run median into the durable baseline yet.
- Reason:
  - the current baseline still represents the best exact-count production run
  - the new sample proves that split-driven outliers are now largely gone
  - but the remaining `protectedMarkerFallbackFragments` keep the HTML lane in `completed_with_warnings`, so a new durable baseline should wait until those warnings are reduced or explicitly accepted

What this means for next work:
- The HTML lane is structurally stable enough to optimize further without losing confidence.
- The next HTML task should focus on reducing `protectedMarkerFallbackFragments` and warning blocks before any further speed tuning.
- Candidate directions:
  - inspect the exact protected-marker fragment shape that still falls back on Wikipedia
  - reduce fallback frequency without reintroducing split-driven outliers
  - keep the bridge path treated as solved
  - defer further first-request tuning until warnings are lower

Gate status update:
- The new `stability-v9-warning` sample is clean on throughput:
  - first visible median `2,263 ms`
  - full completion median `32,234 ms`
  - requests `15`
  - total tokens `28,947`
  - sampled English residual ratio `0`
  - split median `0`
- Important nuance:
  - the tail is no longer driven by split outliers
  - the remaining caution is warning completion, not batch instability
