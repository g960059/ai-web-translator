# 2026-03-29 Protected Marker Warning Carryover

## Summary

- Protected-marker fallback が batch をまたいだときでも warning として残るようにした。
- Protected marker を含む placeholder-rich paragraph は、generic max より小さい soft cap で先に分割するようにした。
- これにより `completed_with_warnings` が本当に未解決 block を反映するようになった。

## What Changed

- `src/content/translation-controller.ts`
  - batch 内だけで持っていた fallback warning を session 内の pending map に持ち上げた。
  - 先の batch で protected marker fallback が起き、後の batch で group が完成する場合でも `fallback-source` warning を残す。
- `src/core/html.ts`
  - protected marker を含む placeholder-rich text は `240 chars` の soft cap で先に分割する。
  - marker の前後に長い prose があるときも sentence/chunk 単位で分割できるようにした。
- `tests/html.test.ts`
  - protected-marker placeholder の soft cap 分割を固定。
- `tests/translation-controller.test.ts`
  - protected-marker fallback warning が later batch completion でも消えないことを固定。

## Validation

- `npx vitest run tests/html.test.ts tests/translation-controller.test.ts`
- `npm run build`
- `node tests/e2e/run-live-page-metrics.mjs https://en.wikipedia.org/wiki/Representation_theory`

## Result

- live では `warningStats` と `completed_with_warnings` が再び一致するようになった。
- 直近 run では still `fallback-source` block が 1 件残るが、以前のように silent success にはならない。
- 次は protected-marker fallback 自体を減らすことが本命で、その前に warning semantics の整合性は回復した。
