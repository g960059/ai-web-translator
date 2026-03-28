import type { TranslationContentMode, TranslationStyle } from '../shared/types';

export interface PreparedContent {
  content: string;
  restoreMap: Record<string, string>;
}

const ATOMIC_HTML_SELECTOR = 'math, table, pre, code, ruby, img, picture, video, audio, iframe, svg';
const DANGEROUS_TRANSLATED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'META',
  'LINK',
  'BASE',
  'FORM',
  'INPUT',
  'BUTTON',
  'TEXTAREA',
  'SELECT',
  'OPTION',
]);
const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'formaction', 'action', 'poster']);
const SPLITTABLE_HTML_CONTAINER_TAGS = new Set([
  'DIV',
  'SECTION',
  'ARTICLE',
  'BLOCKQUOTE',
  'P',
  'LI',
  'DD',
  'DT',
  'FIGCAPTION',
  'SPAN',
]);

export function normalizeHtml(html: string): string {
  return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
}

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function prepareContentForTranslation(
  content: string,
  contentMode: TranslationContentMode,
  style: TranslationStyle,
): PreparedContent {
  if (contentMode === 'text' || prefersFaithfulHtml(style)) {
    return {
      content,
      restoreMap: {},
    };
  }

  const restoreMap: Record<string, string> = {};
  let nextId = 0;

  const preparedHtml = content.replace(
    /<([a-z0-9-]+)(\s+[^>]+)>/gi,
    (match, tagName: string, attributes: string) => {
      if (!attributes.trim()) {
        return match;
      }

      const markerId = String(nextId++);
      restoreMap[markerId] = attributes;
      return `<${tagName} data-ai-tx-attrs="${markerId}">`;
    },
  );

  return {
    content: preparedHtml,
    restoreMap,
  };
}

function prefersFaithfulHtml(style: TranslationStyle): boolean {
  return style === 'precise' || style === 'source-like';
}

export function restorePreparedContent(
  content: string,
  contentMode: TranslationContentMode,
  restoreMap: Record<string, string>,
): string {
  if (contentMode === 'text' || Object.keys(restoreMap).length === 0) {
    return content;
  }

  return content.replace(
    /<([a-z0-9-]+)\s+data-ai-tx-attrs="(\d+)"\s*>/gi,
    (match, tagName: string, markerId: string) => {
      const attributes = restoreMap[markerId];
      if (!attributes) {
        return match;
      }
      return `<${tagName}${attributes}>`;
    },
  );
}

export function sanitizeTranslatedHtml(content: string): string {
  const parsed = new DOMParser().parseFromString(`<div>${content}</div>`, 'text/html');
  const container = parsed.body.firstElementChild as HTMLElement | null;
  if (!container) {
    return content;
  }

  sanitizeTranslatedNodeTree(container);
  return container.innerHTML;
}

export function splitHtmlIntoSafeSegments(
  html: string,
  maxChars: number,
): string[] {
  const normalized = normalizeHtml(html);
  if (normalized.length <= maxChars) {
    return [html];
  }

  const parsed = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const container = parsed.body.firstElementChild as HTMLElement | null;
  if (!container) {
    return [html];
  }

  const segments = packHtmlPieces(splitHtmlChildNodes(Array.from(container.childNodes), maxChars), maxChars);
  return segments.length > 1 ? segments : [html];
}

function splitHtmlChildNodes(nodes: ChildNode[], maxChars: number): string[] {
  const pieces: string[] = [];

  nodes.forEach((node) => {
    pieces.push(...splitHtmlNode(node, maxChars));
  });

  return pieces.filter((piece) => normalizeHtml(piece).length > 0);
}

function splitHtmlNode(node: ChildNode, maxChars: number): string[] {
  const serialized = serializeHtmlNode(node);
  if (normalizeHtml(serialized).length <= maxChars) {
    return [serialized];
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return splitTextForHtml(node.textContent ?? '', maxChars);
  }

  if (!(node instanceof Element)) {
    return [serialized];
  }

  const element = node as HTMLElement;
  if (
    !SPLITTABLE_HTML_CONTAINER_TAGS.has(element.tagName) ||
    element.matches(ATOMIC_HTML_SELECTOR) ||
    element.querySelector(ATOMIC_HTML_SELECTOR) ||
    element.childNodes.length <= 1
  ) {
    return [serialized];
  }

  const openingTag = buildOpeningTag(element);
  const closingTag = `</${element.tagName.toLowerCase()}>`;
  const budget = maxChars - openingTag.length - closingTag.length;
  if (budget < 80) {
    return [serialized];
  }

  const childSegments = packHtmlPieces(splitHtmlChildNodes(Array.from(element.childNodes), budget), budget);
  if (childSegments.length <= 1) {
    return [serialized];
  }

  return childSegments.map((segment) => `${openingTag}${segment}${closingTag}`);
}

function packHtmlPieces(pieces: string[], maxChars: number): string[] {
  const segments: string[] = [];
  let current = '';

  pieces.forEach((piece) => {
    const candidate = current ? `${current}${piece}` : piece;
    if (normalizeHtml(candidate).length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) {
      segments.push(current);
    }
    current = piece;
  });

  if (current) {
    segments.push(current);
  }

  return segments;
}

function buildOpeningTag(element: HTMLElement): string {
  const attributes = Array.from(element.attributes)
    .map((attribute) => ` ${attribute.name}="${escapeHtmlAttribute(attribute.value)}"`)
    .join('');
  return `<${element.tagName.toLowerCase()}${attributes}>`;
}

function serializeHtmlNode(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }

  if (node instanceof Element) {
    return node.outerHTML;
  }

  return '';
}

function splitTextForHtml(text: string, maxChars: number): string[] {
  const normalized = normalizeText(text);
  if (normalized.length <= maxChars) {
    return [normalized];
  }

  const chunks: string[] = [];
  const sentences =
    normalized.match(/[^.!?。！？]+(?:[.!?。！？]+|$)/g)?.map((sentence) => sentence.trim()) ??
    [normalized];
  let current = '';

  sentences.forEach((sentence) => {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) {
      chunks.push(current);
    }

    if (sentence.length <= maxChars) {
      current = sentence;
      return;
    }

    for (let start = 0; start < sentence.length; start += maxChars) {
      const piece = sentence.slice(start, start + maxChars).trim();
      if (piece) {
        chunks.push(piece);
      }
    }
    current = '';
  });

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function sanitizeTranslatedNodeTree(root: ParentNode): void {
  Array.from(root.children).forEach((element) => {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    if (DANGEROUS_TRANSLATED_TAGS.has(element.tagName)) {
      element.remove();
      return;
    }

    sanitizeTranslatedAttributes(element);
    sanitizeTranslatedNodeTree(element);
  });
}

function sanitizeTranslatedAttributes(element: HTMLElement): void {
  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    if (
      name.startsWith('on') ||
      name === 'style' ||
      name === 'srcdoc' ||
      name === 'xmlns'
    ) {
      element.removeAttribute(attribute.name);
      return;
    }

    if (URL_ATTRIBUTES.has(name) && isUnsafeTranslatedUrl(attribute.value)) {
      element.removeAttribute(attribute.name);
    }
  });
}

function isUnsafeTranslatedUrl(value: string): boolean {
  const normalized = value.replace(/\u0000/g, '').trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('file:') ||
    (normalized.startsWith('data:') && !normalized.startsWith('data:image/'))
  );
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
