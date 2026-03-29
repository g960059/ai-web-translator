# Live Metrics Comparison

Baseline: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory-2026-03-28-phase1.json`
Candidate: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-metrics.json`

Scenario:
- URL: `https://en.wikipedia.org/wiki/Representation_theory`
- Provider: `openrouter`
- Model: `google/gemini-3.1-flash-lite-preview`
- Scope: `page`

| Metric | Baseline | Candidate | Delta | Delta % | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- |
| Request count | 17 | 15 | -2 | -11.76% | improved |
| Prompt tokens | 18079 | 14163 | -3916 | -21.66% | improved |
| Completion tokens | 17962 | 14160 | -3802 | -21.17% | improved |
| Total tokens | 36041 | 28323 | -7718 | -21.41% | improved |
| Time to first visible translation (ms) | 2428 | 1724 | -704 | -29.00% | improved |
| Time to full completion (ms) | 50373 | 32627 | -17746 | -35.23% | improved |
| Peak in-flight requests | 3 | 5 | +2 | +66.67% | higher |
| Cost (USD) | $0.031463 | $0.024781 | -$0.006682 | -21.23% | improved |
| Immediate phase complete (ms) | 0 | 1659 | +1659 | n/a | regressed |
| Lazy-visible phase complete (ms) | 0 | 16015 | +16015 | n/a | regressed |
| Retry count | 0 | 0 | 0 | n/a | no change |
| Batch splits | 0 | 0 | 0 | n/a | no change |
| Fragment splits | 0 | 0 | 0 | n/a | no change |
| Persistent cache hits | 0 | 0 | 0 | n/a | no change |
| Cache misses | 0 | 241 | +241 | n/a | regressed |
| Immediate requests | 0 | 1 | +1 | n/a | regressed |
| Lazy-visible requests | 0 | 5 | +5 | n/a | regressed |
| Deferred requests | 0 | 9 | +9 | n/a | regressed |

Cost source:
- Baseline: `metrics-json`
- Candidate: `metrics-json`

Generated at: 2026-03-29T02:54:59.369Z
