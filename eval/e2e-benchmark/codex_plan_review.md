# Conditional Go

## Findings

1. The implementation plan is sound, but the test plan is incomplete. The storage path is already compatible with saved `translateFullPage: false`, yet the current test suite mostly hardcodes `translateFullPage: false`, so it will not catch a broken default flip or a broken checkbox inversion by itself.
   - Add a settings regression in `tests/settings.test.ts` proving saved `translateFullPage: false` still loads as `false` after `DEFAULT_SETTINGS.translateFullPage` changes to `true`.
   - Add popup coverage in `tests/popup.test.tsx` proving the main screen no longer renders the `本文のみ` / `ページ全体` segment and that the settings checkbox labeled `本文のみに限定する` maps back to `translateFullPage` correctly.
   - Do not bulk-update existing e2e/controller tests that intentionally pin `translateFullPage: false`; those are explicit main-scope tests, not default-value assertions.

## Answers

1. Existing users who already saved `translateFullPage: false` will not break.
   `loadSettings()` merges stored settings over defaults, and `normalizeSettings()` preserves an explicit boolean instead of falling back to the default. That means stored `false` still wins after the default flips to `true`.
   - Evidence: `src/shared/settings.ts:115-118`
   - Evidence: `src/shared/settings.ts:136-141`

2. The checkbox inversion in the plan is correct.
   The stored field still means "translate full page". Once the label changes to `本文のみに限定する`, the checkbox must represent the opposite of `settings.translateFullPage`.
   - Correct binding:
     - `checked={!settings.translateFullPage}`
     - `onChange={(e) => updateSettings({ translateFullPage: !e.target.checked })}`
   If the label is changed without inverting the binding, the UI will be backwards.
   - Current non-inverted binding to replace: `src/popup/PopupApp.tsx:637-639`

3. Some tests should be added or updated, but not the whole suite.
   - `tests/settings.test.ts` should add a regression for "stored false survives new default true".
   - `tests/popup.test.tsx` should add coverage for the removed ready-screen scope segment and the inverted settings checkbox behavior.
   - Existing tests and helpers that explicitly set `translateFullPage: false` can stay as-is if they are intentionally testing `main` scope.
   - `tests/test-utils.ts:13-25` is one place to leave alone unless you deliberately want to rebaseline many controller tests to the new runtime default.

4. `resolveScope()` still works correctly and should stay unchanged.
   It still maps the underlying boolean to `'page'` vs `'main'`, and both translation start and page analysis already consume that mapping.
   - `src/popup/PopupApp.tsx:230`
   - `src/popup/PopupApp.tsx:316`
   - `src/popup/PopupApp.tsx:718-719`

   The content-side behavior also remains consistent with the plan:
   - `main` scope still uses the best main-content root, while `page` scope uses `document.body`: `src/core/blocks.ts:637-649`
   - Page scanning still uses the resolved root: `src/content/translation-controller.ts:1166-1167`
   - Immediate scheduling still prioritizes visible / near-viewport groups before deferred groups, so "full page by default" does not remove the current first-screen-first behavior: `src/content/translation-controller.ts:1650-1707`

## Verdict

`Conditional Go`.

The default flip itself is compatible with persisted `translateFullPage: false`, the inversion logic is correct, and `resolveScope()` remains valid. The condition is to make the test plan explicit: add one storage regression test and one popup/UI regression test so the new default and inverted checkbox semantics are actually protected.
