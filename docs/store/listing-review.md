# Fibo Chrome Web Store Review

## Overall

Fibo has a strong niche hook. Researchers, students, and engineers who already know the pain of broken math translation may install it. Most Chrome Web Store users will not convert yet, because the listing asks for trust and setup effort before it proves the result.

## Biggest Gaps

- The listing explains features well, but it does not prove the outcome. Add screenshots or a short GIF showing arXiv/Wikipedia/math pages before and after translation.
- The copy leads with features like presets and model choice. Lead with the job-to-be-done instead: read technical pages in your language without broken formulas or code.
- The listing lacks concrete trust cues near the top. Add: no Fibo account, no analytics, API key stored locally, developer cannot read your pages.
- The pricing message is too abstract. Add a concrete example such as typical cost per page/article, alongside the existing estimate message.
- Add supported examples by name: arXiv, Wikipedia math pages, Read the Docs, GitHub docs.

## API Key Requirement

The OpenRouter API key is a major conversion drag. For mainstream users it is a dealbreaker. For early technical users it is acceptable, but only if the listing proves the product is worth the setup.

- Best fix: offer a small no-key free trial, such as 3 to 5 pages.
- If BYOK must stay, reduce fear: say "bring your own OpenRouter key, pay OpenRouter directly, no Fibo account needed" and show the setup flow in a screenshot or short video.

## Privacy Policy

The current policy is mostly good, but "collects nothing" reads as too absolute because translation text and the API key are still sent to OpenRouter when the user translates.

- Replace that wording with: Fibo does not collect data for the developer; when the user starts translation, page text and the API key are sent directly to OpenRouter to process the translation.
- Explicitly say that URLs, titles, history, cache, and settings stay local and are never sent to the developer.
- Add a plain-language trust line: no developer-run servers, no analytics, no selling data.

## Highest-Impact Changes

1. Rewrite the summary around the outcome, not the implementation.
   EN: `Read technical pages in your language without broken math or code.`
   JA: `数式やコードを壊さず、技術ページを母国語で読める翻訳拡張。`
2. Move "3 presets + custom models" lower. It is useful, but not a primary conversion trigger.
3. Add a "Why Fibo instead of Google Translate?" section with side-by-side proof.
4. Add a first-run promise near the top: install, add key or start trial, translate the current page in one click.
5. Group open source, privacy, and no-tracking into one visible trust block instead of leaving them near the bottom.
