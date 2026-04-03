# Codex (GPT-5.4 xhigh) Evaluation

## 総評
全体として「前半はそこそこ読めるが、主本文に未翻訳が残り、専門用語にも重大な誤りがある」という評価。`である調`はほぼ維持できているが、Wikipedia の数学記事として公開できる品質には達していない。

---

## 1. 日本語としての自然さ
導入部には自然な箇所もあり、`です・ます` 混在も見当たらなかった。ただし学術文書としては機械翻訳臭が残る。

- 不自然な言い回し: L86「抽象代数学を具体的に実行することにある」→「具体的な行列計算に落とし込む」が自然
- 文の崩壊: L1808「そこには G の表現が存在する。半単純ではない表現。」は日本語として破綻
- 直訳の断片化: L1893, L1899 で文の接続が崩壊

---

## 2. 数学用語の正確さ
主要語の多くは妥当（表現論、結合代数、保型形式、同変写像、マシュケの定理 など）。

致命的な誤り:
- `decomposable / indecomposable` → `可約 / 既約` と訳出（概念が変わっている。正しくは `可分解 / 直既約` など）
- `Lie algebra` が前半 `リー代数`、後半 `リー環` で不統一
- `corepresentations` → `余表現` はやや非標準

---

## 3. 未翻訳箇所
単発ではなく複数:
- 冒頭箇条書き1項目 "generalizes Fourier analysis via harmonic analysis" が英語のまま
- 見出しが多数未翻訳（Definition, Action, Mapping, Finite groups, Harmonic analysis, Lie groups, Lie algebras, Lie superalgebras, Invariant theory, Module theory, History, Generalizations）
- `Subrepresentations, quotients, and irreducible representations` 節の本文がかなりの範囲で英語のまま
- See also セクション全体が英語

---

## 4. 具体的な問題点
- L9: "generalizes Fourier analysis via harmonic analysis" 未翻訳
- L1371: `decomposable / indecomposable` → `可約 / 既約` 誤訳
- L1808: "there are G-representations that are not semisimple" の訳が壊れている
- L1893: "new life was breathed into the subject by David Mumford..." が断片化
- L1899: "The generalization involves replacing ... by ..." → 「含まれる。および...」

---

## 5. 根本的改善案

後方互換性を無視して作り直すなら、`段落バッチ翻訳` ではなく `文書理解 -> 節単位翻訳 -> 自動検査 -> 修正` のパイプラインにする。

### プロンプト設計
現行の system prompt は汎用的すぎる。`s/g` を "soft context" 扱いしており（openrouter.ts:46）、用語集を守らなくてもよい設計。技術翻訳では glossary を **hard constraint** にすべき。

### 見出し・箇条書き
`fragmentRoles` には `heading`, `list-item`, `caption` があるのに（types.ts:10）、prompt 側は `label` しか特別扱いしていない（openrouter.ts:53）。これが未翻訳見出しの一因。

### バッチ処理
現在 `6000 tokens / 36 items` までまとめているが、数学記事には大きすぎる。最適解は `ページ全体解析` → `節ごとの 2-6 段落ウィンドウ翻訳`。

### 数式・記号
`{\displaystyle ...}` や MathML/TeX を翻訳前にプレースホルダ化し、自然言語だけをモデルに渡すべき。

### 翻訳メモリ/用語集
現状は短い反復表現だけ候補化（3回以上出現、最大4件ヒント）。見出し、リンクテキスト、初出定義文、反復 n-gram から自動用語集を作り、以後の節で拘束条件として使うべき。

### マルチパス翻訳
`下訳 → 未翻訳検出 → 用語整合チェック → 日本語洗練` に分けるべき。

### コンテキスト連続性
section context は単に最多の見出し1個へ圧縮されている。各窓に `section path`, `previous approved Japanese`, `section summary`, `term memory` を持たせるべき。

### 提案する system prompt の方向性

```text
You are translating a mathematics encyclopedia article into Japanese.
Translate every natural-language string into Japanese.
Do not leave English except proper nouns, URLs, bibliographic titles, TeX/MathML, and protected markers.
Use standard Japanese mathematical terminology. If glossary entries are given, follow them exactly.
If r=heading, output a concise Japanese heading. If r=list-item, output a Japanese list item.
If r=caption or r=label, keep it short and non-sentential.
Preserve all formulas, symbols, citation markers, HTML tags, and protected markers exactly.
Use p and s as authoritative context to resolve fragments and ellipsis.
Before returning, verify: no dropped content, no duplicated clauses, no leftover English outside allowed exceptions, consistent dearu style.
Return JSON only.
```

### 結論
最大の問題は「モデル能力そのもの」よりも、「数式混じり Wikipedia を汎用 prompt で大きめバッチ翻訳していること」と「未翻訳検査・用語整合検査がないこと」。ここを直せば品質はかなり上がる。

*(184,722 tokens consumed)*
