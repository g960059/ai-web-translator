# XHTML Track Note: Yoneda Lemma on nLab

Date:
2026-03-29 JST

Target URL:
`https://ncatlab.org/nlab/show/Yoneda+lemma`

Purpose:
- Track the dedicated XHTML/XML lane separately from the main HTML durable baseline.
- Record the first successful XML-safe apply path on a real page.
- Keep the XHTML lane visible without mixing its numbers into the HTML baseline.
- Track stability on a real XHTML page now that the XML-safe apply path is working.

Execution:
- Provider: `openrouter`
- Model: `google/gemini-3.1-flash-lite-preview`
- Scope: `page`
- Target language: `ja`
- Style: `auto`
- Cache: `false`
- Harness: [run-live-page-metrics.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/run-live-page-metrics.mjs)
- Metrics JSON: [ncatlab-org-yoneda-lemma-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/ncatlab-org-yoneda-lemma-metrics.json)
- Screenshot: [ncatlab-org-yoneda-lemma-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/ncatlab-org-yoneda-lemma-translated.png)
- Stability harness: [run-live-page-stability.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/run-live-page-stability.mjs)
- Stability summary: [ncatlab-org-yoneda-lemma-yoneda-stability-v1-summary.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/ncatlab-org-yoneda-lemma-yoneda-stability-v1-summary.json)

Outcome:
- The page now completes instead of failing on XHTML/XML insertion.
- Final session state: `completed`
- Display state: `translated`
- Progress: `100%`
- Retry count: `0`
- Batch splits: `0`
- Fragment splits: `0`

Timing:
- First visible translation: `3,100 ms`
- Full completion: `49,716 ms`

Usage:
- Request count: `42`
- Prompt tokens: `22,555`
- Completion tokens: `20,537`
- Total tokens: `43,092`
- Harness-estimated cost: `$0.03644425`

Quality notes:
- Sample paragraphs in the metrics JSON show real Japanese output in the main content, not just unchanged English.
- Coarse math/media counters are not useful on this page because the page is not math-image heavy in the same Wikipedia sense.
- This page is primarily a compatibility and XHTML-lane throughput benchmark, not the main cost baseline.

Interpretation:
- XHTML/XML compatibility is no longer a known blocker.
- The dedicated XML-safe apply path works on a real page.
- The remaining issue is throughput:
  - request count is still high
  - lazy-visible and deferred dominate total time
  - the first visible request is not the main bottleneck

Stability sample across 3 runs:
- First visible translation median: `2,439 ms`
- Full completion median: `49,349 ms`
- Request count median: `42`
- Total tokens median: `43,317`
- Estimated cost median: `$0.03677925`
- Immediate provider latency median: `2,382 ms`

Stability spread:
- First visible translation: `1,737 ms -> 3,392 ms`
- Full completion: `44,462 ms -> 53,604 ms`
- Total tokens: `41,980 -> 43,454`
- Estimated cost: `$0.03567 -> $0.03697725`
- Immediate provider latency: `1,683 ms -> 3,333 ms`

What the stability sample shows:
- Like the HTML benchmark, the content/background bridge overhead is negligible:
  - `bridgeLatencyMs` stayed at `0-1 ms`
- Unlike the HTML benchmark, XHTML is still dominated by total request volume:
  - `42` requests vs `15` on the HTML durable benchmark
  - `lazyVisible 20 + deferred 21` dominate the run
- So the next XHTML optimization target is clustering and batching, not first-request shrinkage.

How to use this track:
- Use the HTML durable baseline on `Representation_theory` for the main production benchmark.
- Use this XHTML note to confirm:
  - the XML-safe path still works
  - XHTML pages still translate real content
  - XHTML-specific batching changes do not regress completion time

Next target for the XHTML lane:
- Keep `batchSplits = 0`
- Reduce full completion from the current `44s-54s` band toward the `35s-40s` range
- Reduce request count from `42` toward the low `30s`
- Avoid regressing the current HTML durable baseline while doing so

Latest experimental note:
- A later XHTML-specific clustering and batching pass reduced the latest observed live run to:
  - first visible `1,467 ms`
  - full completion `42,151 ms`
  - `25` requests
  - `44,314` total tokens
  - estimated cost `$0.03824475`
- That run still produced `2` plain-html batch splits, so it is not promoted to a durable XHTML baseline yet.
- Interpretation:
  - XHTML throughput clearly improved versus the original `42 requests / ~49s` track
  - the remaining work is to keep the lower request count while driving `batchSplits` back to `0`

Latest wrapped-placeholder experiment:
- After enabling raw MathML protection and wrapped placeholder-rich text for safe XHTML paragraphs, the latest live run reached:
  - first visible `3,008 ms`
  - full completion `73,250 ms`
  - `13` requests
  - `16,219` total tokens
  - estimated cost `$0.0145885`
- The new split shape is now:
  - `2` batch splits
  - both are `html + marked + 5+ items`
- This means the change successfully collapsed request volume and token cost, but it did not yet solve the hardest marked-HTML lane.
- Quality is mixed:
  - the second sampled body paragraph is translated into Japanese
  - the opening Yoneda paragraph is still left in English
  - later definition/theorem text also still shows English in the sample
- Interpretation:
  - wrapped placeholder routing is promising for XHTML cost and request count
  - but the remaining marked-HTML batches are now the dominant correctness risk
  - next XHTML work should target those marked-HTML groups directly before promoting a new XHTML baseline
