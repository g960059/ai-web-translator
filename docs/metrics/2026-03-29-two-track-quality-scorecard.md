# Two-Track Quality Scorecard

Date:
2026-03-29 JST

Purpose:
- Keep runtime evaluation split between:
  - a real-page production benchmark
  - smaller high-difficulty fixture benchmarks
- Make quality regressions easier to discuss than “it looked okay in one screenshot”.

Tracks:

## 1. Real-Page Runtime Benchmark

Canonical page:
- `https://en.wikipedia.org/wiki/Representation_theory`

Command:

```bash
npm run test:e2e:live:page -- https://en.wikipedia.org/wiki/Representation_theory
```

Current durable baseline:
- Metrics JSON: [en-wikipedia-org-representation-theory-metrics.json](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/test-results/en-wikipedia-org-representation-theory-metrics.json)
- Note: [2026-03-29-representation-theory-durable-baseline.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-representation-theory-durable-baseline.md)
- Stability sample: [2026-03-29-representation-theory-stability-sample.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-representation-theory-stability-sample.md)

What this track answers:
- Is first readable paint still fast?
- Does full completion stay fast on a long, math-heavy, real Wikipedia page?
- Did request count, tokens, or cost regress?
- Are the coarse structure counts still exact?

Current score:

| Check | Status | Evidence |
| --- | --- | --- |
| First visible translation under `2.5s` | pass | durable best run `1,724 ms`; v5 stability median `1,999 ms` |
| Full completion under `40s` | pass | durable best run `32,627 ms`; v5 stability median `36,105 ms` |
| Request count at or below `15` | pass | `15` |
| Total tokens under `30k` | pass | durable best run `28,323`; v5 stability median `28,428` |
| Coarse structure exact | pass | `129 / 118 / 5` before and after |
| Lead Japanese fluency acceptable | pass | lead sample paragraphs in metrics JSON |

## 2. High-Difficulty Fixture Bench

Command:

```bash
npm run test:quality-bench
```

Fixtures:
- [wikipedia-representation-theory.html](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/fixtures/wikipedia-representation-theory.html)
- [wikipedia-representation-theory-of-finite-groups.html](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/fixtures/wikipedia-representation-theory-of-finite-groups.html)

Tests:
- [wikipedia-fixture.test.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/wikipedia-fixture.test.ts)
- [wikipedia-finite-groups-fixture.test.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/wikipedia-finite-groups-fixture.test.ts)

What this track answers:
- Did formulas survive unchanged?
- Did matrix/cases fallback images survive?
- Did commutative-diagram media stay attached?
- Did link-heavy inline HTML preserve anchors?
- Did protected markers and text-path routing still work together?

Current score:

| Fixture | Focus | Status | Evidence |
| --- | --- | --- | --- |
| `representation_theory` | cases, matrix, commutative diagram, rich inline links | pass | formulas and diagram image preserved |
| `representation_theory_of_finite_groups` | finite-group terminology, matrix formula, equivariant diagram, protected markers | pass | text path and protected markers both observed |

Current durable expectations:
- Real-page benchmark must stay the source of truth for:
  - time
  - token volume
  - cost
  - coarse page preservation
- Fixture benchmarks must stay the source of truth for:
  - difficult math/media preservation
  - complex inline HTML handling
  - structure-sensitive translation paths

Separate compatibility track:
- XHTML/XML documents such as `https://ncatlab.org/nlab/show/Yoneda+lemma`
- Current note: [2026-03-29-yoneda-lemma-xhtml-track.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/2026-03-29-yoneda-lemma-xhtml-track.md)
- Status:
  - XML-safe apply path: pass
  - real Japanese output in the main content: pass
  - throughput still significantly worse than the HTML benchmark: expected and tracked separately
  - current stability sample: `42 requests / 49.3s median full completion / 43.3k median tokens`
