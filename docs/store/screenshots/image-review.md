# Fibo Chrome Web Store Image Review

Reviewed on 2026-04-03 for visual quality, consistency, and install conversion potential.

## Overall

- The set is directionally strong. The gold annotation system, Wikipedia/math subject matter, and warm promo tile all feel like the same product.
- The strongest assets are the ones that prove a unique claim at a glance: `02-annotated.png`, `05-annotated.png`, and the promo tile.
- The main risks are trust and readability, not design taste:
  - Price messaging is inconsistent: the popup shows `約7.6円`, while the promo tile says `1ページ約3円`.
  - `04-annotated.png` uses a different aspect ratio from the other screenshots, so the carousel will feel less polished.
  - Some annotations are large and attractive, but they float over the screenshot instead of being clearly anchored to the exact proof point.
  - A few claims rely on small details that will shrink further in Chrome Web Store thumbnails.

## 01-annotated.png

- Score: `8/10`
- Conversion potential: Good opener. It quickly communicates "full-page translation" and "math preserved," which are both core reasons to install.
- What works:
  - The translated Japanese body text is obvious immediately.
  - The gold callouts are readable and visually on-brand.
  - The screenshot has enough real page context to feel credible.
- Issues:
  - The large `Fibo` wordmark in the top-left competes with the page title and looks more pasted on than integrated.
  - `ワンクリックで全文翻訳` is readable, but it sits a bit loosely in the page and is not strongly tied to a specific UI/action.
  - `数式を100%保持` is a strong message, but the actual math proof is still fairly small inside the screenshot.
- Suggested improvements:
  - Reduce the `Fibo` logo slightly so the actual translated content stays the hero.
  - Anchor the top message more clearly with a line, pointer, or pill background tied to the translated article body.
  - Crop or zoom a little lower so the preserved math block reads faster in store-thumbnail size.

## 02-annotated.png

- Score: `9/10`
- Conversion potential: High. This is the clearest proof screenshot in the set because it shows both readable Japanese output and preserved formula structure.
- What works:
  - `自然な日本語に翻訳` and `LaTeX・MathMLを完全保護` reinforce exactly what makes the extension different.
  - The preserved formula block is visible enough to support the claim.
  - The visual balance is cleaner than `01-annotated.png`.
- Issues:
  - The lower-right callout is strong, but the formula area is still smaller than ideal for a first-glance store scan.
  - The floating AI/helper bubble in the bottom-right adds noise and weakens the polish of the screenshot.
  - The two callouts are not visually connected to each other, so the image reads a little like two separate ad layers.
- Suggested improvements:
  - Tighten the crop slightly around the math section so the formula proof becomes unmistakable.
  - Remove the helper/chat bubble before export.
  - Use a more consistent callout treatment so both benefits feel like one composed message system.

## 03-annotated.png

- Score: `7.5/10`
- Conversion potential: Moderate. The feature is useful, but this screenshot takes longer to understand than the others.
- What works:
  - The alternating original and translated lines do show bilingual mode clearly after a short look.
  - The gold annotations match the rest of the set.
  - The screenshot supports a secondary use case beyond simple full translation.
- Issues:
  - `対訳モード` at the top competes with the article title and navigation and feels slightly detached from the content below.
  - `原文と翻訳を並べて表示` sits over the middle of the content area, so it explains the feature while also obscuring the feature.
  - The proof is text-pattern based, so it is less instantly legible than the formula-preservation screenshots.
- Suggested improvements:
  - Move the explanatory callout into open whitespace or the side margin instead of the middle of the article.
  - Highlight one English block and one Japanese block with subtle tinting or brackets so the mode is obvious at thumbnail size.
  - Consider more benefit-led wording such as `原文と訳文を同時表示` if you want faster comprehension.

## 04-annotated.png

- Score: `7/10`
- Conversion potential: Moderate to good. Showing the actual popup helps credibility, but this asset is less polished than the others.
- What works:
  - The extension icon in the toolbar is visible, which helps users connect the screenshot to a real Chrome extension.
  - The main CTA button is large and readable.
  - The warm popup UI is visually distinctive and consistent with the promo tile.
- Issues:
  - This image has a different aspect ratio from the other screenshots, which will make the overall store gallery feel inconsistent.
  - `Fibo` is effectively shown twice in the header area, which adds clutter without adding information.
  - `コスト見積もり表示` is pushed hard against the right side and feels close to clipping.
  - The popup covers most of the page, so users see the control surface but not much evidence of the resulting translated page.
  - The cost claim here (`約7.6円`) conflicts with the promo tile claim (`1ページ約3円`).
- Suggested improvements:
  - Re-export this at the same aspect ratio as the other screenshots.
  - Remove the duplicate `Fibo` emphasis in the header and simplify the annotation to one main message.
  - Pull the cost note inward and attach it more clearly to the actual cost row.
  - Show slightly more page context behind the popup, or add a small translated preview state nearby.
  - Standardize the pricing/cost language across all assets before publishing.

## 05-annotated.png

- Score: `8.5/10`
- Conversion potential: High. This broadens the product story by proving the extension works on another page structure and preserves diagrams.
- What works:
  - `どんなページでもワンクリック翻訳` expands the promise beyond a single article example.
  - `図表も保持` is a useful, concrete differentiator.
  - The screenshot still looks like a real page rather than a heavily composited ad.
- Issues:
  - The top headline is long and visually heavy, so it competes with the page title and top navigation.
  - The preserved figure is relevant, but still small enough that the proof may be missed in thumbnail view.
  - The right-side callout is good, but the figure/caption area could be emphasized more strongly.
- Suggested improvements:
  - Shorten the top headline slightly so the image breathes more.
  - Zoom in a bit more on the figure area, or add a small inset to make the preserved diagram unmistakable.
  - Keep the callout aligned to a stronger visual anchor, such as the diagram frame instead of open whitespace.

## promo-tile-1280x800.png

- Score: `8.5/10`
- Conversion potential: High. This is the strongest brand asset in the set and works well as a high-level promise tile.
- What works:
  - Strong hierarchy: brand, promise, then three benefits.
  - The type is large enough to survive thumbnail reduction.
  - The warm gradient and gold palette feel premium and consistent with the popup UI.
- Issues:
  - The right-side product screenshot is too small and soft to serve as real proof; it reads more like decorative context.
  - The headline says `数式もコードも壊さないAI翻訳`, but the visual proof only shows math content, not code.
  - The pricing claim `月額不要・1ページ約3円` conflicts with the popup screenshot's `約7.6円`.
  - There is no explicit `Chrome拡張機能` framing, so new users may not instantly understand what kind of product this is.
- Suggested improvements:
  - Either add a visible code snippet in the mockup or narrow the claim to what the tile actually proves visually.
  - Enlarge the right-side UI slightly so it feels like evidence, not decoration.
  - Resolve the pricing inconsistency before launch.
  - Consider a small label such as `Chrome拡張機能` or `ブラウザ上で動作` to reduce first-glance ambiguity.

## Priority Fixes Before Publishing

1. Unify pricing and cost messaging across `04-annotated.png` and `promo-tile-1280x800.png`.
2. Re-export `04-annotated.png` at the same aspect ratio as the other screenshots.
3. Move or resize annotations that currently sit on top of the proof they are supposed to explain, especially in `03-annotated.png`.
4. Make proof details larger in the assets whose claims depend on small formulas, diagrams, or popup rows.
5. Make sure every claim is visually substantiated, especially the promo tile's `コード` wording.
