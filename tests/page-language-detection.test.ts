import { afterEach, describe, expect, it, vi } from 'vitest';
import { isLikelyPageInTargetLanguage, sampleMainText } from '../src/core/blocks';
import { TranslationOverlay } from '../src/content/overlay';
import { getWidgetHost, setDocumentHtml } from './test-utils';

// Helper: Japanese text with kana
const JA_TEXT = 'これは日本語のテストページです。翻訳ウィジェットが表示されないことを確認します。';
// Helper: Chinese text (Han only, no kana)
const ZH_TEXT = '这是一个中文测试页面。翻译小部件应该显示以便用户可以翻译内容。';
// Helper: English text
const EN_TEXT = 'This is an English test page with enough content for language detection purposes.';

describe('isLikelyPageInTargetLanguage', () => {
  it('returns true for Japanese text when target is ja', () => {
    const text = JA_TEXT.repeat(5);
    expect(isLikelyPageInTargetLanguage(text, 'ja')).toBe(true);
  });

  it('returns false for Chinese text when target is ja (no kana)', () => {
    const text = ZH_TEXT.repeat(5);
    expect(isLikelyPageInTargetLanguage(text, 'ja')).toBe(false);
  });

  it('returns false for English text when target is ja', () => {
    const text = EN_TEXT.repeat(5);
    expect(isLikelyPageInTargetLanguage(text, 'ja')).toBe(false);
  });

  it('returns true for Chinese text when target is zh', () => {
    const text = ZH_TEXT.repeat(5);
    expect(isLikelyPageInTargetLanguage(text, 'zh')).toBe(true);
  });

  it('returns false for text with fewer than 12 letters', () => {
    expect(isLikelyPageInTargetLanguage('短い', 'ja')).toBe(false);
  });

  it('returns true for Korean text when target is ko', () => {
    const text = '이것은 한국어 테스트 페이지입니다. 번역 위젯이 표시되지 않아야 합니다.'.repeat(3);
    expect(isLikelyPageInTargetLanguage(text, 'ko')).toBe(true);
  });

  it('returns false for Japanese text when target is zh (reverse ja/zh regression)', () => {
    // Chinese user viewing a kanji-heavy Japanese page should NOT have widget suppressed
    const text = JA_TEXT.repeat(5);
    expect(isLikelyPageInTargetLanguage(text, 'zh')).toBe(false);
  });

  it('returns true for Chinese text when target is zh (no kana present)', () => {
    const text = ZH_TEXT.repeat(5);
    expect(isLikelyPageInTargetLanguage(text, 'zh')).toBe(true);
  });
});

describe('sampleMainText', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('samples text from <article> when present', () => {
    setDocumentHtml(`
      <html>
        <body>
          <nav>Navigation menu here</nav>
          <article><p>${JA_TEXT.repeat(10)}</p></article>
          <footer>Footer text</footer>
        </body>
      </html>
    `);
    const sample = sampleMainText(document);
    expect(sample).toContain('日本語');
    expect(sample).not.toContain('Navigation');
    expect(sample).not.toContain('Footer');
  });

  it('excludes nav, footer, aside content', () => {
    setDocumentHtml(`
      <html>
        <body>
          <nav><p>ナビゲーション</p></nav>
          <main><p>${EN_TEXT.repeat(10)}</p></main>
          <aside><p>サイドバー</p></aside>
        </body>
      </html>
    `);
    const sample = sampleMainText(document);
    expect(sample).not.toContain('ナビゲーション');
    expect(sample).not.toContain('サイドバー');
    expect(sample).toContain('English');
  });

  it('respects maxLength cap', () => {
    setDocumentHtml(`
      <html>
        <body>
          <article><p>${EN_TEXT.repeat(100)}</p></article>
        </body>
      </html>
    `);
    const sample = sampleMainText(document, 200);
    expect(sample.length).toBeLessThanOrEqual(200);
  });
});

describe('detectAndPrompt language gate', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.removeAttribute('lang');
  });

  it('suppresses the widget when html lang matches target (Tier 1)', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <html>
        <body><article><p>${EN_TEXT.repeat(10)}</p></article></body>
      </html>
    `);
    document.documentElement.lang = 'ja';

    const overlay = new TranslationOverlay(document);
    overlay.detectAndPrompt('ja');
    await vi.advanceTimersByTimeAsync(100);

    expect(getWidgetHost().dataset.visible).not.toBe('true');
  });

  it('suppresses the widget when og:locale meta matches target (Tier 2)', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <html>
        <head><meta property="og:locale" content="ja_JP"></head>
        <body><article><p>${EN_TEXT.repeat(10)}</p></article></body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    overlay.detectAndPrompt('ja');
    await vi.advanceTimersByTimeAsync(100);

    expect(getWidgetHost().dataset.visible).not.toBe('true');
  });

  it('suppresses the widget on Japanese content with no lang attr (Tier 3 — core bug fix)', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <html>
        <body><article><p>${JA_TEXT.repeat(20)}</p></article></body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    overlay.detectAndPrompt('ja');
    await vi.advanceTimersByTimeAsync(100);

    expect(getWidgetHost().dataset.visible).not.toBe('true');
  });

  it('shows the widget on English content for a ja user', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <html>
        <head></head>
        <body><article><p>${EN_TEXT.repeat(20)}</p></article></body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    overlay.detectAndPrompt('ja');
    await vi.advanceTimersByTimeAsync(5000);

    expect(getWidgetHost().dataset.visible).toBe('true');
  });

  it('does NOT misclassify Chinese content as Japanese (ja/zh regression)', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <html>
        <body><article><p>${ZH_TEXT.repeat(20)}</p></article></body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    overlay.detectAndPrompt('ja');
    await vi.advanceTimersByTimeAsync(5000);

    // Chinese page should show widget for ja user (not misclassified as Japanese)
    expect(getWidgetHost().dataset.visible).toBe('true');
  });

  it('suppresses the widget on Japanese content with wrong lang="en" (Tier 3 override)', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <html>
        <body><article><p>${JA_TEXT.repeat(20)}</p></article></body>
      </html>
    `);
    document.documentElement.lang = 'en';

    const overlay = new TranslationOverlay(document);
    overlay.detectAndPrompt('ja');
    await vi.advanceTimersByTimeAsync(100);

    expect(getWidgetHost().dataset.visible).not.toBe('true');
  });

  it('suppresses the widget when content-language meta matches (Tier 2)', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <html>
        <head><meta http-equiv="content-language" content="ja"></head>
        <body><article><p>${EN_TEXT.repeat(10)}</p></article></body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    overlay.detectAndPrompt('ja');
    await vi.advanceTimersByTimeAsync(100);

    expect(getWidgetHost().dataset.visible).not.toBe('true');
  });
});
