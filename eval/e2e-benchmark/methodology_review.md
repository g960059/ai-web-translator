# E2E Benchmark Methodology Review

## Bottom line

The reported `5/10` quality is not a reliable measure of the extension's visible output.

The benchmark has three major methodological defects:

1. It does not evaluate the same content scope that the extension translates.
2. It does not extract the same text a human sees on the rendered page.
3. It truncates every extracted block to 300 characters before judging it.

So the answer to the user's key question is:

- Yes, `el.textContent` including invisible descendants is a real root cause of the bad-looking samples.
- No, it is not the only root cause.
- The direct cause of the reported "truncated fragments" is the benchmark's own `text.slice(0, 300)` clipping.

## High-confidence findings

### 1. The benchmark is not aligned with the extension's translation scope

`eval/e2e-model-benchmark.mjs` runs the extension with `translateFullPage: false`, so the content script translates only the resolved `main` scope, not the whole document.

Relevant code:

- `eval/e2e-model-benchmark.mjs:79`
- `eval/e2e-model-benchmark.mjs:101`
- `src/content/translation-controller.ts:1268`
- `src/content/translation-controller.ts:1166`
- `src/core/blocks.ts:118`

But extraction currently scans:

- `[data-aiwt-warning], p, h1, h2, h3, h4, h5, h6, li`

across the whole document, not the same `main/article/#mw-content-text/.mw-parser-output` root that the translation pipeline uses.

Consequence:

- `totalBlocks` includes lots of untranslated but out-of-scope DOM.
- `translatedBlocks / totalBlocks` is not a meaningful quality metric.
- The benchmark can count references, navigation-like content, and other non-reader blocks that the extension intentionally does not translate.

This explains the suspiciously low counts like `125 translated / 407 total` on a page that visually appears well translated.

### 2. `textContent` is not a faithful proxy for visible rendered text

The extension's own block collection excludes many non-reader elements and hidden structures:

- `src/core/blocks.ts:57`
- `src/core/blocks.ts:114`
- `src/core/blocks.ts:828`

The E2E benchmark does not stay aligned with that logic. Even in the current working copy, where it removes `annotation` and `.mwe-math-mathml-a11y` before extraction, the method is still not equivalent to what a human sees.

Relevant code:

- `eval/e2e-model-benchmark.mjs:131`
- `eval/e2e-model-benchmark.mjs:133`
- `eval/e2e-model-benchmark.mjs:138`

Why this is still wrong:

- Raw `textContent` includes hidden descendants by default.
- Wikipedia math uses hidden MathML accessibility markup such as `.mwe-math-mathml-a11y` and `<annotation>` with strings like `{\displaystyle V}`.
- If those nodes are not removed, the benchmark captures invisible junk.
- If those nodes are removed, `textContent` then drops the visible rendered formula entirely, because the visible math is often an `<img>` or protected math element rather than text.

I verified this on the local Wikipedia fixture:

- `tests/fixtures/wikipedia-representation-theory-of-finite-groups.html:189`
- `tests/fixtures/wikipedia-representation-theory-of-finite-groups.html:193`
- `tests/fixtures/wikipedia-representation-theory-of-finite-groups.html:197`

For `#equivariant-tail`, raw `textContent` becomes effectively:

```text
Such a map is also called equivariant. The kernel, image and cokernel of T {\displaystyle T} are again representations.
```

That `{\displaystyle T}` fragment is invisible on the page. A human sees rendered math, not the annotation payload.

So on the user's question: yes, invisible MathML leakage is a genuine defect in this methodology. It is one of the main reasons the judge sees MathML garbage.

### 3. The benchmark itself manufactures the "途中切れ" defects

This is the clearest bug in the current benchmark:

- `eval/e2e-model-benchmark.mjs:144`

Every extracted block is forcibly truncated:

```js
text: text.slice(0, 300)
```

That means the judge is never seeing full paragraphs. It is seeing 300-character prefixes.

Consequence:

- Mid-sentence endings are benchmark artifacts, not necessarily translation defects.
- Paragraphs that were fine in the browser will be judged as incomplete.
- Math leakage makes this worse because hidden junk consumes part of the 300-character budget before the visible sentence is finished.

This directly explains findings like:

- "4番ブロックが...で途切れている"
- "9番ブロックが...線形写で終わる"

Those are exactly the kinds of defects this line can create by construction.

### 4. Sample generation is not representative

Relevant code:

- `eval/e2e-model-benchmark.mjs:159`
- `eval/e2e-model-benchmark.mjs:160`
- `eval/e2e-model-benchmark.mjs:161`
- `eval/e2e-model-benchmark.mjs:162`

Current sampling logic:

- only paragraphs
- only blocks already marked as containing Japanese
- only the first 20 matching paragraphs in document order
- already truncated to 300 chars

Consequence:

- The sample is front-loaded.
- It overweights the first math-heavy definition section.
- It excludes headings and list items entirely.
- It is not random and not stratified.

So even if the page as a whole looks good, the sample can still be biased toward noisy or formula-adjacent paragraphs.

## Secondary findings

### 5. Scrolling is probably not the main problem, but it is weaker than the repo's better implementation

