import { localizeRuntimeError } from '../shared/error-messages';
import { formatLanguageLabel } from '../shared/languages';
import type { TranslationStatus, WidgetState } from '../shared/types';
import { WIDGET_SVGS } from './widget-svgs';

type BubbleActionKind = 'none' | 'start-page' | 'start-selection' | 'retry';
type RestingActionKind = 'none' | 'resume-page';

export class TranslationOverlay {
  private readonly host: HTMLDivElement;
  private readonly shadowRoot: ShadowRoot;
  private readonly container: HTMLDivElement;
  private readonly mascot: HTMLButtonElement;
  private readonly bubble: HTMLDivElement;
  private readonly bubbleText: HTMLSpanElement;
  private readonly bubbleAction: HTMLButtonElement;

  private bubbleTimeoutId: number | null = null;
  private doneTransitionId: number | null = null;
  private currentState: WidgetState = 'off';
  private currentBubbleAction: BubbleActionKind = 'none';
  private restingAction: RestingActionKind = 'none';
  private currentErrorMessage = '';
  private selectionListenerAttached = false;
  private targetLanguage = chrome.i18n?.getUILanguage?.() ?? 'ja';

  onStartTranslation: (() => void) | null = null;
  onTranslateSelection: (() => void) | null = null;
  onRetry: (() => void) | null = null;
  onCancel: (() => void) | null = null;

  constructor(private readonly documentRef: Document) {
    this.host = documentRef.createElement('div');
    this.host.dataset.aiWebTranslatorWidget = 'true';
    this.host.style.position = 'fixed';
    this.host.style.right = '20px';
    this.host.style.bottom = '20px';
    this.host.style.zIndex = '2147483646';
    this.host.style.pointerEvents = 'none';
    documentRef.body.appendChild(this.host);

    this.shadowRoot = this.host.attachShadow({ mode: 'open' });

    const wrapper = documentRef.createElement('div');
    wrapper.innerHTML = `
      <style>
        :host {
          all: initial;
        }
        .widget-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          pointer-events: auto;
        }
        .bubble {
          position: absolute;
          bottom: 52px;
          right: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          box-sizing: border-box;
          width: 280px;
          max-width: calc(100vw - 88px);
          min-width: 188px;
          padding: 10px 14px;
          border-radius: 16px 16px 4px 16px;
          background: rgba(255, 251, 241, 0.97);
          border: 1px solid rgba(127, 88, 12, 0.14);
          box-shadow: 0 8px 24px rgba(121, 87, 23, 0.14);
          font-family: "Hiragino Sans", "Noto Sans JP", "Yu Gothic", sans-serif;
          font-size: 12.5px;
          line-height: 1.55;
          color: #4a3312;
          opacity: 0;
          transform: translateY(4px) scale(0.95);
          transition: opacity 200ms ease, transform 200ms ease;
          pointer-events: none;
          white-space: normal;
          text-wrap: pretty;
        }
        .bubble.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .bubble[data-has-action="false"] {
          display: block;
          width: 260px;
          max-width: calc(100vw - 88px);
          min-width: 0;
        }
        .bubble-text {
          min-width: 0;
          overflow-wrap: break-word;
          word-break: normal;
        }
        .bubble-action {
          flex-shrink: 0;
          align-self: center;
          border: none;
          border-radius: 999px;
          padding: 5px 10px;
          background: linear-gradient(180deg, #f6c649, #e5aa22);
          color: #4a3312;
          font: inherit;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 120ms ease, opacity 120ms ease;
        }
        .bubble-action:hover {
          transform: translateY(-1px);
        }
        .bubble-action:empty {
          display: none;
        }
        .mascot {
          width: 44px;
          height: 44px;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 12px;
          transition: transform 200ms ease, box-shadow 200ms ease;
          filter: drop-shadow(0 4px 12px rgba(121, 87, 23, 0.18));
        }
        .mascot:hover {
          transform: scale(1.08);
        }
        .mascot:active {
          transform: scale(0.96);
        }
        .mascot:focus-visible,
        .bubble-action:focus-visible {
          outline: 2px solid rgba(239, 184, 52, 0.72);
          outline-offset: 2px;
        }
        .mascot svg {
          display: block;
          width: 100%;
          height: 100%;
        }
        @keyframes widget-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mascot .spin-arc {
          transform-origin: 20px 20px;
          animation: widget-spin 1.2s linear infinite;
        }
        @keyframes widget-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .mascot[data-state="working"] {
          animation: widget-bounce 1s ease-in-out infinite;
        }
        @keyframes widget-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .mascot[data-state="done"] {
          animation: widget-pulse 0.5s ease-out;
        }

        /* ── Steam animation for resting tea cup ── */
        @keyframes widget-steam {
          0% { opacity: 0.5; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
        .mascot .steam1 {
          animation: widget-steam 2s ease-out infinite;
        }
        .mascot .steam2 {
          animation: widget-steam 2s ease-out 0.6s infinite;
        }
        .widget-container[data-hidden="true"] {
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease;
        }
        .widget-container[data-hidden="false"] {
          opacity: 1;
          transition: opacity 300ms ease;
        }
      </style>
      <div class="widget-container" data-hidden="true" role="status" aria-live="polite">
        <div class="bubble">
          <span class="bubble-text"></span>
          <button class="bubble-action" type="button"></button>
        </div>
        <button class="mascot" type="button" data-state="off"></button>
      </div>
    `;

    this.shadowRoot.appendChild(wrapper);

    this.container = wrapper.querySelector('.widget-container') as HTMLDivElement;
    this.mascot = wrapper.querySelector('.mascot') as HTMLButtonElement;
    this.bubble = wrapper.querySelector('.bubble') as HTMLDivElement;
    this.bubbleText = wrapper.querySelector('.bubble-text') as HTMLSpanElement;
    this.bubbleAction = wrapper.querySelector('.bubble-action') as HTMLButtonElement;

    this.mascot.innerHTML = WIDGET_SVGS.off;
    this.mascot.setAttribute('aria-label', getMascotAriaLabel('off', 'none'));
    this.bubble.dataset.hasAction = 'false';
    this.bubbleAction.hidden = true;
    this.mascot.addEventListener('click', () => this.handleMascotClick());
    this.bubbleAction.addEventListener('click', (event) => {
      event.stopPropagation();
      this.triggerBubbleAction();
    });
    this.syncDebugState();
  }

