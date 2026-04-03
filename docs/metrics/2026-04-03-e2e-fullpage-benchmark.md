# 2026-04-03: E2E Full-Page Translation Benchmark (Corrected)

## Overview

3モデルで Wikipedia 数学記事2ページのフルページ翻訳を **実際の Chrome 拡張パイプライン経由** (Playwright E2E) で実施。MathML annotation テキスト除去後の正しいサンプルで Claude Opus (subagent) と Codex CLI で流暢性評価。

## Models

| Model | Pricing (prompt/completion per 1M tokens) |
|-------|:---:|
| google/gemma-4-31b-it | $0.14 / $0.40 |
| google/gemini-3.1-flash-lite-preview | $0.25 / $1.50 |
| qwen/qwen3.5-35b-a3b | $0.16 / $1.30 |

## Fluency Evaluation

### Combined (Opus + Codex) / 2

| Rank | Model | Opus | Codex | **Combined** | Time (avg) | Cost/page |
|:----:|-------|:----:|:-----:|:------------:|:----------:|:---------:|
| 1 | **gemini-3.1-flash-lite** | 8.5 | 8.5 | **8.5** | **83s** | $0.023 |
| 2 | qwen3.5-35b-a3b | 8.5 | 7.5 | 8.0 | 92s | $0.014 |
| 3 | gemma-4-31b-it | 8.5 | 7.0 | 7.75 | 100s | $0.009 |

### Per-Page Scores

| Model | finite-groups (Opus/Codex) | rep-theory (Opus/Codex) |
|-------|:---:|:---:|
| gemma-4 | 8 / 7 | 9 / 7 |
| gemini-flash-lite | 8 / **9** | 9 / 8 |
| qwen3.5 | 8 / 7 | 9 / 8 |

## Performance

| Model | Page | Time | Translated | Coverage | Marker Recovery | Splits | Retries |
|-------|------|:----:|:----------:|:--------:|:---------------:|:------:|:-------:|
| gemma-4 | finite-groups | 143.8s | 321/440 | 73% | 6 | 2 | 2 |
| **gemini-flash-lite** | finite-groups | **110.7s** | 322/441 | 73% | 6 | 1 | 1 |
| qwen3.5 | finite-groups | 124.7s | 322/441 | 73% | **4** | **0** | **0** |
| gemma-4 | rep-theory | 56.8s | 126/406 | 31% | 3 | 0 | 0 |
| **gemini-flash-lite** | rep-theory | **56.1s** | 126/407 | 31% | 3 | 0 | 0 |
| qwen3.5 | rep-theory | 59.6s | 126/407 | 31% | **2** | **0** | **0** |

## Methodology Note

初回ベンチマークでは `el.textContent` が CSS `display:none` の MathML annotation テキスト (`{\displaystyle ...}`) を含んでいたため、全モデル 5/10 の偽低スコアが出た。annotation 要素を除去してから textContent を取得するように修正し、正しいスコア (7.75-8.5) を得た。

## Key Findings

1. **gemini-flash-lite が総合最適**: 品質最高 (8.5)、最速 (83s avg)、安定性高い
2. **qwen3.5 が意外に優秀**: パイプライン経由で完全安定 (0 retries, 0 splits)、品質 8.0
3. **3モデル間の差は小さい** (7.75-8.5): 品質天井はパイプラインのエッジケース処理
4. **パイプライン改善の効果大**: 前回評価 (2026-03, flash-lite 7.0) → 今回 8.5
5. **残存課題**: 「表現of」英語残存 (全モデル共通)、gemma-4 括弧処理バグ、rep-theory 31% coverage

## vs Previous Evaluations

| Date | Method | flash-lite Score | Notes |
|------|--------|:---:|------|
| 2026-03-30 | Standalone API | 7.0 | Pipeline ceiling diagnosis |
| 2026-04-03 | Standalone API | 8.0 | Prompt/marker improvements |
| 2026-04-03 | E2E (bug) | 5.0 | textContent annotation leak |
| **2026-04-03** | **E2E (corrected)** | **8.5** | **Actual pipeline quality** |
