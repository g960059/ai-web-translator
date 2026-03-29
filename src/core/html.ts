import type { TranslationContentMode, TranslationStyle } from '../shared/types';

export interface PreparedContent {
  content: string;
  restoreMap: Record<string, string>;
}

export interface PlaceholderRichTextContent {
  content: string;
  tagMap: Record<string, string>;
  wrapperPrefix?: string;
  wrapperSuffix?: string;
}

export interface ProtectedHtmlContent {
  content: string;
  htmlMap: Record<string, string>;
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
const PLACEHOLDER_WRAPPABLE_BLOCK_TAGS = new Set([
  'P',
  'LI',
  'DD',
  'DT',
  'BLOCKQUOTE',
  'FIGCAPTION',
]);
const PLACEHOLDER_RICH_TEXT_TAGS = new Set([
  'A',
  'ABBR',
  'B',
  'CITE',
  'EM',
  'I',
  'MARK',
  'Q',
  'S',
  'SMALL',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'TIME',
  'U',
]);
const PREPARED_ATTR_MARKER_NAME = 'x';
const PLACEHOLDER_MARKER_NAME = 't';
const PROTECTED_HTML_MARKER_NAME = 'x';
const PLACEHOLDER_MARKER_PATTERN = /\[\[\s*(\/?)\s*t(\d+)\s*\]\]/gi;
const PROTECTED_HTML_MARKER_PATTERN = /\[\[\s*x(\d+)\s*\]\]/gi;
const PLACEHOLDER_RICH_TEXT_DISALLOWED_SELECTOR =
  'math, table, pre, code, ruby, img, picture, video, audio, iframe, svg, form, input, select, textarea, button, br, hr, p, div, section, article, header, footer, aside, nav, ul, ol, li, dl, dt, dd, figure, figcaption, h1, h2, h3, h4, h5, h6, sup, .reference, .references, .reflist, .mwe-math-element, .mwe-math-fallback-image-inline, .mwe-math-fallback-image-display, a[href^=\"#cite_note\"], a[href^=\"#cite_ref\"]';
const PROTECTED_HTML_SELECTOR = 'math, .mwe-math-element, img.mw-file-element';

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
      return `<${tagName} ${PREPARED_ATTR_MARKER_NAME}=${markerId}>`;
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
    /<([a-z0-9-]+)\s+x\s*=\s*"?(\d+)"?\s*>/gi,
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

export function setElementHtmlContent(
  element: HTMLElement,
  content: string,
  options: { sanitize?: boolean } = {},
): void {
  const nextContent = options.sanitize ? sanitizeTranslatedHtml(content) : content;

  if (!isXmlLikeDocument(element.ownerDocument)) {
    element.innerHTML = nextContent;
    return;
  }

  replaceXmlLikeElementChildren(element, nextContent);
}

export function supportsPlaceholderRichTextHtml(html: string): boolean {
  return Boolean(preparePlaceholderRichTextForTranslation(html));
}

export function preparePlaceholderRichTextForTranslation(
  html: string,
): PlaceholderRichTextContent | null {
  const parsed = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const container = parsed.body.firstElementChild as HTMLElement | null;
  if (!container) {
    return null;
  }

  const directPlaceholder = buildPlaceholderRichTextContent(container);
  if (directPlaceholder) {
    return directPlaceholder;
  }

  const wrappedPlaceholder = buildWrappedPlaceholderRichTextContent(container);
  if (wrappedPlaceholder) {
    return wrappedPlaceholder;
  }

  return null;
}

export function restorePlaceholderRichText(
  content: string,
  tagMap: Record<string, string>,
): string {
  const normalizedMarkers = content.replace(
    PLACEHOLDER_MARKER_PATTERN,
    (_match, closingSlash: string, id: string) =>
      closingSlash ? `[[/${PLACEHOLDER_MARKER_NAME}${id}]]` : `[[${PLACEHOLDER_MARKER_NAME}${id}]]`,
  );

  return Object.entries(tagMap).reduce(
    (restored, [token, html]) => restored.split(token).join(html),
    normalizedMarkers,
  );
}

export function protectAtomicHtmlForTranslation(html: string): ProtectedHtmlContent | null {
  const parsed = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const container = parsed.body.firstElementChild as HTMLElement | null;
  if (!container) {
    return null;
  }

  const htmlMap: Record<string, string> = {};
  let nextId = 0;
  const protectedNodes = Array.from(
    container.querySelectorAll<HTMLElement>(PROTECTED_HTML_SELECTOR),
  ).filter((element) => !element.parentElement?.closest(PROTECTED_HTML_SELECTOR));

  protectedNodes.forEach((element) => {
    const marker = `[[${PROTECTED_HTML_MARKER_NAME}${nextId++}]]`;
    htmlMap[marker] = element.outerHTML;
    element.replaceWith(parsed.createTextNode(marker));
  });

  if (Object.keys(htmlMap).length === 0) {
    return null;
  }

  return {
    content: container.innerHTML,
    htmlMap,
  };
}

export function restoreProtectedHtml(content: string, htmlMap: Record<string, string>): string {
  const normalizedMarkers = content.replace(
    PROTECTED_HTML_MARKER_PATTERN,
    (_match, id: string) => `[[${PROTECTED_HTML_MARKER_NAME}${id}]]`,
  );

  return Object.entries(htmlMap).reduce(
    (restored, [token, html]) => restored.split(token).join(html),
    normalizedMarkers,
  );
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

function serializePlaceholderRichTextNode(
  node: ChildNode,
  tagMap: Record<string, string>,
  nextId: () => number,
): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }

