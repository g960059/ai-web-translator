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

## Decision

**Original prompt retained.** No prompt changes adopted.

Token savings from shortening do not compensate for:
- Heading structure corruption (A, B)
- Terminology errors (B)
- Evaluator disagreement indicating instability (B)

## Future Considerations

- Add `p=preceding context (do NOT re-translate p content)` to reduce duplicate translation (Opus Issue 3 finding)
- Fix See also LI items being filtered by short-ASCII boilerplate check
- Consider re-testing Candidate C with fixed eval pipeline
