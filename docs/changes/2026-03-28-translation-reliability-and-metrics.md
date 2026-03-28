# 2026-03-28: Translation Reliability and Metrics

Summary:
- Added a durable live baseline for full-page translation on Wikipedia.
- Reduced prompt overhead and improved main-content detection.
- Hardened translation against several provider output failure modes.
- Added metrics capture and comparison tooling.

Implemented:
- Shorter provider prompts in [openrouter.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/core/providers/openrouter.ts)
- Stronger main-content root scoring in [blocks.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/core/blocks.ts)
- Batch shrink-and-retry on:
  - output limit
  - fragment-count mismatch
  - invalid payload shape
- Tighter fragment caps and larger output headroom
- Bottom-of-page force flush for remaining lazy groups
- Content-side session snapshot query for stable live polling
- Durable live baseline JSON and comparison output generation

Tests added:
- [provider-fragment-count-recovery.spec.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/provider-fragment-count-recovery.spec.ts)
- [provider-invalid-payload-recovery.spec.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/provider-invalid-payload-recovery.spec.ts)
- [lazy-bottom-flush.spec.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/e2e/lazy-bottom-flush.spec.ts)

Measured result:
- Scenario: `https://en.wikipedia.org/wiki/Representation_theory`
- Provider/model: `openrouter` + `google/gemini-3-flash-preview`
- Full completion: `226,161 ms`
- First visible translation: `84,315 ms`
- Total tokens: `128,072`
- Activity-log verified cost: `$0.224432`
- Peak in-flight requests: `2`

Follow-up:
- Capture immediate-vs-deferred timing separately
- Record recovery counts by failure type
- Reduce request count further on large article pages