  show(status: TranslationStatus, message: string, progressPercent: number): void {
    this.setVisible(true);
    this.applyTranslationStatus(status, message, progressPercent);
  }

  update(status: TranslationStatus, message: string, progressPercent: number): void {
    this.applyTranslationStatus(status, message, progressPercent);
  }

  complete(message: string): void {
    this.setDone(message);
  }

  fail(message: string, retryable = true): void {
    this.setError(message, retryable);
  }

  hide(): void {
    this.clearBubbleTimeout();
    this.clearDoneTransition();
    this.hideBubble();
    this.restingAction = 'none';
    this.setState('off');
    this.currentErrorMessage = '';
    this.setVisible(false);
  }

  setVisible(visible: boolean): void {
    this.container.dataset.hidden = visible ? 'false' : 'true';
    this.host.dataset.visible = visible ? 'true' : 'false';
  }

  setTargetLanguage(targetLanguage: string): void {
    this.targetLanguage = targetLanguage.trim() || (chrome.i18n?.getUILanguage?.() ?? 'ja');
  }

  showIdleIcon(): void {
    this.clearDoneTransition();
    this.hideBubble();
    this.restingAction = 'none';
    this.setVisible(true);
    this.setState('off');
    this.currentErrorMessage = '';
  }

  setWorking(): void {
    this.clearDoneTransition();
    this.hideBubble();
    this.restingAction = 'none';
    this.setVisible(true);
    this.setState('working');
    this.currentErrorMessage = '';
  }

  setRetrying(message = 'もう一度試しています…'): void {
    this.clearDoneTransition();
    this.restingAction = 'none';
    this.setVisible(true);
    this.setState('retrying');
    this.currentErrorMessage = '';
    this.showBubble(message, '', 0, 'none');
  }

  setResting(message = '', autoHideMs = 0, options?: { resumeAvailable?: boolean }): void {
    this.clearDoneTransition();
    this.setVisible(true);
    this.restingAction = options?.resumeAvailable ? 'resume-page' : 'none';
    this.setState('resting');
    this.currentErrorMessage = '';
    if (message) {
      this.showBubble(
        message,
        this.restingAction === 'resume-page' ? '再開' : '',
        autoHideMs,
        this.restingAction === 'resume-page' ? 'start-page' : 'none',
      );
      return;
    }
    this.hideBubble();
  }

