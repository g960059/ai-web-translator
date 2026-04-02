export interface OriginalLookupResult {
  text: string;
  html: string;
  mode: 'text' | 'html';
}

const SHOW_DELAY_MS = 300;
const HIDE_DELAY_MS = 100;
const TOOLTIP_GAP_PX = 6;
const ANCESTOR_WALK_LIMIT = 10;
const BLOCK_ELEMENTS = new Set([
  'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE', 'NAV', 'HEADER', 'FOOTER',
  'TABLE', 'FORM', 'FIELDSET', 'UL', 'OL', 'DL', 'BLOCKQUOTE', 'FIGURE',
]);

const TOOLTIP_CSS = `
:host { all: initial; }

.aiwt-tooltip {
  position: fixed;
  z-index: 2147483645;
  max-width: 480px;
  max-height: 300px;
  overflow: hidden;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 251, 241, 0.97);
  color: #4a3312;
  font: 13px/1.6 "Hiragino Sans", "Noto Sans JP", sans-serif;
  box-shadow: 0 4px 16px rgba(61, 46, 26, 0.15);
  border: 1px solid rgba(192, 139, 26, 0.18);
  pointer-events: none;
  opacity: 0;
  transition: opacity 150ms ease;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.aiwt-tooltip[data-visible="true"] {
  opacity: 1;
}
`;

export class OriginalTextTooltip {
  private readonly host: HTMLDivElement;
  private readonly shadowRoot: ShadowRoot;
  private readonly tooltip: HTMLDivElement;
  private showTimerId: number | null = null;
  private hideTimerId: number | null = null;
  private currentTarget: HTMLElement | null = null;
  private enabled = true;
  private readonly onMouseOver: (e: Event) => void;
  private readonly onMouseOut: (e: Event) => void;
  private readonly onScroll: () => void;

  constructor(
    private readonly documentRef: Document,
    private readonly lookupOriginal: (el: HTMLElement) => OriginalLookupResult | null,
  ) {
    this.host = documentRef.createElement('div');
    this.host.dataset.aiWebTranslatorTooltip = 'true';
    this.host.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483645;pointer-events:none;';
    documentRef.body.appendChild(this.host);

    this.shadowRoot = this.host.attachShadow({ mode: 'open' });
    const style = documentRef.createElement('style');
    style.textContent = TOOLTIP_CSS;
    this.shadowRoot.appendChild(style);

    this.tooltip = documentRef.createElement('div');
    this.tooltip.className = 'aiwt-tooltip';
    this.tooltip.setAttribute('role', 'tooltip');
    this.shadowRoot.appendChild(this.tooltip);

    this.onMouseOver = (e: Event) => this.handleMouseOver(e as MouseEvent);
    this.onMouseOut = (e: Event) => this.handleMouseOut(e as MouseEvent);
    this.onScroll = () => this.hideTooltip();

    documentRef.addEventListener('mouseover', this.onMouseOver, true);
    documentRef.addEventListener('mouseout', this.onMouseOut, true);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.hideTooltip();
      this.cancelTimers();
    }
  }

  destroy(): void {
    this.cancelTimers();
    this.hideTooltip();
    this.documentRef.removeEventListener('mouseover', this.onMouseOver, true);
    this.documentRef.removeEventListener('mouseout', this.onMouseOut, true);
    this.host.remove();
  }

  private handleMouseOver(e: MouseEvent): void {
    if (!this.enabled) return;

    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const matched = this.findTranslatedAncestor(target);
    if (!matched) return;

    if (this.currentTarget === matched.element) return;

    this.cancelTimers();
    this.showTimerId = window.setTimeout(() => {
      this.showTimerId = null;
      this.showTooltip(matched.element, matched.result);
    }, SHOW_DELAY_MS);
  }

  private handleMouseOut(e: MouseEvent): void {
    if (!this.currentTarget && this.showTimerId === null) return;

    const related = e.relatedTarget;
    if (related instanceof Node && this.host.contains(related)) return;

    this.cancelTimers();
    this.hideTimerId = window.setTimeout(() => {
      this.hideTimerId = null;
      this.hideTooltip();
    }, HIDE_DELAY_MS);
  }

  private findTranslatedAncestor(
    el: HTMLElement,
  ): { element: HTMLElement; result: OriginalLookupResult } | null {
    let current: HTMLElement | null = el;
    for (let i = 0; i < ANCESTOR_WALK_LIMIT && current; i++) {
      const result = this.lookupOriginal(current);
      if (result) return { element: current, result };
      if (BLOCK_ELEMENTS.has(current.tagName) && i > 0) break;
      current = current.parentElement;
    }
    return null;
  }

  private showTooltip(target: HTMLElement, result: OriginalLookupResult): void {
    this.currentTarget = target;

    // Always use textContent for safety — originalHtml may contain event handlers
    // from the page DOM that would execute in the extension's context via innerHTML.
    this.tooltip.textContent = result.text;

    this.positionTooltip(target);
    this.tooltip.dataset.visible = 'true';

    window.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
  }

  private hideTooltip(): void {
    this.tooltip.dataset.visible = 'false';
    this.currentTarget = null;
    window.removeEventListener('scroll', this.onScroll, true);
  }

  private positionTooltip(target: HTMLElement): void {
    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Measure tooltip size (temporarily show offscreen)
    this.tooltip.style.left = '-9999px';
    this.tooltip.style.top = '-9999px';
    this.tooltip.dataset.visible = 'true';
    const tooltipRect = this.tooltip.getBoundingClientRect();
    this.tooltip.dataset.visible = 'false';

    let top = rect.bottom + TOOLTIP_GAP_PX;
    // Flip above if not enough space below
    if (top + tooltipRect.height > vh && rect.top - TOOLTIP_GAP_PX - tooltipRect.height > 0) {
      top = rect.top - TOOLTIP_GAP_PX - tooltipRect.height;
    }

    let left = rect.left;
    // Clamp to viewport
    if (left + tooltipRect.width > vw - 8) {
      left = vw - 8 - tooltipRect.width;
    }
    if (left < 8) {
      left = 8;
    }

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  private cancelTimers(): void {
    if (this.showTimerId !== null) {
      window.clearTimeout(this.showTimerId);
      this.showTimerId = null;
    }
    if (this.hideTimerId !== null) {
      window.clearTimeout(this.hideTimerId);
      this.hideTimerId = null;
    }
  }
}
