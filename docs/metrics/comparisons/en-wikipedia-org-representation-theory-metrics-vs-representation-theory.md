# Live Metrics Comparison

Baseline: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/baselines/representation-theory.json`
Candidate: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-metrics.json`

Scenario:
- URL: `https://en.wikipedia.org/wiki/Representation_theory`
- Provider: `openrouter`
- Model: `google/gemini-3.1-flash-lite-preview`
- Scope: `page`

| Metric | Baseline | Candidate | Delta | Delta % | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- |
| Request count | 17 | 17 | 0 | 0.00% | no change |
| Prompt tokens | 18079 | 18079 | 0 | 0.00% | no change |
| Completion tokens | 17962 | 17962 | 0 | 0.00% | no change |
| Total tokens | 36041 | 36041 | 0 | 0.00% | no change |
| Time to first visible translation (ms) | 2428 | 2428 | 0 | 0.00% | no change |
| Time to full completion (ms) | 50373 | 50373 | 0 | 0.00% | no change |
| Peak in-flight requests | 3 | 3 | 0 | 0.00% | no change |
| Cost (USD) | $0.031463 | $0.031463 | $0.000000 | 0.00% | no change |
| Immediate phase complete (ms) | 0 | 2370 | +2370 | n/a | regressed |
| Lazy-visible phase complete (ms) | 0 | 13120 | +13120 | n/a | regressed |
| Retry count | 0 | 0 | 0 | n/a | no change |
| Batch splits | 0 | 0 | 0 | n/a | no change |
| Fragment splits | 0 | 0 | 0 | n/a | no change |
| Persistent cache hits | 0 | 0 | 0 | n/a | no change |
| Cache misses | 0 | 259 | +259 | n/a | regressed |
| Immediate requests | 0 | 1 | +1 | n/a | regressed |
| Lazy-visible requests | 0 | 4 | +4 | n/a | regressed |
| Deferred requests | 0 | 12 | +12 | n/a | regressed |

Cost source:
- Baseline: `metrics-json`
- Candidate: `metrics-json`

Generated at: 2026-03-28T14:08:37.852Z

