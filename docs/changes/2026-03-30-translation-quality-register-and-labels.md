# 2026-03-30 Translation Quality: Register Lock, Label Roles, and Continuity Hints

## Summary

- Added page-level Japanese register wiring so `style=auto` / `precise` / `source-like` use `である調` and `style=readable` uses `です・ます調`.
- Added fragment roles so short structural labels such as `Remark.` and `Proof.` are translated as labels instead of prose.
- Added continuation hints for split fragments so long paragraphs can preserve sentence flow across batch boundaries.
- Kept the response contract unchanged: providers still return `translations`, while role/register/context are passed only as request hints.

## Main code changes

- `src/content/translation-controller.ts`
  - tracks `pageRegister` in runtime state
  - assigns `fragmentRole` and `precedingContext` per fragment
  - normalizes label output and narrow register drift before restore/apply
- `src/core/providers/openrouter.ts`
  - strengthens prompt instructions for register consistency and label handling
  - includes fragment objects with `r` and `p` hints when needed
- `src/core/html.ts`
  - biases placeholder segmentation toward sentence-like units before packing
- `src/shared/types.ts`
  - extends translation request types with `pageRegister`, `fragmentRoles`, and `precedingContexts`

## Behavioral impact

- `Remark.` / `Proof.` / `Definition.` style fragments are now treated as structural labels and avoid trailing Japanese sentence punctuation.
- Long split fragments carry short preceding context so the provider can continue a single sentence more coherently.
- `quickTranslateSelection()` uses the same page register policy as page translation.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run build`

## Follow-up

- The remaining quality gap is dense inline-math prose where protected-marker fallback can still happen on some runs.
- If that remains visible in live runs, the next step should be fragment-level diagnostics for the last warning block rather than more broad batching changes.
