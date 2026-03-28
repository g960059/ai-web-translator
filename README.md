# AI Web Translator

Chrome extension that translates the active page or current selection through AI, with a popup-first control surface and persistent translation cache.

## What Changed In v2

- Popup, content script, and background worker were rebuilt around shared typed contracts.
- Translation now supports arbitrary target languages instead of a Japanese-only flow.
- Page translation, selection translation, toggle, re-translation, cache management, and inline cost analysis all use the same core pipeline.
- Generated assets and vendored dependencies are no longer meant to live in git.

## Development

```bash
npm install
npm run typecheck
npm run test
npm run build
```

## Live E2E

1. Copy `.env.example` to `.env`.
2. Set `E2E_OPENROUTER_API_KEY` and optionally `E2E_TRANSLATION_MODEL`.
3. Run `npm run test:e2e:live`.

Notes:

- `.env` is ignored by git and should stay local only.
- The live E2E hits the real provider once against a small Wikipedia-derived fixture with math and diagram markup.
- It only runs when `RUN_LIVE_E2E=1` is set by the script, so regular `npm test` stays offline.

## Load The Extension

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable Developer Mode.
4. Click `Load unpacked`.
5. Select the repository `dist/` directory.

## Runtime Defaults

- Provider: OpenRouter
- Default model: `google/gemini-3.1-flash-lite-preview`
- Default target language: Chrome UI language, with `ja` as fallback
- Default reading mode: body-first (`translateFullPage = false`)
- Default style: `auto`
- Cache: enabled

## Manual Smoke Checklist

1. Save a valid OpenRouter API key in the popup.
2. Refresh estimate for the active page.
3. Translate the page and confirm the overlay progresses to completion.
4. Select a paragraph and run `Translate Selection`.
5. Run `Toggle Selection` twice and confirm the translated content returns without another API round-trip.
6. Run `Re-translate Selection`.
7. Clear the current page cache, then verify the page returns to the original markup.
8. Change target language and confirm a new translation session uses the new setting.

## Project Layout

- `src/entrypoints`: background, content, and popup entry files.
- `src/shared`: shared message contracts, storage helpers, cache helpers, and core types.
- `src/core`: provider logic, HTML preparation, block extraction, and analysis helpers.
- `src/content`: content-side translation session and overlay UI.
- `src/background`: tab session state and context menu state.
- `tests`: fixture-based unit and integration tests.
- `docs`: ADRs, dated changes, metrics baselines/comparisons, and runbooks.

## Docs

- Overview: [docs/README.md](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/README.md)
- ADRs: [docs/adr](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/adr)
- Changes: [docs/changes](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/changes)
- Metrics: [docs/metrics](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/metrics)
- Runbook: [docs/runbook](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/docs/runbook)
