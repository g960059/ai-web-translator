# 2026-04-03: Full-Page Translation Model Benchmark

## Overview

3モデルで Wikipedia 数学記事2ページのフルページ翻訳を実施し、Claude Opus と Codex CLI で日本語流暢性を評価。

## Models

| Model | Params | Pricing (prompt/completion per 1M tokens) |
|-------|--------|:---:|
| google/gemma-4-31b-it | 31B (26B active, MoE) | $0.14 / $0.40 |
| google/gemini-3.1-flash-lite-preview | — | $0.25 / $1.50 |
| qwen/qwen3.5-35b-a3b | 35B (3B active, MoE) | $0.16 / $1.30 |

## Pages

| Page | URL | Blocks |
|------|-----|:------:|
| rep-theory-finite-groups | https://en.wikipedia.org/wiki/Representation_theory_of_finite_groups | 430 |
| rep-theory | https://en.wikipedia.org/wiki/Representation_theory | 235 |

## Translation Performance

| Model | Page | Blocks | Failed | Time | Requests | Prompt Tokens | Completion Tokens |
|-------|------|:------:|:------:|:----:|:--------:|:-------------:|:-----------------:|
| **gemma-4-31b-it** | finite-groups | 430 | 0 | **554.6s** | 29 | 18,852 | 18,340 |
| **gemini-3.1-flash-lite** | finite-groups | 430 | 60 (14%) | **151.4s** | 29 | 15,554 | 14,338 |
| qwen3.5-35b-a3b | finite-groups | — | **~55% timeout/empty** | — | — | — | — |
| **gemma-4-31b-it** | rep-theory | 235 | 0 | **302.9s** | 16 | 13,978 | 11,513 |
| **gemini-3.1-flash-lite** | rep-theory | 235 | 0 | **90.9s** | 16 | 13,518 | 11,481 |

### Estimated Cost (per page)

| Model | finite-groups | rep-theory |
|-------|:---:|:---:|
| gemma-4 | ~$0.010 | ~$0.007 |
| gemini-flash-lite | ~$0.025 | ~$0.021 |

Gemma 4 は Gemini Flash Lite の **約40%のコスト** で翻訳可能。

## Fluency Evaluation

### Claude Opus (subagent)

| Model | finite-groups | rep-theory | Average |
|-------|:---:|:---:|:---:|
| **gemma-4-31b-it** | **9/10** | **9/10** | **9.0** |
| **gemini-3.1-flash-lite** | 8/10 | 9/10 | 8.5 |

**Opus 評価コメント:**

**Gemma 4 (finite-groups, 9/10):** 全体的に非常に自然な日本語であり、である調で統一されている。専門用語（群準同型、線形表現、標数など）も正確に訳出されている。数式表記もLaTeX形式で適切に処理されている。

**Gemini Flash Lite (finite-groups, 8/10):** 自然な日本語で、である調も統一されている。ただし、数式がプレーンテキスト（VをKベクトル空間、ρ: G → GL(V)）として出力されており、LaTeX記法が欠落している点が減点。

**Gemma 4 (rep-theory, 9/10):** 非常に流暢で読みやすい。教科書品質。「オブジェクト」→「対象」がより適切な場合あり。

**Gemini Flash Lite (rep-theory, 9/10):** 自然で読みやすい。「代数系」「帰着させる」など用語選択が適切。

### Codex CLI (exec --full-auto)

| Model | finite-groups | rep-theory | Average |
|-------|:---:|:---:|:---:|
| **gemma-4-31b-it** | 3/10 | 6/10 | 4.5 |
| **gemini-3.1-flash-lite** | **8/10** | 7/10 | **7.5** |

**Codex 評価コメント:**

**Gemma 4 (finite-groups, 3/10):** 地の文は学術調だが、数式周辺の崩れが頻発。`\rho` や `\text{}` の壊れ、`[[…]]` プレースホルダの残存が目立つ。文12「ρを定義し、ρを次のように定義される…」は日本語自体が破綻。

**Gemini Flash Lite (finite-groups, 8/10):** 全体として自然で読みやすく、最も完成度が高い。細部では直訳調の硬さと表記の揺れが残る。

**Gemma 4 (rep-theory, 6/10):** 平文部分の読みやすさは悪くないが、`[[K]]`, `[[V]]` 等のプレースホルダが未解決のまま残っている。

**Gemini Flash Lite (rep-theory, 7/10):** 概説記事として読みやすいが、変数記号の脱落や「リー環」/「リー代数」の用語揺れがある。

### Combined Average (Opus + Codex) / 2

| Rank | Model | Opus | Codex | **Combined** |
|:----:|-------|:----:|:-----:|:------------:|
| 1 | **gemini-3.1-flash-lite** | 8.5 | 7.5 | **8.0** |
| 2 | **gemma-4-31b-it** | 9.0 | 4.5 | **6.75** |

## Key Findings

### Gemma 4 (31B)
- **地の文の品質は最高**（Opus 9.0/10）— 自然な日本語、正確な専門用語
- **数式処理に致命的な問題** — LaTeX記法の破壊、プレースホルダ残存（Codex 3/10）
- **速度**: 3.6x 遅い（554s vs 151s）が、**コストは 40% 安い**
- **安定性**: 全バッチ成功（0% failure）
- **結論**: 地の文は素晴らしいが、数式処理パイプラインとの互換性に問題。Chrome拡張のマーカー保護が効かない可能性あり。

### Gemini 3.1 Flash Lite (current default)
- **バランスが最も良い** — 速度、品質、安定性のトレードオフが優秀
- **数式をプレーンテキスト化**する傾向あり（LaTeX ではなく Unicode 記号）
- **速度**: 最速（151s / 91s）
- **安定性**: JSON パースエラー 14%（finite-groups）— パラメータ調整で改善可能か
- **結論**: 現行デフォルトとして妥当。

### Qwen 3.5 (35B, 3B active)
- **不安定すぎて評価不能** — タイムアウト + 空レスポンス ~55%
- OpenRouter 経由のインフラ問題の可能性が高い
- **結論**: 現時点では実用不可。パラメータ調整（バッチサイズ縮小、タイムアウト延長）で改善するか要検証。

## Next Steps

1. Gemma 4 の数式処理改善: Chrome拡張パイプラインでの `[[x0]]` マーカー保護との互換性を調査
2. パラメータ調整ベンチマーク: バッチサイズ、max_tokens、concurrency のモデル別最適化（Codex + Opus に方針相談予定）
3. Qwen 3.5 の再評価: バッチサイズ 5、タイムアウト 240s で再テスト
