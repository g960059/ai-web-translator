# Stability Gate Evaluation

Summary: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-stability-v7-gate-summary.json`
Gate: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/gates/representation-theory-stability.json`

Scenario:
- Gate ID: `representation-theory-stability`
- URL: `https://en.wikipedia.org/wiki/Representation_theory`
- Model: `google/gemini-3.1-flash-lite-preview`
- Runs: `3`

Overall result: **pass**

| Check | Actual | Threshold | Result |
| --- | --- | --- | --- |
| Median first visible stays under 2.5s | 2076 | <= 2500 | pass |
| Median full completion stays under 40s | 30801 | <= 40000 | pass |
| Median request count stays at or below 15 | 15 | <= 15 | pass |
| Median total tokens stay under 30k | 29116 | <= 30000 | pass |
| Sampled English residual ratio stays at zero | 0 | <= 0 | pass |
| Source fragment fallback stays at zero | 0 | <= 0 | pass |
| Protected marker fallback stays at zero | 0 | <= 0 | pass |

Generated at: 2026-03-29T11:58:34.973Z

