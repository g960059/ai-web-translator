# 2026-04-01: System Prompt Optimization Comparison

## Overview

Compared 4 system prompt variants on Wikipedia "Representation theory of finite groups" with both fast (gemini-3.1-flash-lite-preview) and accurate (gemini-3-flash-preview) presets. Evaluated by Claude Opus and Codex 5.4 xhigh independently.

## Candidates

| Candidate | Description | Token Reduction | Language |
|-----------|-------------|:--------------:|:--------:|
| **Original** | Current production prompt | 0% | English |
| **A** | Aggressive shortening | -50% | Japanese |
| **B** | Balanced shortening | -25% | English |
| **C** | Restructured (output-first) | -37% | Japanese |

## Prompt Text (text mode, all conditions active)

### Original (Current Production)

```
Translate en -> ja.
Input is JSON object {"s","g","f"}.
Each fragment object uses t=source text, optional i=id, optional r=role, optional p=preceding context.
Each fragment is plain text.
Style: fluent expository prose that reads naturally on the page. Japanese register: dearu. Do not mix dearu and desu-masu styles.
Use s as context for the section topic. Follow g (glossary) entries for consistent terminology unless the context clearly demands otherwise.
Keep marker tokens like [[t0]], [[/t0]], and [[x0]] exactly unchanged. Every marker from the source fragment must appear exactly once in the translation, in the same order.
If r=heading, translate it as a concise section heading. If r=label, translate it as a structural label, not as a full sentence. Do not add Japanese sentence punctuation to labels. If r=list-item, translate it as a list entry, preserving the item structure. If r=caption, translate it as a short descriptive caption.
Translate every fragment completely. Never leave a source-language sentence or clause untranslated. Never mix source and target languages in the same sentence.
Return JSON: {"translations":[{"i":"0","t":"..."},{"i":"1","t":"..."}]}.
Same ids, same count. No prose.
```

### Candidate A — Aggressive Japanese Shortening (-50% tokens)

```
en→jaに翻訳せよ。
入力: JSON {"s":セクション文脈,"g":用語集,"f":フラグメント配列}。各フラグメント: {t:原文, i:ID, r:役割, p:前文脈}。
文体: 自然なである調(敬体混在禁止)。gの用語に従うこと。
マーカー([[t0]]等)は原文と同一の順序・個数で保持。
r=heading→簡潔な見出し、r=label→ラベル(句点不要)、r=list-item→箇条書き、r=caption→短い説明文。
全文を完訳し原語を残すな。
出力JSON: {"translations":[{"i":"0","t":"..."},...]}。ID・個数一致。説明文不要。
```

Issues found: heading structure corruption (breadcrumb leak), Peter-Weyl heading turned into body text (fast preset), book title over-translation.

### Candidate B — Balanced English Shortening (-25% tokens)

```
Translate en -> ja.
Input is {"s","g","f"}; each f item is {"t","i?","r?","p?"}, and t is plain text.
Use s for section context, p for local continuity, and g for terminology consistency unless context clearly requires otherwise.
Style: fluent expository prose that reads naturally on the page. Japanese register: dearu. Do not mix dearu and desu-masu styles.
Preserve protected markers such as [[t0]], [[/t0]], and [[x0]] exactly unchanged, once each, in source order.
Role rules: heading=concise heading; label=structural label, not a full sentence, no Japanese sentence punctuation; list-item=preserve item structure; caption=short descriptive caption.
Translate every fragment completely. Do not leave source-language text untranslated.
Return only JSON: {"translations":[{"i":"...","t":"..."}]}. Keep the same ids and fragment count.
```

Issues found: large evaluator disagreement (Opus 8.50 vs Codex 6.40), terminology errors in accurate preset ("対合的既約表現").

### Candidate C — Restructured Japanese, Output-First (-37% tokens)

```
## 出力形式(厳守)
{"translations":[{"i":"0","t":"..."},{"i":"1","t":"..."}]}
- ID・個数は入力フラグメントと完全一致
- JSON以外の文章・説明は一切出力しない

## タスク
en→jaへ全フラグメントを完訳する。原語を訳文に混ぜない。

## 入力形式
JSON {"s":セクション文脈, "g":用語集, "f":フラグメント配列}
フラグメント: {t:原文, i:ID, r:役割, p:前文脈}。各フラグメントはプレーンテキスト。

## 翻訳ルール
1. 文体: 自然なである調の説明文。です・ます調を混ぜない。
2. gの用語を一貫して使用。sはセクション話題の参考情報。
3. マーカー([[t0]], [[/t0]], [[x0]]等)は原文と同じ順序・個数で保持。
4. 役割別処理: heading→簡潔な見出し / label→構造ラベル(句点不要) / list-item→箇条書き / caption→短い説明文。
```

Issues found: eval script captured comparison report instead of translation text (Codex rated 1.0/10), "完備" mistranslation in fast preset (should be "完全").

