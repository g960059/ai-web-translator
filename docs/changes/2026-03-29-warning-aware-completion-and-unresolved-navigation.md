# 2026-03-29: Warning-Aware Completion and Unresolved Navigation

Summary:
- Split successful completion into two outcomes:
  - fully translated
  - completed with warnings
- Added block-level warning visibility for repeated retries, source fallback, and final unresolved errors.
- Added navigation to the next unresolved block from both the page widget and the popup.

Implemented:
- New `completed_with_warnings` session status in [types.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/shared/types.ts)
- New warning summary in session snapshots:
  - total warning blocks
  - fallback-source block count
  - final error block count
- New content command `FOCUS_NEXT_WARNING_BLOCK` in [messages.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/shared/messages.ts)
- Block-level warning tracking in [translation-controller.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/content/translation-controller.ts)
- Subtle page-level warning styling:
  - repeated retry: light amber
  - source fallback: light amber dashed
  - final unresolved error: light red
- Warning-aware resting state and `次へ` action in [overlay.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/content/overlay.ts)
- Warning card and `未解決箇所へ` action in [PopupApp.tsx](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/src/popup/PopupApp.tsx)

Tests added:
- [overlay.test.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/overlay.test.ts)
- [popup.test.tsx](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/popup.test.tsx)
- [translation-controller.test.ts](/Users/hirakawa/ghq/github.com/g960059/ai-web-translator/tests/translation-controller.test.ts)

Behavior change:
- `done` is no longer shown when unresolved blocks remain.
- The user can move to unresolved blocks directly from the widget or popup.
- First retry stays visually quiet.
- Repeated retries and unresolved fallbacks become visible without treating the whole session as failed.

Verification:
- `npm test`
- `npm run build`

Follow-up:
- Add warning metrics to live benchmark outputs so durability notes can track unresolved-block regressions over time.
- Decide whether `completed_with_warnings` should count as a soft failure in future benchmark scorecards.
