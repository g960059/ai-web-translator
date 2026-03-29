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
  - first visible `2,460 ms`
  - full completion `30,693 ms`
  - `10` requests
  - `14,555` total tokens
  - estimated cost `$0.01286875`
- The new split shape is now:
  - `1` batch split
  - it is now `html + plain + 5+ items`
- This means the wrapped-placeholder path successfully collapsed request volume and token cost, and it removed the earlier marked-HTML bottleneck from the lead paragraph.
- Quality is now improved but still incomplete:
  - the opening Yoneda paragraph is translated into Japanese
  - the second sampled body paragraph is translated into Japanese
  - later definition/theorem text in the sampled output is still English
- Interpretation:
  - wrapped placeholder routing is now the correct generic direction for XHTML inline-rich paragraphs
  - the remaining XHTML problem has narrowed to a smaller plain-html wrapper lane
  - next XHTML work should target structured theorem/definition wrappers before promoting a new XHTML baseline

Latest structured-wrapper pass:
- After generalizing wrapped placeholder routing to safe XHTML theorem/definition/proof wrappers and splitting structured placeholder content at top-level block boundaries, the latest live run reached:
  - first visible `1,955 ms`
  - full completion `26,263 ms`
  - `8` requests
  - `12,483` total tokens
  - estimated cost `$0.011067`
  - `batchSplits = 0`
- Interpretation:
  - generic structured-wrapper routing is now materially faster and cheaper than the previous XHTML lane
  - the XHTML throughput problem is largely solved
  - the remaining XHTML issue is quality completeness in later theorem/definition wrappers, not request volume
  - this is why the XHTML track is still not promoted to a durable baseline despite the much better speed/cost numbers

Latest generic wrapper-source fix:
- After switching generic structured XHTML wrappers to request construction from safe wrapper `outerHTML`, while restoring only the translated inner content, and after scoping protected-marker restoration to the markers actually present in each fragment, the latest live run reached:
  - first visible `5,228 ms`
  - full completion `38,037 ms`
  - `9` requests
  - `14,392` total tokens
  - estimated cost `$0.01260675`
  - `batchSplits = 1`
- Quality result:
  - the lead Yoneda paragraph is translated
  - the second explanatory body paragraph is translated
  - later definition/theorem/proof sampled content is also translated into Japanese instead of silently falling back to English
- Interpretation:
  - the earlier XHTML completeness bug was not a page-specific extraction issue
  - it was a generic wrapper-source mismatch plus over-broad protected-marker fallback
  - generic XHTML theorem/definition/proof wrappers now route through the text/placeholder lane and complete with Japanese output
  - the remaining XHTML work is back to throughput polish, especially eliminating the last occasional `plain html / 5+ items` split

Latest marked-text lane pass:
- After moving safe XHTML inline-rich paragraphs onto the same generic placeholder lane and then capping only multi-fragment marked-text XHTML batches, the latest live run reached:
  - first visible `3,132 ms`
  - full completion `56,302 ms`
  - `6` requests
  - `17,757` total tokens
  - estimated cost `$0.01637425`
  - `batchSplits = 0`
- Quality result:
  - lead and explanatory paragraphs remain translated
  - definition text remains translated
  - later theorem/proof wrappers remain translated
- Interpretation:
  - the remaining XHTML split is no longer structural
  - generic marker-aware batching can keep the XHTML lane split-free without reintroducing the earlier English fallback
  - the remaining XHTML problem is runtime variance, especially transient provider delay/retry, not generic wrapper routing
