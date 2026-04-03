# Opus Evaluator #2: Technical Accuracy & Architecture

## 翻訳品質評価レポート

### 対象
- 原文: Wikipedia "Representation theory"
- モデル: google/gemini-3.1-flash-lite-preview
- 処理: 19リクエスト、約53秒

---

### 1. 技術的正確性の評価

#### 1.1 数学用語の翻訳精度（概ね良好）

主要用語は正確: 表現論、ベクトル空間、線形変換、結合代数、リー代数、既約表現、シューアの補題、同変写像

#### 1.2 重大な問題

**A: 未翻訳フラグメントの残存**
- 9行目: "generalizes Fourier analysis via harmonic analysis" が英語のまま（fallbackSourceBlocks: 1 に対応）

**B: セクション見出しの未翻訳混在**
- "Definition", "Action" 等が英語のまま。他は翻訳済み。不整合。

**C: フラグメント境界での文構造の崩壊**
- "群の表現とは G あるいは（結合代数またはリー）代数の A ベクトル空間上への V 写像であり" -- 数式記号の前後で日本語が不自然に分断

**D: decomposable/indecomposable の誤訳（致命的）**
- "decomposable" → 「可約」、"indecomposable" → 「既約」と訳出。数学的に異なる概念（分解可能/分解不能 vs 可約/既約）。

**E: 用語不統一**
- 「リー代数」vs「リー環」が混在（前半は「リー代数」、後半で「リー環」）

---

### 2. システムプロンプト分析

#### 良い点
- JSON入出力による構造化、`response_format: { type: 'json_object' }` でJSON出力保証
- `temperature: 0.2` は翻訳タスクに適切
- `precedingContext` による先行文脈の受け渡し機構（93フラグメントで活用済み）

#### 重大な欠落
- **ドメイン知識なし**: 「数学の記事である」という情報がプロンプトにない
- **用語統一指示なし**: 「同一文書内で訳語を統一せよ」がない
- **数学コンテンツ固有指示なし**: 数式保持の明示的指示がない
- **フラグメント間連続性が弱い**: 「途中で切れている可能性がある」等の警告がない

---

### 3. メトリクス分析

- リトライ1回（batchSplits: 1） -- 102フラグメント一括送信でフラグメント数不一致（116件返却）
- 警告ブロック1個（fallbackSourceBlocks: 1）
- トークン効率: 19リクエストで毎回同じシステムプロンプト送信、オーバーヘッド大
- protectedMarkerFallbackFragments: 4 -- マーカー処理の失敗
- 後半バッチで品質劣化の兆候（用語不統一、見出し未翻訳の混在）

---

### 4. 根本的改善提案

#### 提案1: 二段階翻訳アーキテクチャ
1. **第一パス**: 記事全体を分析し、専門用語対訳リスト・文体判定・ドメイン分類を生成（翻訳は行わない）
2. **第二パス**: 第一パスの用語集・文体指示を全バッチに共有して翻訳

#### 提案2: 翻訳メモリ/用語DB
- IndexedDB に (sourcePhrase, targetLanguage, domain) → translatedPhrase を蓄積
- 数学用語の組み込み初期辞書搭載
- ユーザー修正を翻訳メモリに反映
- バッチリクエスト時に glossary フィールドとして自動注入

#### 提案3: コンテキストウィンドウの戦略的活用
- 「翻訳対象」と「参考文脈」を明示的に分離
- 前バッチの翻訳結果も含めた「翻訳済みコンテキスト」を参考情報として提供

#### 提案4: 長文/短文での戦略分岐
- 短文（< 2000トークン）: 全文1バッチ
- 長文: セクション単位でバッチ構成（意味的単位で分割）

#### 提案5: モデル選択の動的戦略
- ファーストビュー: 高速モデル（flash-lite）
- 数式・定義含むセクション: 高性能モデルにエスカレーション
- リトライ時: バッチ分割 + モデルアップグレード

#### 提案6: 後処理パイプライン（ルールベース）
1. 用語一貫性チェック
2. 文体一貫性チェック（だ・である/です・ます混在検出）
3. 未翻訳フラグメント検出 + 再翻訳
4. 数式記号整合性チェック

#### 提案7: プロンプト改善案

```
You are translating a {domain} article. Key terminology must be consistent:
{auto-generated glossary from pass 1}

IMPORTANT:
- Mathematical notation in displaystyle blocks must be preserved exactly.
- Maintain consistent register (である調) throughout all fragments.
- When a fragment appears to be a continuation of a previous sentence,
  translate it as such — do not start a new sentence.
- Section headings should be translated as standard Japanese academic terminology.
```

---

### 総合評価

| 評価項目 | スコア | コメント |
|---------|--------|---------|
| 基本的な翻訳精度 | 7/10 | 主要概念は正確だが、decomposable/indecomposableの誤訳が致命的 |
| 用語の一貫性 | 5/10 | リー代数/リー環の混在、見出し翻訳/未翻訳の混在 |
| 文構造の自然さ | 6/10 | 大部分は自然だが、フラグメント境界での崩壊あり |
| 完全性 | 7/10 | 1フラグメント未翻訳残存 |
| システムアーキテクチャ | 6/10 | 基本設計は堅実だが長文学術記事への最適化不足 |

**最優先改善**: 二段階翻訳による用語統一 + 長文記事のセクション単位バッチ
