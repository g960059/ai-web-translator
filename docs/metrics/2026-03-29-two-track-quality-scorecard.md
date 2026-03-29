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
- Stability gate report: [en-wikipedia-org-representation-theory-stability-v7-gate-summary-gate.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons/en-wikipedia-org-representation-theory-stability-v7-gate-summary-gate.md)

What this track answers:
- Is first readable paint still fast?
- Does full completion stay fast on a long, math-heavy, real Wikipedia page?
- Did request count, tokens, or cost regress?
- Are the coarse structure counts still exact?
- Did sample paragraphs actually become Japanese?
- Did the runtime have to fall back to source fragments to preserve protected markers?

Current score:

| Check | Status | Evidence |
| --- | --- | --- |
| First visible translation under `2.5s` | pass | durable best run `1,724 ms`; v10 stability median `2,340 ms` |
| Full completion under `40s` | pass | durable best run `32,627 ms`; v10 stability median `33,837 ms` |
| Request count at or below `15` | pass | `15` |
| Total tokens under `30k` | pass | durable best run `28,323`; v10 stability median `28,969` |
| Coarse structure exact | pass | `129 / 118 / 5` before and after |
| Lead Japanese fluency acceptable | pass | lead sample paragraphs in metrics JSON |
| English residual ratio in sampled paragraphs stays low | pass | `pageQuality.after.englishResidualRatio` in metrics JSON |
| Protected/source fallback counts remain explainable | warning | `protectedMarkerFallbackFragments` values `0,1,1`; one run completed cleanly, two runs had `1` warning block in v10 stability sample |
| Warning-aware completion is surfaced | pass | `warningStats` and `completed_with_warnings` now appear in live metrics |
| Stability gate on median | pass | v10 sample stayed split-free across all 3 runs |

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
- XHTML gate report: [ncatlab-org-yoneda-lemma-yoneda-stability-v3-gate-summary-gate.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics/comparisons/ncatlab-org-yoneda-lemma-yoneda-stability-v3-gate-summary-gate.md)
- Status:
  - XML-safe apply path: pass
  - real Japanese output in the lead XHTML content: pass
  - real Japanese output in later theorem/definition/proof wrappers: pass
  - structured-wrapper XHTML routing now reduces request volume and token cost further
  - split-free generic XHTML lane: pass in the latest stability sample
  - sampled English residual ratio: pass (`0` across the latest 3-run sample)
  - source-fragment fallback count: pass (`0` across the latest 3-run sample)
  - XHTML stability gate: fail on first visible only; all other checks pass
  - remaining blocker: runtime variance from immediate provider latency
  - latest XHTML stability median: `5 requests / 29.6s full completion / 12.1k total tokens / 0 splits`
