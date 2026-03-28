# ADR 0001: Live Metrics Baseline and Provider-Recovery Strategy

Date:
2026-03-28

Status:
Accepted

Context:
- Full-page live translation against real pages is now an explicit performance and cost target.
- The `Representation theory` Wikipedia page is large enough to expose real failures in batching, lazy completion, and provider output shape drift.
- Recent runs surfaced recurring provider-side failures:
  - fewer translations than requested
  - invalid payload shape
  - `finish_reason=length`
- Full-page lazy translation also stalled on real pages unless remaining groups were force-flushed near the bottom of the document.

Decision:
- Keep a durable live baseline for `https://en.wikipedia.org/wiki/Representation_theory`.
- Store the durable baseline as JSON in [representation-theory.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json).
- Treat these provider failure modes as recoverable by shrinking batches and retrying:
  - output-limit failures
  - fragment-count mismatch
  - invalid translations payload
- Force-flush remaining lazy groups when the page reaches the bottom so full-page translation does not stall indefinitely.
- Measure and compare these baseline metrics on future changes:
  - request count
  - prompt tokens
  - completion tokens
  - total tokens
  - time to first visible translation
  - time to full completion
  - peak in-flight requests
  - cost

Consequences:
- Live metrics are now a first-class regression signal, not an ad hoc check.
- E2E coverage includes recovery paths for provider output drift and lazy bottom-flush behavior.
- Cost from the harness is useful, but OpenRouter activity logs remain the preferred source of truth when available.

Related artifacts:
- Baseline note: [2026-03-28-representation-theory.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-28-representation-theory.md)
- Runbook: [live-full-page-metrics.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/runbook/live-full-page-metrics.md)
- Comparison script: [compare-live-metrics.mjs](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/compare-live-metrics.mjs)