  setDone(message = ''): void {
    this.clearDoneTransition();
    this.restingAction = 'none';
    this.setVisible(true);
    this.setState('done');
    this.currentErrorMessage = '';
    if (message) {
      this.showBubble(message, '', 2200, 'none');
    } else {
      this.hideBubble();
    }
    this.doneTransitionId = window.setTimeout(() => {
      this.doneTransitionId = null;
      this.setResting();
    }, 2200);
  }

  setError(message: string, retryable = true): void {
    this.clearDoneTransition();
    this.restingAction = 'none';
    this.setVisible(true);
    this.setState('error');
    this.currentErrorMessage = localizeRuntimeError(message);
    this.showBubble(
      this.currentErrorMessage,
      retryable ? '再試行' : '',
      0,
      retryable ? 'retry' : 'none',
    );
  }

  showNotice(message: string, autoHideMs = 0): void {
    this.setVisible(true);
    this.showBubble(message, '', autoHideMs, 'none');
  }

  clearNotice(): void {
    if (this.currentBubbleAction === 'none') {
      this.hideBubble();
    }
  }

  showPromptBubble(targetLanguage: string, autoHideMs = 3000): void {
    this.clearDoneTransition();
    this.restingAction = 'none';
    this.setVisible(true);
    this.setState('off');
    this.showBubble(buildPromptCopy(targetLanguage), '読む', autoHideMs, 'start-page');
  }

  showSelectionBubble(): void {
    this.clearDoneTransition();
    this.setVisible(true);
    this.showBubble(buildSelectionCopy(this.targetLanguage), '読む', 8000, 'start-selection');
  }

  detectAndPrompt(targetLanguage: string): void {
    this.setTargetLanguage(targetLanguage);
    const lang = this.documentRef.documentElement.lang?.toLowerCase() ?? '';
    const normalizedTarget = targetLanguage.trim().toLowerCase();
    const targetPrimary = normalizedTarget.split('-')[0] || normalizedTarget;
    const isSameAsTarget = targetPrimary ? lang.startsWith(targetPrimary) : false;

    if (isSameAsTarget) {
      return;
    }

    const article = this.documentRef.querySelector('article');
    const bodyText = this.documentRef.body?.innerText ?? '';
    const hasSubstantialContent = article !== null || bodyText.length > 500;

    if (!hasSubstantialContent) {
      return;
    }

    this.showPromptBubble(targetLanguage, 4000);
  }

  attachSelectionListener(): void {
    if (this.selectionListenerAttached) {
      return;
    }
    this.selectionListenerAttached = true;

    let debounceId: number | null = null;
    this.documentRef.addEventListener('selectionchange', () => {
      if (debounceId !== null) {
        window.clearTimeout(debounceId);
      }
      debounceId = window.setTimeout(() => {
        debounceId = null;
        this.handleSelectionChange();
      }, 250);
    });
  }

  private applyTranslationStatus(
    status: TranslationStatus,
    message: string,
    _progressPercent: number,
  ): void {
    switch (status) {
      case 'scanning':
      case 'queued':
      case 'translating':
        this.setWorking();
        return;
      case 'retrying':
        this.setRetrying(message || 'もう一度試しています…');
        return;
      case 'lazy':
        this.setResting();
        return;
      case 'completed':
        this.setDone(message);
        return;
      case 'failed':
        this.setError(message);
        return;
      case 'cancelled':
      case 'idle':
      default:
        this.showIdleIcon();
    }
  }

  private setState(state: WidgetState): void {
    if (state === this.currentState) {
      this.updateMascotAriaLabel();
      this.syncDebugState();
      return;
    }
    this.currentState = state;
    this.mascot.dataset.state = state;
    this.mascot.innerHTML = WIDGET_SVGS[state];
    this.updateMascotAriaLabel();
    this.syncDebugState();
  }

  private showBubble(
    text: string,
    actionLabel: string,
    autoHideMs: number,
    action: BubbleActionKind,
  ): void {
    this.clearBubbleTimeout();
    this.currentBubbleAction = action;
    this.bubble.dataset.hasAction = actionLabel ? 'true' : 'false';
    this.bubbleText.textContent = text;
    this.bubbleAction.textContent = actionLabel;
    this.bubbleAction.hidden = actionLabel.length === 0;
    this.bubble.classList.add('visible');
    this.syncDebugState();

    if (autoHideMs > 0) {
      this.bubbleTimeoutId = window.setTimeout(() => {
        this.hideBubble();
      }, autoHideMs);
    }
  }

