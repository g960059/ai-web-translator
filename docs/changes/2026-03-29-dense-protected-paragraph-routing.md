# 2026-03-29 Dense Protected Paragraph Routing

## Summary

- inline math / protected marker が密な paragraph は、placeholder-rich text を無条件に優先せず、runtime で HTML lane に戻せるようにした。
- protected marker が多い paragraph では segment 内の marker 密度もさらに下げた。
- これにより `Representation_theory` の 3-run stability sample で、warning block は `0, 1, 1` まで下がり、1 run は `completed` で終わるようになった。

## What Changed

- `src/content/translation-controller.ts`
  - `buildHtmlPlaceholderFragments()` で protected marker 数と placeholder tag 数を見て、dense paragraph は placeholder path を捨てて HTML lane に戻すようにした。
  - 現在の heuristic は generic で、特定ページ名には依存しない。
- `src/core/html.ts`
  - protected-marker dense placeholder text は segment 内 marker 数をさらに絞る。
  - very-dense な paragraph では `1 marker / segment` まで落とす。
- `tests/html.test.ts`
  - marker-heavy paragraph と very-dense paragraph の segment 密度回帰を追加した。

## Validation

- `npx vitest run tests/html.test.ts tests/openrouter.test.ts tests/translation-controller.test.ts`
- `npm run metrics:stability -- https://en.wikipedia.org/wiki/Representation_theory --runs 3 --label stability-v10-protected`

## Result

- `Representation_theory` の `stability-v10-protected` sample:
  - median `toFirstVisible = 2,340 ms`
  - median `toFullCompletion = 33,837 ms`
  - median `totalTokens = 28,969`
  - `batchSplits = 0` across all 3 runs
  - `englishResidualRatio = 0` across all 3 runs
  - `protectedMarkerFallbackFragments = 0, 1, 1`
  - `warningBlocks = 0, 1, 1`
- 残る warning は 1 paragraph に収束していて、以前の複数 warning block よりかなり小さくなった。
