# 2026-03-30: Translation Quality Pipeline Improvements & Heading Translation

## Summary

4 rounds of external evaluation (Claude Opus x5, Codex 5.4 xhigh x5) on Wikipedia "Representation theory" identified persistent quality issues with gemini-3.1-flash-lite-preview. Pipeline improvements were implemented to address issues within reach of the system (not model capability).

## Changes

### 1. fragmentRoles prompt utilization
- **File**: `src/core/providers/openrouter.ts`
- Previously only `label` role was special-cased in the system prompt
- Added explicit instructions for `heading`, `list-item`, `caption` roles
- Effect: Models now receive clear guidance on how to translate each fragment type

### 2. Glossary constraint strengthening
- **File**: `src/core/providers/openrouter.ts`
- Changed from `"Use s/g only as soft context"` to split `s` (section context) and `g` (glossary) instructions independently
- Glossary is now a harder constraint: `"Follow g (glossary) entries for consistent terminology unless the context clearly demands otherwise"`
- Effect: Better term consistency when glossary hints are provided

### 3. Untranslated content detection
- **Files**: `src/core/blocks.ts`, `src/content/translation-controller.ts`, `src/shared/types.ts`
- Added `isLikelyUntranslated()` function that detects when translation results remain in the source language
- Records `untranslatedResponses` quality signal (detection only, no retry)
- Heading/label fragments use a lower detection threshold (minLetters: 4 vs default 16)
- Effect: Visibility into how many fragments the model fails to translate

### 4. Heading elements never treated as boilerplate
- **File**: `src/core/blocks.ts`
- H1-H6 elements now always pass `isBoilerplateBlock()` — they are never skipped
- Non-reader section headings (See also, References, etc.) also enter the pipeline
- Effect: **All 35 headings translated to Japanese** (previously 17 remained in English)

### 5. Client-side heading dictionary
- **File**: `src/content/translation-controller.ts`
- `COMMON_HEADING_TRANSLATIONS` dictionary (~45 entries for Japanese) provides instant translation for common structural headings without API calls
- Dictionary-first shortcircuit in `hydrateGroups()`: headings matching the dictionary are applied locally before batching
- Post-translation fallback in `applyGroupTranslation()`: if model returns heading unchanged, dictionary is applied
- Effect: Structural headings (See also → 関連項目, References → 参考文献, etc.) translated with zero API cost

### 6. "Translate every fragment" prompt instruction
- **File**: `src/core/providers/openrouter.ts`
- Added `"Translate every fragment including headings and list items. Do not leave source-language text untranslated."` to both HTML and text mode prompts
- Effect: Reduces model tendency to skip short fragments

## Evaluation Results

### Quality scores (Wikipedia "Representation theory", gemini-3.1-flash-lite-preview)

| Round | Opus Score | Codex Score | Key Improvement |
|-------|-----------|-------------|-----------------|
| 1 (baseline) | — | — | 17/35 headings untranslated |
| 2 (prompt changes) | 6.5 | 4.5 | +17% latency, limited quality gain |
| 3 (Codex review fixes) | 7.0 | 5.0 | hintInstruction s/g split, untranslated rename |
| 4 (heading fixes) | 7.0 | 5.0 | **0/35 headings untranslated** |

### Pipeline improvement ceiling

With gemini-3.1-flash-lite-preview, pipeline improvements reached a ceiling:
- **Solvable by pipeline**: heading translation, boilerplate exclusion, marker handling, untranslated detection
- **Requires model upgrade**: decomposable/indecomposable accuracy, term consistency (リー代数/リー環), complex sentence structure, output limit retries

## Performance

| Metric | Before | After |
|--------|--------|-------|
| English headings | 17/35 | **0/35** |
| Status | completed_with_warnings | **completed** |
| Elapsed | 50-55s | 50-85s (API variance) |
| Requests | 16-19 | 16-22 |
| Dictionary-resolved headings | 0 | ~12 (no API cost) |
