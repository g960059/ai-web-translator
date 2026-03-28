# Live Translation Baseline: Representation Theory

Date:
2026-03-28 14:01:11 JST

Target URL:
`https://en.wikipedia.org/wiki/Representation_theory`

Execution:
- Provider: `openrouter`
- Model: `google/gemini-3-flash-preview`
- Scope: `page` (`translateFullPage: true`)
- Target language: `ja`
- Style: `auto`
- Cache: `false`
- Harness: [tests/e2e/run-live-page-metrics.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/run-live-page-metrics.mjs)
- Metrics JSON: [en-wikipedia-org-representation-theory-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-metrics.json)
- Screenshot: [en-wikipedia-org-representation-theory-translated.png](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-translated.png)

Outcome:
- Full-page translation completed successfully
- Final session state: `completed`
- Display state: `translated`
- Progress: `100%`

Timing:
- First visible translation: `84,315 ms` (`84.3 s`)
- Full completion: `226,161 ms` (`226.2 s`, about `3m 46.2s`)

Usage:
- Request count: `57`
- Prompt tokens: `63,908`
- Completion tokens: `64,164`
- Total tokens: `128,072`
- Activity-log verified cost: `$0.224432`
- Harness-estimated cost from model pricing: `$0.224446`

Concurrency:
- Code-level concurrency envelope in this build:
  - Immediate batches: up to `3`
  - Deferred batches: up to `4`
- Conservative path for HTML-heavy or large-item batches:
  - Immediate: `2`
  - Deferred: `2`
- Actual peak in-flight OpenRouter requests observed in this run: `2`
- This matches the conservative HTML-heavy path for this page.

Important context:
- This page needed multiple robustness fixes before a successful full-page baseline was possible.
- Failures observed and addressed before the successful run:
  - Provider returned fewer translations than requested
  - Provider returned an invalid translations payload
  - Provider hit `finish_reason=length`
  - Full-page lazy translation stalled at `89%`
  - Metrics harness polling was unstable when it depended on background-session messaging

Fixes that were in place for the successful run:
- Provider prompt was shortened to reduce repeated per-batch overhead.
- Main-content detection was strengthened.
- Fragment caps were tightened:
  - Text fragment cap: `420 chars`
  - HTML fragment cap: `680 chars`
- Output headroom was increased:
  - `max_tokens` headroom: `1.45`
  - `max_tokens` cap: `7000`
- Batch recovery now shrinks and retries on:
  - output-limit failures
  - fragment-count mismatch
  - invalid translations payload
- Lazy full-page translation now force-flushes remaining groups when the page reaches the bottom.
- Metrics polling now reads session state from the content script directly instead of background self-messaging.

OpenRouter activity log verification:
- Verified against local CSV: `openrouter_activity_2026-03-28 (2).csv`
- Matching the exact `generatedAt - toFullCompletion .. generatedAt` window missed the first two requests because the CSV uses request-creation time.
- Expanding the matching window by `±2s` produced an exact match with the harness totals:
  - `57` calls
  - `63,908` prompt tokens
  - `64,164` completion tokens
  - `$0.224432` total cost

Interpretation:
- The run is stable enough to use as a baseline, but it is still expensive and slow for a single long Wikipedia article.
- The largest remaining issues are total request count (`57`) and total token volume (`128,072`), not startup stability.

Next metrics worth adding:
- Time spent in immediate phase vs deferred phase
- Number of recovered batches by failure type
- Number of groups force-flushed at page bottom
