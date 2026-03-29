# 2026-03-28: Next Phase Plan for Gemini Runtime Quality

Summary:
- The extension now has a durable real-page baseline on `google/gemini-3.1-flash-lite-preview`.
- The next phase should focus on making the default experience production-grade rather than adding new end-user features.
- The work should optimize four things together:
  - first readable paint
  - full-page completion time
  - token/cost efficiency
  - translation consistency and fluency

Why this is still the right next step:
- The current durable baseline is much better than both the pre-optimization run and the earlier optimized run:
  - first visible translation: `98.974s -> 2.273s`
  - full completion: `270.160s -> 39.025s`
  - total tokens: `150,662 -> 28,541`
  - estimated cost: `$0.1308905 -> $0.02485775`
- The remaining weak points are now narrower:
  - first visible still varies around the `2s` line instead of sitting comfortably below it
  - XHTML/XML pages now work, but still have a slower dedicated lane
  - quality review should now be kept durable across both the live page and the high-difficulty fixtures
- That means the product direction is no longer “make it work”.
- It is now “make the default path fast, cheap, stable, and natural”.

Current baseline to optimize from:
- Narrative baseline: [2026-03-29-representation-theory-durable-baseline.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-representation-theory-durable-baseline.md)
- Baseline JSON: [representation-theory.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json)
- Main benchmark page:
  - `https://en.wikipedia.org/wiki/Representation_theory`
- Supporting quality scorecard:
  - [2026-03-29-two-track-quality-scorecard.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-two-track-quality-scorecard.md)

Primary goals:
1. Reduce request count without losing the fast first paint.
2. Reduce total token volume further.
3. Improve completion time on long, math-heavy Wikipedia pages.
4. Make quality checks less subjective and more repeatable.

Execution order:

## 1. Request Count and Scheduling

Focus:
- [translation-controller.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/content/translation-controller.ts)
- [blocks.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/core/blocks.ts)

Work:
- Rebalance `immediate`, `lazy-visible`, and fully deferred work so that:
  - first paint remains fast
  - the queue is less fragmented afterward
- Add a stronger minimum batch floor for tiny fragments.
- Revisit section clustering so related short paragraphs can travel together more often.
- Strengthen fragment cache reuse on follow-up lazy work.

Success criteria:
- Request count on the baseline page: `15 -> 14 or less`
- First visible translation stays under `2s`
- Full completion moves toward `35s` range

## 2. Cost and Token Efficiency

Focus:
- [blocks.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/core/blocks.ts)
- [html.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/core/html.ts)
- [translation-controller.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/content/translation-controller.ts)

Work:
- Push more safe inline-heavy content into text-like translation paths.
- Tighten reader-only pruning for low-value page chrome.
- Keep glossary/context helpful, but trim any repeated prompt overhead that does not improve consistency.

Success criteria:
- Total tokens on the baseline page: `28,541 -> 27,000` range
- Estimated cost on the baseline page: `$0.02485775 -> below $0.024`

## 3. Quality Benchmarks

Focus:
- [tests/wikipedia-fixture.test.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/wikipedia-fixture.test.ts)
- [tests/e2e](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e)
- [docs/metrics](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics)

Work:
- Keep the repeatable quality bench durable on top of the existing real-page benchmark:
  - complex math
  - commutative-diagram media
  - rich HTML preservation
  - terminology consistency
  - Japanese fluency in lead sections
- Keep at least one real-page benchmark and one smaller high-difficulty fixture benchmark in regular use.

Success criteria:
- Quality review becomes comparable across runs, not just narrative.
- Regression checks can answer:
  - “Did it stay structurally correct?”
  - “Did the Japanese stay natural?”
  - “Did terms drift more than before?”

## 4. Widget-First UX Polish

Focus:
- [overlay.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/content/overlay.ts)
- [PopupApp.tsx](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/popup/PopupApp.tsx)

Gate:
- Do not implement this section immediately.
- Before starting item 4, confirm the UI direction with the user:
  - widget state design
  - how much character/animation to keep
  - how aggressive or quiet page prompts should be

Work:
- Keep the page widget as the main control surface.
- Refine state clarity for:
  - working
  - retrying
  - resting
  - cancelled
  - failed
- Reduce cases where selection prompts or passive states feel noisy.
- Keep popup focused on setup, status, and lightweight adjustments.

Success criteria:
- The page itself communicates translation state clearly without needing the popup.
- Long-page translation can be started, understood, and stopped from the widget alone.

## 5. Metrics and Operations

Focus:
- [run-live-page-metrics.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/run-live-page-metrics.mjs)
- [compare-live-metrics.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/compare-live-metrics.mjs)
- [docs/runbook](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/runbook)

Work:
- Extend metrics capture for:
  - phase timings
  - retry counts by failure reason
  - fragment-cache hit ratios
- Keep the docs workflow tight:
  - benchmark
  - compare
  - decide whether the baseline moves
- When OpenRouter activity logs are available, prefer verified cost in durable notes.

Success criteria:
- A future optimization pass can be judged from metrics first, not memory.
- Durable docs remain the source of truth for current baseline and measurement procedure.

What not to prioritize next:
- New providers
- New end-user feature surfaces
- Full i18n
- Broad design rewrites

Reason:
- The highest leverage now is in the existing default path:
  - `openrouter`
  - `google/gemini-3.1-flash-lite-preview`
  - reader-first page translation

Blunt assessment:
- The product is past the “prototype” stage.
- The next win is not more knobs.
- The next win is making the default flow obviously fast, cheap enough, and reliably readable.