  if (!(node instanceof HTMLElement)) {
    return '';
  }

  if (!PLACEHOLDER_RICH_TEXT_TAGS.has(node.tagName)) {
    return '';
  }

  const id = String(nextId());
  const openToken = `[[${PLACEHOLDER_MARKER_NAME}${id}]]`;
  const closeToken = `[[/${PLACEHOLDER_MARKER_NAME}${id}]]`;
  tagMap[openToken] = buildOpeningTag(node);
  tagMap[closeToken] = `</${node.tagName.toLowerCase()}>`;

  const inner = Array.from(node.childNodes)
    .map((child) => serializePlaceholderRichTextNode(child, tagMap, nextId))
    .join('');

  return `${openToken}${inner}${closeToken}`;
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

function buildPlaceholderRichTextContent(
  container: HTMLElement,
): PlaceholderRichTextContent | null {
  if (container.querySelector(PLACEHOLDER_RICH_TEXT_DISALLOWED_SELECTOR)) {
    return null;
  }

  const tagMap: Record<string, string> = {};
  let nextId = 0;
  const content = Array.from(container.childNodes)
    .map((node) => serializePlaceholderRichTextNode(node, tagMap, () => nextId++))
    .join('');

  const normalized = normalizeText(content);
  const hasProtectedMarkers = containsProtectedHtmlMarker(normalized);
  if (!normalized || (Object.keys(tagMap).length === 0 && !hasProtectedMarkers)) {
    return null;
  }

  return {
    content: normalized,
    tagMap,
  };
}

function buildWrappedPlaceholderRichTextContent(
  container: HTMLElement,
): PlaceholderRichTextContent | null {
  if (container.childElementCount !== 1) {
    return null;
  }

  const soleChild = container.firstElementChild as HTMLElement | null;
  if (!soleChild || !PLACEHOLDER_WRAPPABLE_BLOCK_TAGS.has(soleChild.tagName)) {
    return null;
  }

  const normalizedContainerText = normalizeText(container.textContent ?? '');
  const normalizedChildText = normalizeText(soleChild.textContent ?? '');
  if (!normalizedContainerText || normalizedContainerText !== normalizedChildText) {
    return null;
  }

  if (soleChild.querySelector(PLACEHOLDER_RICH_TEXT_DISALLOWED_SELECTOR)) {
    return null;
  }

  const inner = buildPlaceholderRichTextContent(soleChild);
  if (!inner) {
    return null;
  }

  return {
    content: inner.content,
    tagMap: inner.tagMap,
    wrapperPrefix: buildOpeningTag(soleChild),
    wrapperSuffix: `</${soleChild.tagName.toLowerCase()}>`,
  };
}

function containsProtectedHtmlMarker(content: string): boolean {
  const matches = content.matchAll(new RegExp(PROTECTED_HTML_MARKER_PATTERN.source, 'gi'));
  return !matches.next().done;
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

function isXmlLikeDocument(documentRef: Document): boolean {
  const contentType = (documentRef.contentType || '').toLowerCase();
  return contentType.includes('xml') && contentType !== 'text/html';
}

function replaceXmlLikeElementChildren(element: HTMLElement, content: string): void {
  const parsed = new DOMParser().parseFromString(`<div>${content}</div>`, 'text/html');
  const container = parsed.body.firstElementChild as HTMLElement | null;
  const fragment = element.ownerDocument.createDocumentFragment();

  if (container) {
    Array.from(container.childNodes).forEach((node) => {
      const cloned = cloneMarkupNodeIntoDocument(node, element.ownerDocument);
      if (cloned) {
        fragment.appendChild(cloned);
      }
    });
  }

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  element.appendChild(fragment);
}

function cloneMarkupNodeIntoDocument(node: ChildNode, targetDocument: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return targetDocument.createTextNode(node.textContent ?? '');
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return targetDocument.createComment(node.textContent ?? '');
  }

  if (!(node instanceof Element)) {
    return null;
  }

  const namespace = node.namespaceURI || targetDocument.documentElement?.namespaceURI || null;
  const localName = node.localName || node.tagName.toLowerCase();
  const clone = namespace
    ? targetDocument.createElementNS(namespace, localName)
    : targetDocument.createElement(localName);

  Array.from(node.attributes).forEach((attribute) => {
    if (attribute.namespaceURI) {
      clone.setAttributeNS(attribute.namespaceURI, attribute.name, attribute.value);
      return;
    }
    clone.setAttribute(attribute.name, attribute.value);
  });

  Array.from(node.childNodes).forEach((child) => {
    const clonedChild = cloneMarkupNodeIntoDocument(child, targetDocument);
    if (clonedChild) {
      clone.appendChild(clonedChild);
    }
  });

  return clone;
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
