# XHTML Track Note: Yoneda Lemma on nLab

Date:
2026-03-29 JST

Target URL:
`https://ncatlab.org/nlab/show/Yoneda+lemma`

Purpose:
- Track the dedicated XHTML/XML lane separately from the main HTML durable baseline.
- Record the first successful XML-safe apply path on a real page.
- Keep the XHTML lane visible without mixing its numbers into the HTML baseline.

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

How to use this track:
- Use the HTML durable baseline on `Representation_theory` for the main production benchmark.
- Use this XHTML note to confirm:
  - the XML-safe path still works
  - XHTML pages still translate real content
  - XHTML-specific batching changes do not regress completion time

Next target for the XHTML lane:
- Keep `batchSplits = 0`
- Reduce full completion from `49.7s` toward the `35s-40s` range
- Avoid regressing the current HTML durable baseline while doing so
