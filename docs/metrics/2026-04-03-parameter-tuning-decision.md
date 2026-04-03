# 2026-04-03: Parameter Tuning Decision

## Recommendation

Do **not** pursue per-model parameter tuning now.

Keep one global production path and keep `google/gemini-3.1-flash-lite-preview` as the default model. The corrected E2E benchmark shows all three viable models clustered at `7.75-8.5/10`, with `0` fallback and `0` warnings, and the current default already scores highest while also being fastest overall.

## Why

- The remaining quality ceiling looks pipeline-bound, not model-bound.
- The observed defects are shared edge cases such as low `rep-theory` coverage, MathML annotation leakage, and residual English fragments like `表現of`.
- A per-model config layer (`MODEL_PROFILES`, per-model batch/temperature/timeout overrides) would add ongoing complexity for a very small measured upside.
- A `0.75`-point gap is too small to justify that complexity when the default model is already the top performer.

## Better Use Of Time

1. Raise `rep-theory` coverage from `31%`.
2. Eliminate MathML annotation leaks completely.
3. Fix shared residual-English cases such as `表現of`.
4. Spend remaining effort on UI and product polish.

## Revisit Trigger

Revisit per-model tuning only if a future benchmark shows a materially larger gap, or if a new candidate model is competitive enough to challenge the default path.
