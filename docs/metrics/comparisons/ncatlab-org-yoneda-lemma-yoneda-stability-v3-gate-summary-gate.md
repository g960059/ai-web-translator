# Stability Gate Evaluation

Summary: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/ncatlab-org-yoneda-lemma-yoneda-stability-v3-gate-summary.json`
Gate: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/gates/yoneda-lemma-xhtml-stability.json`

Scenario:
- Gate ID: `yoneda-lemma-xhtml-stability`
- URL: `https://ncatlab.org/nlab/show/Yoneda+lemma`
- Model: `google/gemini-3.1-flash-lite-preview`
- Runs: `3`

Overall result: **fail**

| Check | Actual | Threshold | Result |
| --- | --- | --- | --- |
| Median first visible stays under 4s | 5270 | <= 4000 | fail |
| Median full completion stays under 35s | 28876 | <= 35000 | pass |
| Median request count stays at or below 5 | 5 | <= 5 | pass |
| Median total tokens stay under 13k | 12033 | <= 13000 | pass |
| Sampled English residual ratio stays at zero | 0 | <= 0 | pass |
| Source fragment fallback stays at zero | 0 | <= 0 | pass |
| Protected marker fallback stays low | 1 | <= 1 | pass |

Generated at: 2026-03-29T12:02:12.153Z

