# Fibo Privacy Policy / Fibo プライバシーポリシー

Last updated / 最終更新: 2026-04-03

---

## English

### Overview

Fibo is a Chrome extension that translates web pages using AI. We respect your privacy and handle only the minimum data necessary.

### Data Collection

**Fibo's developer does not collect any personal data, browsing history, or translation content.**

There are no developer-run servers, no analytics, no tracking, and no data selling.

### Data Stored Locally

The following data is stored only in your browser (`chrome.storage.local`) and is never sent to Fibo's developer:

- OpenRouter API key (used for authenticated API calls)
- Translation settings (language, model, style preferences)
- Translation cache (for faster display on revisits)
- Translation history (URLs and titles of translated pages)
- Blocked sites list (sites excluded from translation)

### Data Sent to Third Parties

When you initiate a translation, the following data is sent directly to OpenRouter (https://openrouter.ai):

- The text content of the web page being translated
- Your selected translation model
- Your API key (for authentication)

**Important:** Fibo sends data directly to OpenRouter's API. The Fibo developer never receives or processes your translation data. For OpenRouter's data handling practices, please refer to [OpenRouter's Privacy Policy](https://openrouter.ai/privacy).

### Data Deletion

- Translation cache: Delete individually or in bulk from the History panel
- API key: Remove from the Settings panel
- All data: Uninstalling the extension from Chrome deletes all stored data

### Permissions Explained

| Permission | Purpose |
|-----------|---------|
| `storage` | Store settings and cache locally in your browser |
| `activeTab` | Translate the current tab's page content |
| `tabs` | Track translation state across tabs |
| `contextMenus` | Add translation options to the right-click menu |
| `host_permissions: openrouter.ai` | Send translation requests to the API |

### Contact

For privacy-related questions, please open an issue on GitHub:
https://github.com/g960059/ai-web-translator/issues

---

## 日本語

### 概要

Fibo はウェブページをAIで翻訳するChrome拡張機能です。ユーザーのプライバシーを尊重し、必要最小限のデータのみを扱います。

### データ収集

**Fibo の開発者は、個人情報、閲覧履歴、翻訳内容を一切収集しません。**

開発者が運営するサーバーはなく、アナリティクス、トラッキング、データ販売も一切行いません。

### ローカルに保存されるデータ

以下のデータはお使いのブラウザ内（`chrome.storage.local`）にのみ保存され、Fibo の開発者に送信されることはありません：

- OpenRouter API キー（API 認証に使用）
- 翻訳設定（言語、モデル、スタイル等の選択）
- 翻訳キャッシュ（再訪問時の高速表示のため）
- 翻訳履歴（翻訳済みページのURL・タイトル）
- ブロックリスト（翻訳を除外するサイト）

### 第三者サービスへのデータ送信

翻訳を実行する際、以下のデータが OpenRouter（https://openrouter.ai）のAPIに**直接**送信されます：

- 翻訳対象のテキスト（ウェブページの本文）
- 選択した翻訳モデルの情報
- ユーザーが設定した API キー

**重要:** Fibo は OpenRouter の API にデータを直接送信します。Fibo の開発者が翻訳データを受信・処理することはありません。OpenRouter のデータ取り扱いについては、[OpenRouter のプライバシーポリシー](https://openrouter.ai/privacy)をご確認ください。

### データの削除

- 翻訳キャッシュ: 「履歴」パネルから個別または一括で削除可能
- API キー: 設定画面から削除可能
- 全データ: Chrome から拡張機能を削除すると、保存された全データが削除されます

### 権限の説明

| 権限 | 用途 |
|------|------|
| `storage` | 設定・キャッシュをブラウザ内に保存 |
| `activeTab` | 現在のタブのページを翻訳 |
| `tabs` | タブの翻訳状態を管理 |
| `contextMenus` | 右クリックメニューに翻訳オプションを追加 |
| `host_permissions: openrouter.ai` | 翻訳 API へのリクエスト送信 |

### お問い合わせ

プライバシーに関するご質問は、GitHub の Issues でお問い合わせください。
https://github.com/g960059/ai-web-translator/issues

---

## Change Log / 変更履歴

- 2026-04-03: Initial version / 初版公開