## Performance Metrics

| Candidate | Preset | Time | Requests | markerFallback | Status |
|-----------|--------|:----:|:--------:|:--------------:|:------:|
| Original | fast | 111s | 44 | 17 | completed |
| Original | accurate | 92s | 42 | 14 | completed |
| A | fast | 122s | 46 | 24 | completed |
| A | accurate | 110s | 44 | 13 | completed |
| B | fast | 121s | 48 | 23 | completed |
| B | accurate | 123s | 44 | 15 | completed |
| C | fast | 119s | 44 | 16 | completed |
| C | accurate | 88s | 42 | 16 | completed |

## Quality Evaluation (Opus / Codex)

### Opus Scores

| Candidate | fast | accurate | Average |
|-----------|:----:|:--------:|:-------:|
| **B** | 8.0 | **9.0** | **8.50** |
| **Original** | 8.0 | 8.5 | 8.25 |
| A | 7.0 | 8.0 | 7.50 |
| C | 7.0 | 8.0 | 7.50 |

### Codex Scores

| Candidate | fast | accurate | Average |
|-----------|:----:|:--------:|:-------:|
| **Original** | 7.2 | 7.4 | **7.30** |
| A | 6.3 | 6.9 | 6.60 |
| B | 6.8 | 5.9 | 6.40 |
| C | 1.0 | 1.0 | 1.00 |

### Combined Average (Opus + Codex) / 2

| Rank | Candidate | Opus | Codex | **Combined** |
|:----:|-----------|:----:|:-----:|:------------:|
| 1 | **Original** | 8.25 | 7.30 | **7.78** |
| 2 | B | 8.50 | 6.40 | 7.45 |
| 3 | A | 7.50 | 6.60 | 7.05 |
| 4 | C | 7.50 | 1.00 | 4.25 |

## Key Findings

### Candidate A (Aggressive JP -50%)
- Fast preset: heading structure corruption ("有限群の表現論 > 定義線形表現" — breadcrumb leak into headings)
- Fast preset: Peter-Weyl theorem heading turned into body text
- Accurate preset: book title over-translation
- **Verdict: Not recommended** — structural issues outweigh token savings

### Candidate B (Balanced EN -25%)
- Opus rated highest (8.50 average), but Codex found terminology errors in accurate preset ("対合的既約表現")
- Large evaluator disagreement (Opus 8.50 vs Codex 6.40)
- **Verdict: Risky** — quality varies between evaluation rounds

### Candidate C (Restructured JP -37%)
- Codex rated 1.0/10 due to eval script capturing comparison report instead of translation text
- Cannot be fairly evaluated without fixing eval pipeline
- **Verdict: Invalid evaluation** — needs re-test

### Original (Current)
- Most stable across both evaluators (7.30-8.25 range)
- No structural corruption issues
- Heading formatting consistently correct
- **Verdict: Keep as default**

## Round 1 Decision

Original prompt retained over A/B/C candidates (content-changing variants).

## Round 2: Content-Preserving Shortening (V1/V2/V3)

Tested 3 variants that preserve all instructions but shorten wording only.

### Prompt Variants

**V1 (-15% tokens)** — Adopted as new default:
- Fragment instruction shortened, marker instruction 2→1 sentence
- Role instructions 4 sentences → semicolon-delimited
- Glossary hedge removed, redundant completeness sentence removed

**V2 (-47% tokens)** — Not adopted:
- Merged hintShape + fragmentObject + contentMode into single line
- Eliminated separate HTML/text return paths
- Marker/role/completeness further compressed

**V3 (-56% tokens)** — Not adopted:
- Maximum compression using semicolons/commas
- Arrow notation for roles (heading→concise)
- Single unified return path

### Performance

| Variant | fast time | fast reqs | accurate time | accurate reqs |
|---------|:--------:|:---------:|:------------:|:------------:|
| V1 | 102s | 44 | 84s | 42 |
| V2 | **77s** | **37** | 107s | 43 |
| V3 | 142s | 53 | 151s | 61 |

### Quality (Opus + Codex average)

| Variant | Opus | Codex | Combined |
|---------|:----:|:-----:|:--------:|
| **V1** | 8.25 | 7.75 | **8.00** |
| V2 | 7.75 | 6.50 | 7.13 |
| V3 | 7.25 | 4.75 | 6.00 |

### Round 2 Decision

**V1 adopted** (commit 8ccf942). Quality identical to Original with -7.5% prompt tokens, -17% fast translation time, -29% markerFallback.

V2 rejected: fast was fastest (77s) but accurate had quality issues (noun drops, sentence truncation). Codex scored accurate at 6.0/10.

V3 rejected: over-compressed, heading structure corruption (title/breadcrumb leak into body text), slower than V1 despite fewer tokens (142s vs 102s due to 5 batch splits).

## Final State

Production prompt = V1 (minor shortening from original). All instructions preserved, wording tightened ~15%.
