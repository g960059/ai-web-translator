# Live Metrics Comparison

Baseline: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-google-gemini-3-1-flash-lite-preview-metrics.json`
Candidate: `/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-gemini-3-1-flash-lite-preview-optimized-2026-03-28-metrics.json`

Scenario:
- URL: `https://en.wikipedia.org/wiki/Representation_theory`
- Provider: `openrouter`
- Model: `google/gemini-3.1-flash-lite-preview`
- Scope: `page`

| Metric | Baseline | Candidate | Delta | Delta % | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- |
| Request count | 82 | 101 | +19 | +23.17% | regressed |
| Prompt tokens | 76082 | 63404 | -12678 | -16.66% | improved |
| Completion tokens | 74580 | 57447 | -17133 | -22.97% | improved |
| Total tokens | 150662 | 120851 | -29811 | -19.79% | improved |
| Time to first visible translation (ms) | 98974 | 3800 | -95174 | -96.16% | improved |
| Time to full completion (ms) | 270160 | 244049 | -26111 | -9.67% | improved |
| Peak in-flight requests | 3 | 2 | -1 | -33.33% | lower |
| Cost (USD) | $0.130890 | $0.102022 | -$0.028869 | -22.06% | improved |

Cost source:
- Baseline: `metrics-json`
- Candidate: `metrics-json`

Generated at: 2026-03-28T08:42:55.657Z