Relevant code:

- `eval/e2e-model-benchmark.mjs:224`
- `eval/e2e-model-benchmark.mjs:225`
- `eval/e2e-model-benchmark.mjs:230`
- `eval/e2e-model-benchmark.mjs:237`

The current `autoScrollPage()` likely triggers most lazy translation on Wikipedia:

- it scrolls the whole page in `0.8 * viewportHeight` steps
- it waits `1500ms` between steps
- the content script uses an `IntersectionObserver` with `rootMargin: '125% 0px'`
- near-bottom scrolling forces lazy flushes

Relevant content-script behavior:

- `src/content/translation-controller.ts:3102`
- `src/content/translation-controller.ts:3108`
- `src/content/translation-controller.ts:3212`
- `src/content/translation-controller.ts:3636`

So scrolling is probably adequate for the current failure report.

However, it is less robust than the existing `scrollUntilTranslated()` implementation in `eval/run-eval-translation.mjs`:

- `eval/run-eval-translation.mjs:274`
- `eval/run-eval-translation.mjs:301`
- `eval/run-eval-translation.mjs:307`
- `eval/run-eval-translation.mjs:309`

Weaknesses of `autoScrollPage()`:

- it snapshots `document.body.scrollHeight` only once
- it does not recompute height as layout changes
- it does not interleave progress polling with scrolling
- it scrolls back to top immediately after the pass instead of after stable completion
- it uses `document.body.scrollHeight` instead of the safer `max(documentElement.scrollHeight, body.scrollHeight)`

These are robustness problems, but they do not explain the MathML junk and artificial truncation seen in the judged samples.

### 6. Completion detection is mostly correct in the successful runs, with one unsafe fallback

Relevant code:

- `eval/e2e-model-benchmark.mjs:118`
- `eval/e2e-model-benchmark.mjs:271`
- `eval/e2e-model-benchmark.mjs:301`
- `src/content/translation-controller.ts:3323`
- `src/content/translation-controller.ts:3998`

For normal `completed` / `completed_with_warnings` cases, the benchmark is using the content script's own session snapshot, and the content script only marks completion after lazy pending groups are drained and warning repair passes run.

That part is reasonably sound.

The unsafe part is here:

- `eval/e2e-model-benchmark.mjs:305`

Treating long-lived `lazy` as complete after timeout is methodologically wrong, because it can silently score an incomplete translation as finished.

That does not appear to be the root cause of the reported `5/10` samples if those runs ended with true `completed`, but it is still a correctness issue.

## Is invisible MathML the root cause?

Partly yes.

More precise answer:

- Invisible MathML leakage is a real source of false defects.
- It is especially responsible for the `{\displaystyle ...}` garbage and symbol fragments like `V`, `F`, `G`, `Φ`.
- But the bigger direct cause of "truncated fragments" is the benchmark's own 300-character clipping.
- Scope mismatch also corrupts the block-count metrics.

So the benchmark is currently underestimating quality for multiple independent reasons at once.

## What the benchmark should do instead

### 1. Align extraction scope with the translation scope

Extract only from the same root the extension translates:

- `main`
- `article`
- `[role="main"]`
- `#mw-content-text`
- `.mw-parser-output`

Do not scan the whole document when `translateFullPage: false`.

### 2. Stop using raw `textContent` as the evaluation text

Best options, in order:

1. Ask the content script for the translated block records it actually produced, and evaluate those.
2. If DOM extraction is necessary, clone each candidate node, replace protected math/media with a stable placeholder such as `[MATH]`, remove hidden descendants, then read normalized visible text.
3. If using browser DOM text APIs, prefer a visibility-aware extraction strategy over raw `textContent`.

The repo already has utilities that show the intended direction:

- `src/core/html.ts:138`
- `src/core/html.ts:375`
- `src/core/blocks.ts:864`

### 3. Never truncate blocks before scoring

Keep full extracted text in JSON.

If you need shorter display output:

- truncate only in the human-readable report
- do it after scoring
- truncate on sentence boundaries, not raw character count

### 4. Make sampling representative

Instead of "first 20 translated paragraphs", sample by a stable strategy such as:

- 5 early / 5 middle / 5 late blocks
- mix of plain paragraphs and formula-adjacent paragraphs
- include headings separately if they matter
- optionally exclude math-dense blocks from fluency scoring and score them in a separate preservation bucket

### 5. Reuse the more robust scrolling pattern already in the repo

`eval/run-eval-translation.mjs` has the better shape:

- scroll
- poll snapshot
- continue until completion
- only then extract

The E2E benchmark should use the same approach instead of a blind pre-scroll pass.

### 6. Treat `lazy-timeout` as incomplete, not complete

If a run times out in `lazy`, record it as incomplete and do not score it as a finished translation.

## Final assessment

The benchmark, as written, is not a trustworthy judge of visible translation quality.

The user's hypothesis about `textContent` and invisible MathML is valid, but the benchmark also has two equally important methodological problems:

- it truncates every block to 300 chars before evaluation
- it extracts from the whole page instead of the same scope the extension translates

Those three issues together are sufficient to explain why manual Chrome extension use can look excellent while the E2E sample files score around `5/10`.