  private hideBubble(): void {
    this.clearBubbleTimeout();
    this.currentBubbleAction = 'none';
    this.bubble.dataset.hasAction = 'false';
    this.bubble.classList.remove('visible');
    this.bubbleText.textContent = '';
    this.bubbleAction.textContent = '';
    this.bubbleAction.hidden = true;
    this.syncDebugState();
  }

  private triggerBubbleAction(): void {
    const action = this.currentBubbleAction;
    this.hideBubble();

    switch (action) {
      case 'start-page':
        this.onStartTranslation?.();
        break;
      case 'start-selection':
        this.onTranslateSelection?.();
        break;
      case 'retry':
        this.onRetry?.();
        break;
      case 'none':
      default:
        break;
    }
  }

  private handleMascotClick(): void {
    if (this.currentBubbleAction !== 'none' && this.bubble.classList.contains('visible')) {
      this.triggerBubbleAction();
      return;
    }

    switch (this.currentState) {
      case 'off':
        this.showPromptBubble(this.targetLanguage, 0);
        break;
      case 'error':
        this.showBubble(this.currentErrorMessage || 'もう一度試しますか？', '再試行', 0, 'retry');
        break;
      case 'working':
        this.onCancel?.();
        break;
      case 'retrying':
        this.onCancel?.();
        break;
      case 'resting':
        if (this.restingAction === 'resume-page') {
          this.onStartTranslation?.();
          break;
        }
        this.showBubble('続きを読み進めると、自動で訳していきます。', '', 1600, 'none');
        break;
      case 'done':
        this.showBubble('いま見えているところは訳し終えました。', '', 1600, 'none');
        break;
    }
  }

  private handleSelectionChange(): void {
    if (this.currentState === 'working' || this.currentState === 'retrying') {
      return;
    }

    const selection = this.documentRef.getSelection();
    const text = selection?.toString().trim() ?? '';

    if (text.length > 10) {
      this.showSelectionBubble();
      return;
    }

    if (this.currentBubbleAction === 'start-selection') {
      this.hideBubble();
    }
  }

  private clearBubbleTimeout(): void {
    if (this.bubbleTimeoutId !== null) {
      window.clearTimeout(this.bubbleTimeoutId);
      this.bubbleTimeoutId = null;
    }
  }

  private clearDoneTransition(): void {
    if (this.doneTransitionId !== null) {
      window.clearTimeout(this.doneTransitionId);
      this.doneTransitionId = null;
    }
  }

  private syncDebugState(): void {
    this.host.dataset.widgetState = this.currentState;
    this.host.dataset.bubbleAction = this.currentBubbleAction;
    this.host.dataset.bubbleVisible = this.bubble.classList.contains('visible') ? 'true' : 'false';
    this.host.dataset.restingAction = this.restingAction;
  }

  private updateMascotAriaLabel(): void {
    this.mascot.setAttribute('aria-label', getMascotAriaLabel(this.currentState, this.restingAction));
  }
}

function buildPromptCopy(targetLanguage: string): string {
  const label = formatLanguageLabel(targetLanguage);
  if (label === '未設定') {
    return '翻訳しますか？';
  }

  return `${label}で読みますか？`;
}

function buildSelectionCopy(targetLanguage: string): string {
  const label = formatLanguageLabel(targetLanguage);
  if (label === '未設定') {
    return 'この部分を翻訳しますか？';
  }

  return `この部分を${label}で読みますか？`;
}

function getMascotAriaLabel(state: WidgetState, restingAction: RestingActionKind): string {
  switch (state) {
    case 'working':
      return '翻訳中です。押すと停止します。';
    case 'retrying':
      return '再試行中です。押すと停止します。';
    case 'resting':
      return restingAction === 'resume-page'
        ? '翻訳は停止中です。押すと続きを再開できます。'
        : '翻訳は待機中です。';
    case 'error':
      return '翻訳に失敗しました。押すと再試行できます。';
    case 'done':
      return 'いま見えているところは翻訳済みです。';
    case 'off':
    default:
      return '翻訳ウィジェットです。押すと読み始める案内を開きます。';
  }
}
