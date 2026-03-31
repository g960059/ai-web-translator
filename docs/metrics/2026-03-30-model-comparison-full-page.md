# 2026-03-30: Full-Page Model Comparison — Representation Theory

## Overview

Compared translation quality of 6 models on the full Wikipedia "Representation theory" page using the actual Chrome extension via Playwright. 3 models completed successfully; 3 timed out due to the extension's 30-second per-request limit.

## Test Setup

- **Page**: https://en.wikipedia.org/wiki/Representation_theory
- **Extension**: ai-web-translator with all pipeline improvements (heading dict, boilerplate exemption, etc.)
- **Settings**: targetLanguage=ja, style=auto, translateFullPage=false, cacheEnabled=false
- **Evaluators**: Claude Opus 4.6, Codex 5.4 xhigh (independent blind evaluation)

## Results

### Successful Models

| Model | Time | Requests | Cost/M (comp) | Status | Opus Score | Codex Score | Average |
|-------|------|----------|---------------|--------|-----------|-------------|---------|
| **gemini-3-flash-preview** | 123s | 25 | $3.00 | completed | **9.5** | **8.0** | **8.75** |
| **gemini-3.1-flash-lite-preview** | 49s | 21 | $1.50 | completed | **8.5** | **6.7** | **7.6** |
| gemini-2.5-flash-lite | 55s | 44 | $0.40 | completed_with_warnings | 3.0 | 3.0 | 3.0 |

### Timed Out Models (30s/request limit)

| Model | Cost/M (comp) | Failure Reason |
|-------|---------------|----------------|
| moonshotai/kimi-k2-0905 | $2.00 | OpenRouter request timed out |
| deepseek/deepseek-v3.2 | $0.38 | OpenRouter request timed out |
| meta-llama/llama-4-scout | $0.30 | OpenRouter request timed out |

## Detailed Findings

### gemini-3-flash-preview (Best Quality)

**Strengths:**
- Most natural Japanese academic prose across all models
- である調 perfectly consistent throughout
- All sections translated with no English remnants
- Correct specialized terminology: 箙（えびら）, 淡中・クライン双対性, ハリーシュ＝チャンドラ
- decomposable → 可約（分解可能）/ indecomposable → 直既約 (acceptable with parenthetical clarification)

**Weaknesses:**
- 123 seconds (2.5x slower than baseline)
- $3.00/M completion cost (2x baseline)
- Minor リー代数/リー環 inconsistency in later sections

### gemini-3.1-flash-lite-preview (Best Cost-Performance)

**Strengths:**
- Fastest (49s) and most request-efficient (21 reqs)
- である調 fully consistent
- No untranslated paragraphs
- Good specialized terminology: 冪単群, 田中＝クレイン双対性, 絡み写像

**Weaknesses:**
- decomposable/indecomposable → 可約/既約 (incorrect — these are different concepts from reducible/irreducible)
- リー代数/リー環 inconsistency
- Section heading "直和と既約分解不可能な表現" is unnatural (should be 直和と直既約表現)
- One marker leak: `[[t8]]G[[/t8]]`
- Tr(trace) mistranslated as 指標 in one location

### gemini-2.5-flash-lite (Not Recommended)

**Critical failures in full-page translation (despite good sample-based benchmark results):**
- Large sections left completely in English (Finite groups intro, Direct sums section, Complete reducibility section)
- Massive ですます/である register mixing within single paragraphs
- Duplicate translation of same paragraphs (5+ locations)
- Translation marker leaks: `[[a x=0>...]]` in final output
- Critical mistranslations: associative algebra → 随伴代数, unipotent → 単項群
- Chinese character contamination (基础, 分支)
- 44 requests (2x other models) suggesting batching instability

**Key lesson: Sample-based benchmarks are unreliable for model selection.** A model that performs well on 13 fragments may fail catastrophically on full-page translation with batching, protected markers, and long context.

## Sample-Based vs Full-Page Comparison

| Model | Sample Benchmark (13 frags) | Full-Page (255 blocks) |
|-------|---------------------------|----------------------|
| gemini-2.5-flash-lite | 732ms, all correct, best speed | 55s, 3.0/10, massive failures |
| gemini-3.1-flash-lite | 1681ms, all correct | 49s, 7.6/10, solid |
| gemini-3-flash | 2428ms, all correct | 123s, 8.75/10, best quality |

## Recommendations

### Default Model
**gemini-3.1-flash-lite-preview** — Best cost-performance ratio. Quality is sufficient for content comprehension. 49s for a long Wikipedia article is acceptable UX.

### Premium Option
**gemini-3-flash-preview** — For users who prioritize quality over speed/cost. Best for academic/technical documents.

### Not Recommended
- **gemini-2.5-flash-lite** — Catastrophic quality in full-page mode despite cheap pricing
- **kimi-k2, deepseek-v3.2, llama-4-scout** — Timeout failures; require `OPENROUTER_REQUEST_TIMEOUT_MS` increase to evaluate

### Future Work
- Increase request timeout (30s → 60s) to enable testing of kimi-k2, deepseek-v3.2, llama-4-scout
- Model preset UI (fast/balanced/accurate) to let users choose their preferred tradeoff
- Periodic re-evaluation as models are updated
