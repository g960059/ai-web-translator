import { afterEach, describe, expect, it, vi } from 'vitest';
import { TranslationOverlay } from '../src/content/overlay';
import {
  getWidgetHost,
  getWidgetShadowRoot,
  selectElementContents,
  setDocumentHtml,
} from './test-utils';

describe('TranslationOverlay', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('routes selection bubble actions to selection translation even while resting', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <p id="target">This is a selectable sentence with enough characters.</p>
        </body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    const onQuickTranslateSelection = vi.fn();
    overlay.onQuickTranslateSelection = onQuickTranslateSelection;
    overlay.attachSelectionListener();
    overlay.setResting();

    selectElementContents(document.getElementById('target') as HTMLElement);
    document.dispatchEvent(new Event('selectionchange'));
    await vi.advanceTimersByTimeAsync(300);

    const bubbleAction = getWidgetShadowRoot().querySelector('.bubble-action') as HTMLButtonElement;
    bubbleAction.click();

    expect(onQuickTranslateSelection).toHaveBeenCalledTimes(1);
    expect(getWidgetHost().dataset.widgetState).toBe('resting');
  });

  it('treats mascot click as the active selection action when the selection prompt is visible', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <p id="target">This is another selectable sentence with enough characters.</p>
        </body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    const onStartTranslation = vi.fn();
    const onQuickTranslateSelection = vi.fn();
    overlay.onStartTranslation = onStartTranslation;
    overlay.onQuickTranslateSelection = onQuickTranslateSelection;
    overlay.attachSelectionListener();

    selectElementContents(document.getElementById('target') as HTMLElement);
    document.dispatchEvent(new Event('selectionchange'));
    await vi.advanceTimersByTimeAsync(300);

    const mascot = getWidgetShadowRoot().querySelector('.mascot') as HTMLButtonElement;
    mascot.click();

    expect(onQuickTranslateSelection).toHaveBeenCalledTimes(1);
    expect(onStartTranslation).not.toHaveBeenCalled();
  });

  it('renders the mascot as an accessible button and stops active work on click', () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body></body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    const onCancel = vi.fn();
    overlay.onCancel = onCancel;
    overlay.setWorking();

    const mascot = getWidgetShadowRoot().querySelector('.mascot') as HTMLButtonElement;
    expect(mascot.tagName).toBe('BUTTON');
    expect(mascot.getAttribute('type')).toBe('button');
    expect(mascot.getAttribute('aria-label')).toContain('停止');

    mascot.click();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('auto-hides the selection bubble after a short delay', async () => {
    vi.useFakeTimers();
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body>
          <p id="target">This is another selectable sentence with enough characters.</p>
        </body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    overlay.setTargetLanguage('ko');
    overlay.attachSelectionListener();

    selectElementContents(document.getElementById('target') as HTMLElement);
    document.dispatchEvent(new Event('selectionchange'));
    await vi.advanceTimersByTimeAsync(300);

    const shadowRoot = getWidgetShadowRoot();
    const bubble = shadowRoot.querySelector('.bubble') as HTMLDivElement;
    expect(bubble.classList.contains('visible')).toBe(true);
    expect(shadowRoot.textContent).toContain('韓国語');

    await vi.advanceTimersByTimeAsync(8000);
    expect(bubble.classList.contains('visible')).toBe(false);
  });

  it('offers resume guidance when resting after a user stop', () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body></body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    const onStartTranslation = vi.fn();
    overlay.onStartTranslation = onStartTranslation;
    overlay.setTargetLanguage('ja');
    overlay.setResting('翻訳を止めました。', 0, { resumeAvailable: true });

    const mascot = getWidgetShadowRoot().querySelector('.mascot') as HTMLButtonElement;
    expect(mascot.getAttribute('aria-label')).toContain('再開');
    const bubbleAction = getWidgetShadowRoot().querySelector('.bubble-action') as HTMLButtonElement;
    expect(bubbleAction.textContent).toBe('再開');

    mascot.click();
    expect(onStartTranslation).toHaveBeenCalledTimes(1);
  });

  it('treats completed_with_warnings as a reviewable resting state, not done', () => {
    setDocumentHtml(`
      <!DOCTYPE html>
      <html lang="en">
        <body></body>
      </html>
    `);

    const overlay = new TranslationOverlay(document);
    const onFocusNextWarning = vi.fn();
    overlay.onFocusNextWarning = onFocusNextWarning;
    overlay.show('completed_with_warnings', '2箇所はそのまま残っています。', 100);

    const host = getWidgetHost();
    expect(host.dataset.widgetState).toBe('resting');
    expect(host.dataset.restingAction).toBe('review-warnings');

    const bubbleAction = getWidgetShadowRoot().querySelector('.bubble-action') as HTMLButtonElement;
    expect(bubbleAction.textContent).toBe('次へ');
    bubbleAction.click();

    expect(onFocusNextWarning).toHaveBeenCalledTimes(1);
  });
});
