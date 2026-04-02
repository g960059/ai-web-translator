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

const ATOMIC_HTML_SELECTOR = [
  'math',
  'table',
  'pre',
  'code',
  'ruby',
  'img',
  'picture',
  'video',
  'audio',
  'iframe',
  'svg',
  'mjx-container',
  'mjx-math',
  '.MathJax',
  '.MathJax_Display',
  '.MathJax_Preview',
  'script[type^="math/"]',
  '.katex',
  '.katex-display',
];
const ATOMIC_HTML_SELECTOR_QUERY = ATOMIC_HTML_SELECTOR.join(', ');
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
  'DIV',
  'SECTION',
  'ARTICLE',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
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
const PROTECTED_HTML_MARKER_VARIANT_BRACKETS = '[\\[\\]［］【】〔〕「」『』⟦⟧⟨⟩<>＜＞]';
const PROTECTED_PLACEHOLDER_SEGMENT_CHARS = 240;
const DENSE_PROTECTED_PLACEHOLDER_SEGMENT_CHARS = 180;
const DENSE_PROTECTED_PLACEHOLDER_MARKER_COUNT = 6;
const VERY_DENSE_PROTECTED_PLACEHOLDER_SEGMENT_CHARS = 140;
const VERY_DENSE_PROTECTED_PLACEHOLDER_MARKER_COUNT = 12;
const MAX_PROTECTED_MARKERS_PER_SEGMENT = 2;
const MAX_PROTECTED_MARKERS_PER_VERY_DENSE_SEGMENT = 1;
const PLACEHOLDER_RICH_TEXT_DISALLOWED_SELECTOR =
  'math, table, pre, code, ruby, img, picture, video, audio, iframe, svg, form, input, select, textarea, button, br, hr, p, div, section, article, header, footer, aside, nav, ul, ol, li, dl, dt, dd, figure, figcaption, h1, h2, h3, h4, h5, h6, sup, .reference, .references, .reflist, .mwe-math-element, .mwe-math-fallback-image-inline, .mwe-math-fallback-image-display, a[href^=\"#cite_note\"], a[href^=\"#cite_ref\"], mjx-container, mjx-math, .MathJax, .MathJax_Display, .MathJax_Preview, script[type^="math/"], .katex, .katex-display';
const PROTECTED_HTML_SELECTOR =
  'math, .mwe-math-element, img.mw-file-element, mjx-container, .MathJax, .MathJax_Display, .katex, .katex-display';

export function normalizeHtml(html: string): string {
  return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
}

export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extract clean text from HTML by first replacing protected elements (math,
 * images, etc.) with markers, then stripping those markers. This removes
 * MathML annotation text like `{\displaystyle V}` that would otherwise leak
 * into originalText and source hints.
 */
export function extractTextFromProtectedHtml(html: string): string {
  const protectedResult = protectAtomicHtmlForTranslation(html);
  const cleaned = protectedResult?.content ?? html;
  const withoutMarkers = cleaned.replace(/\[\[\/?[tx]\d+\]\]/gi, ' ');
  const parsed = new DOMParser().parseFromString(`<div>${withoutMarkers}</div>`, 'text/html');
  return normalizeText(parsed.body.textContent ?? '');
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

export function splitPlaceholderRichTextIntoSafeSegments(
  content: string,
  maxChars: number,
): string[] {
  const normalized = normalizeText(content);
  const protectedMarkerPieces = extractProtectedMarkerSegments(normalized);
  const protectedMarkerCount = protectedMarkerPieces.filter((piece) =>
    isProtectedMarkerPiece(piece),
  ).length;
  const veryDenseProtectedMarkers =
    protectedMarkerCount >= VERY_DENSE_PROTECTED_PLACEHOLDER_MARKER_COUNT;
  const denseProtectedMarkers = protectedMarkerCount >= DENSE_PROTECTED_PLACEHOLDER_MARKER_COUNT;
  const effectiveMaxChars =
    protectedMarkerCount > 0
      ? Math.min(
          maxChars,
          veryDenseProtectedMarkers
            ? VERY_DENSE_PROTECTED_PLACEHOLDER_SEGMENT_CHARS
            : denseProtectedMarkers
            ? DENSE_PROTECTED_PLACEHOLDER_SEGMENT_CHARS
            : PROTECTED_PLACEHOLDER_SEGMENT_CHARS,
        )
      : maxChars;
  const maxProtectedMarkersPerSegment = veryDenseProtectedMarkers
    ? MAX_PROTECTED_MARKERS_PER_VERY_DENSE_SEGMENT
    : denseProtectedMarkers
      ? MAX_PROTECTED_MARKERS_PER_SEGMENT
      : undefined;

  if (normalized.length <= effectiveMaxChars) {
    return [normalized];
  }

  const topLevelSegments = extractTopLevelPlaceholderSegments(normalized);
  const candidateSegments =
    topLevelSegments.length > 1
      ? topLevelSegments
      : protectedMarkerPieces;
  const sentenceAwareSegments = coalescePlaceholderPiecesIntoSentenceUnits(candidateSegments);
  if (candidateSegments.length <= 1) {
    return [normalized];
  }

  const packed = packPlaceholderTextPieces(
    sentenceAwareSegments,
    effectiveMaxChars,
    maxProtectedMarkersPerSegment,
  );
  const rebalanced = maxProtectedMarkersPerSegment
    ? rebalanceDenseProtectedMarkerSegments(
        packed,
        effectiveMaxChars,
        maxProtectedMarkersPerSegment,
      )
    : packed;

  if (
    rebalanced.length <= 1 ||
    rebalanced.some((segment) => segment.length > effectiveMaxChars) ||
    (maxProtectedMarkersPerSegment &&
      rebalanced.some(
        (segment) => countProtectedMarkers(segment) > maxProtectedMarkersPerSegment,
      ))
  ) {
    return [normalized];
  }

  return rebalanced;
}

export function splitDenseProtectedPlaceholderRichText(
  content: string,
  maxChars: number,
  maxProtectedMarkersPerSegment = 1,
): string[] {
  const normalized = normalizeText(content);
  const pieces = extractProtectedMarkerSegments(normalized);
  const sentenceAwareSegments = coalescePlaceholderPiecesIntoSentenceUnits(pieces);
  const packed = packPlaceholderTextPieces(
    sentenceAwareSegments,
    maxChars,
    maxProtectedMarkersPerSegment,
  );
  const rebalanced = rebalanceDenseProtectedMarkerSegments(
    packed,
    maxChars,
    maxProtectedMarkersPerSegment,
  );

  if (
    rebalanced.length <= 1 ||
    rebalanced.some((segment) => segment.length > maxChars) ||
    rebalanced.some(
      (segment) => countProtectedMarkers(segment) > maxProtectedMarkersPerSegment,
    )
  ) {
    return [normalized];
  }

  return rebalanced;
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
  const normalizedMarkers = canonicalizeProtectedHtmlMarkers(content, htmlMap);

  return Object.entries(htmlMap).reduce(
    (restored, [token, html]) => restored.split(token).join(html),
    normalizedMarkers,
  );
}

/**
 * Recover missing protected markers by inserting them at contextually
 * appropriate positions in the translated content.
 *
 * When `sourceContent` is provided the function uses marker positions in
 * the source text to decide *where* in the translation each missing marker
 * should be placed:
 *
 *  1. **Adjacent-marker anchoring** — if the marker has a neighbouring
 *     marker in the source that is still present in the translation, the
 *     missing marker is inserted next to that neighbour (before or after,
 *     matching the source order).
 *  2. **Relative-position fallback** — map the marker's normalised
 *     position in the source (0..1) onto the translation length and pick
 *     the nearest word / token boundary.
 *
 * Without `sourceContent` the function falls back to appending missing
 * markers at the end (the previous behaviour).
 *
 * Returns `{ recovered, missingMarkers }`.  `missingMarkers` is empty when
 * all markers were already present.
 */
export function recoverMissingProtectedMarkers(
  canonicalContent: string,
  htmlMap: Record<string, string>,
  sourceContent?: string,
): { recovered: string; missingMarkers: string[] } {
  const missing = Object.keys(htmlMap).filter(
    (marker) => !canonicalContent.includes(marker),
  );
  if (missing.length === 0) {
    return { recovered: canonicalContent, missingMarkers: [] };
  }

  // Fast path: no source → append at end (legacy behaviour).
  if (!sourceContent) {
    const suffix = missing.join(' ');
    const recovered = canonicalContent.endsWith(' ')
      ? `${canonicalContent}${suffix}`
      : `${canonicalContent} ${suffix}`;
    return { recovered, missingMarkers: missing };
  }

  // Build ordered list of all markers present in the source and their
  // character offsets so we can reason about positional context.
  const markerPattern = /\[\[x\d+\]\]/gi;
  const sourcePositions = new Map<string, number>();
  const sourceOrder: string[] = [];
  for (const m of sourceContent.matchAll(markerPattern)) {
    const key = m[0].toLowerCase().replace(/\s/g, '');
    // Normalise to canonical form [[xN]]
    const canonical = key;
    if (!sourcePositions.has(canonical)) {
      sourcePositions.set(canonical, m.index);
      sourceOrder.push(canonical);
    }
  }

  const translationPositions = new Map<string, number>();
  for (const m of canonicalContent.matchAll(markerPattern)) {
    const key = m[0].toLowerCase().replace(/\s/g, '');
    if (!translationPositions.has(key)) {
      translationPositions.set(key, m.index);
    }
  }

  // Insert missing markers one-by-one into the evolving recovered string.
  // Process in source order so that successive insertions stay consistent.
  const sortedMissing = [...missing].sort((a, b) => {
    const pa = sourcePositions.get(a.toLowerCase()) ?? Infinity;
    const pb = sourcePositions.get(b.toLowerCase()) ?? Infinity;
    return pa - pb;
  });

  let recovered = canonicalContent;

  for (const marker of sortedMissing) {
    const insertPos = findBestInsertionPoint(
      recovered,
      marker,
      sourceContent,
      sourceOrder,
      sourcePositions,
    );

    if (insertPos === null) {
      // Fallback: append at end
      recovered = recovered.endsWith(' ')
        ? `${recovered}${marker}`
        : `${recovered} ${marker}`;
    } else {
      recovered =
        recovered.slice(0, insertPos) + marker + recovered.slice(insertPos);
    }

    // Re-index translation positions after insertion for subsequent markers.
    translationPositions.clear();
    for (const m of recovered.matchAll(markerPattern)) {
      const key = m[0].toLowerCase().replace(/\s/g, '');
      if (!translationPositions.has(key)) {
        translationPositions.set(key, m.index);
      }
    }
  }

  return { recovered, missingMarkers: missing };
}

/**
 * Determine the best character offset in `translation` to insert
 * `missingMarker`, using positional data from the source text.
 *
 * Returns `null` when no good heuristic fires (caller should append at end).
 */
function findBestInsertionPoint(
  translation: string,
  missingMarker: string,
  sourceContent: string,
  sourceOrder: string[],
  sourcePositions: Map<string, number>,
): number | null {
  const markerKey = missingMarker.toLowerCase();
  const srcIdx = sourceOrder.indexOf(markerKey);
  if (srcIdx === -1) {
    // Marker wasn't even in the source — nothing to anchor on.
    return null;
  }

  const markerPattern = /\[\[x\d+\]\]/gi;

  // ---- Strategy 1: Adjacent-marker anchoring ----
  // Look for the closest preceding and following markers (in source order)
  // that ARE present in the translation.
  let anchorBefore: { marker: string; translationEnd: number } | null = null;
  let anchorAfter: { marker: string; translationStart: number } | null = null;

  // Search backwards for nearest present marker
  for (let i = srcIdx - 1; i >= 0; i--) {
    const candidate = sourceOrder[i];
    const tMatch = findMarkerInText(translation, candidate);
    if (tMatch !== null) {
      anchorBefore = { marker: candidate, translationEnd: tMatch.end };
      break;
    }
  }

  // Search forwards for nearest present marker
  for (let i = srcIdx + 1; i < sourceOrder.length; i++) {
    const candidate = sourceOrder[i];
    const tMatch = findMarkerInText(translation, candidate);
    if (tMatch !== null) {
      anchorAfter = { marker: candidate, translationStart: tMatch.start };
      break;
    }
  }

  // ---- Strategy 2: Relative position mapping ----
  // Always compute the relative position so we can compare anchor quality
  // against it.
  const srcPos = sourcePositions.get(markerKey);
  const relativePos =
    srcPos !== undefined && sourceContent.length > 0
      ? srcPos / sourceContent.length
      : null;

  // Decide whether an adjacent-marker anchor is "close enough" in the
  // source to be a reliable insertion guide.  When the source gap between
  // the anchor and the missing marker is small (< 15% of source text),
  // we trust the anchor completely.  Otherwise we use relative-position
  // mapping, but constrain it to respect the ordering implied by anchors
  // (result must be after anchor-before and before anchor-after).
  const CLOSE_GAP_THRESHOLD = 0.15;

  const anchorBeforeGap =
    anchorBefore && srcPos !== undefined
      ? Math.abs(
          srcPos - (sourcePositions.get(anchorBefore.marker) ?? 0),
        ) / sourceContent.length
      : Infinity;
  const anchorAfterGap =
    anchorAfter && srcPos !== undefined
      ? Math.abs(
          (sourcePositions.get(anchorAfter.marker) ?? sourceContent.length) - srcPos,
        ) / sourceContent.length
      : Infinity;

  // Close anchor — insert directly adjacent
  const closeAnchorAfter =
    anchorAfter && anchorAfterGap <= CLOSE_GAP_THRESHOLD;
  const closeAnchorBefore =
    anchorBefore && anchorBeforeGap <= CLOSE_GAP_THRESHOLD;

  if (closeAnchorAfter && closeAnchorBefore) {
    if (anchorAfterGap <= anchorBeforeGap) {
      return snapToTokenBoundary(translation, anchorAfter!.translationStart, 'before');
    }
    return snapToTokenBoundary(translation, anchorBefore!.translationEnd, 'after');
  }
  if (closeAnchorAfter) {
    return snapToTokenBoundary(translation, anchorAfter!.translationStart, 'before');
  }
  if (closeAnchorBefore) {
    return snapToTokenBoundary(translation, anchorBefore!.translationEnd, 'after');
  }

  if (relativePos === null) {
    // No positional data at all — use distant anchors as fallback
    if (anchorAfter) {
      return snapToTokenBoundary(translation, anchorAfter.translationStart, 'before');
    }
    if (anchorBefore) {
      return snapToTokenBoundary(translation, anchorBefore.translationEnd, 'after');
    }
    return null;
  }

  // Strip existing markers from translation to get "text-only" length,
  // then map the relative position back.
  const textOnly = translation.replace(markerPattern, '');
  const targetCharPos = Math.round(relativePos * textOnly.length);

  // Walk through the actual translation to find the character position that
  // corresponds to `targetCharPos` text characters.
  let textChars = 0;
  let realPos = 0;
  const existingMarkers = [...translation.matchAll(new RegExp(markerPattern.source, 'gi'))];
  const markerRanges = existingMarkers.map((m) => ({
    start: m.index,
    end: m.index + m[0].length,
  }));

  while (realPos < translation.length && textChars < targetCharPos) {
    const inMarker = markerRanges.find(
      (r) => realPos >= r.start && realPos < r.end,
    );
    if (inMarker) {
      realPos = inMarker.end;
      continue;
    }
    textChars++;
    realPos++;
  }

  // Clamp the position to respect ordering constraints from distant anchors.
  // The missing marker must appear after anchor-before and before anchor-after
  // in the translation.
  const minPos = anchorBefore ? anchorBefore.translationEnd : 0;
  const maxPos = anchorAfter ? anchorAfter.translationStart : translation.length;
  realPos = Math.max(minPos, Math.min(realPos, maxPos));

  return snapToTokenBoundary(translation, realPos, 'nearest');
}

/** Find the start/end offsets of a marker in text (case-insensitive). */
function findMarkerInText(
  text: string,
  marker: string,
): { start: number; end: number } | null {
  const idx = text.toLowerCase().indexOf(marker.toLowerCase());
  if (idx === -1) return null;
  // Find the actual marker length in the text at that position
  const match = text.slice(idx).match(/\[\[x\d+\]\]/i);
  if (!match) return null;
  return { start: idx, end: idx + match[0].length };
}

/**
 * Snap a raw character position to the nearest token/word boundary so
 * that a marker doesn't land in the middle of a word or CJK character
 * sequence.
 *
 * Uses a two-tier boundary system:
 * - **Strong boundaries** (punctuation, spaces, marker brackets) are
 *   preferred within a search radius.
 * - **Weak boundaries** (any CJK character edge) are used as a fallback.
 *
 * `direction`:
 *  - 'before' — move to a position just before the given offset (for
 *    inserting before an anchor)
 *  - 'after'  — stay at or just after the offset
 *  - 'nearest' — pick the closest boundary
 */
function snapToTokenBoundary(
  text: string,
  pos: number,
  direction: 'before' | 'after' | 'nearest',
): number {
  // Clamp
  pos = Math.max(0, Math.min(pos, text.length));

  // Already at a strong boundary?
  if (isStrongBoundary(text, pos)) {
    return pos;
  }

  // Search radius for strong boundaries (characters)
  const STRONG_RADIUS = 8;

  // Scan for nearest strong boundaries in both directions
  let strongLeft = pos;
  while (strongLeft > 0 && pos - strongLeft < STRONG_RADIUS && !isStrongBoundary(text, strongLeft)) {
    strongLeft--;
  }
  const foundStrongLeft = isStrongBoundary(text, strongLeft) && pos - strongLeft < STRONG_RADIUS;

  let strongRight = pos;
  while (strongRight < text.length && strongRight - pos < STRONG_RADIUS && !isStrongBoundary(text, strongRight)) {
    strongRight++;
  }
  const foundStrongRight = isStrongBoundary(text, strongRight) && strongRight - pos < STRONG_RADIUS;

  // Prefer strong boundary if available
  if (foundStrongLeft || foundStrongRight) {
    if (direction === 'before') {
      return foundStrongLeft ? strongLeft : strongRight;
    }
    if (direction === 'after') {
      return foundStrongRight ? strongRight : strongLeft;
    }
    // nearest
    if (foundStrongLeft && foundStrongRight) {
      return pos - strongLeft <= strongRight - pos ? strongLeft : strongRight;
    }
    return foundStrongLeft ? strongLeft : strongRight;
  }

  // Fallback: scan for any boundary (including weak CJK boundaries)
  let left = pos;
  while (left > 0 && !isTokenBoundary(text, left)) left--;
  let right = pos;
  while (right < text.length && !isTokenBoundary(text, right)) right++;

  let chosen: number;
  if (direction === 'before') {
    chosen = left;
  } else if (direction === 'after') {
    chosen = right;
  } else {
    chosen = pos - left <= right - pos ? left : right;
  }

  return chosen;
}

/** CJK Unified Ideographs + Hiragana + Katakana + CJK punctuation ranges. */
const CJK_CHAR_PATTERN = /[\u3000-\u9FFF\uF900-\uFAFF]/;

/**
 * Check if position `pos` in `text` is a **strong** token boundary:
 * punctuation, spaces, or marker bracket edges.  These are preferred
 * insertion points because they sit at natural clause/phrase breaks.
 *
 * Note: start (0) and end (length) of string are NOT treated as strong
 * boundaries to avoid biasing short texts toward edge insertions.
 */
function isStrongBoundary(text: string, pos: number): boolean {
  if (pos <= 0 || pos >= text.length) return false;
  const before = text[pos - 1];
  const after = text[pos];
  if (before === ' ' || after === ' ') return true;
  if (/[。、！？.,!?;:()（）「」『』]/.test(before) || /[。、！？.,!?;:()（）「」『』]/.test(after)) return true;
  if (before === ']' || after === '[') return true;
  return false;
}

/** Check if position `pos` in `text` is a reasonable token boundary. */
function isTokenBoundary(text: string, pos: number): boolean {
  if (pos === 0 || pos === text.length) return true;
  const before = text[pos - 1];
  const after = text[pos];
  // Space boundary
  if (before === ' ' || after === ' ') return true;
  // Punctuation boundary (Japanese/CJK punctuation included)
  if (/[。、！？.,!?;:()（）「」『』]/.test(before) || /[。、！？.,!?;:()（）「」『』]/.test(after)) return true;
  // Marker bracket boundary
  if (before === ']' || after === '[') return true;
  // CJK character boundary — every inter-character position is a valid
  // insertion point since CJK languages don't use inter-word spaces.
  if (CJK_CHAR_PATTERN.test(before) || CJK_CHAR_PATTERN.test(after)) return true;
  return false;
}


export function canonicalizeProtectedHtmlMarkers(
  content: string,
  htmlMap: Record<string, string>,
): string {
  let normalized = content.replace(
    PROTECTED_HTML_MARKER_PATTERN,
    (_match, id: string) => `[[${PROTECTED_HTML_MARKER_NAME}${id}]]`,
  );

  Object.keys(htmlMap).forEach((marker) => {
    const markerIdMatch = marker.match(/\[\[\s*x(\d+)\s*\]\]/i);
    if (!markerIdMatch) {
      return;
    }

    const markerId = markerIdMatch[1];
    const canonical = `[[${PROTECTED_HTML_MARKER_NAME}${markerId}]]`;
    const variantPattern = new RegExp(
      `${PROTECTED_HTML_MARKER_VARIANT_BRACKETS}{1,2}\\s*[xX]\\s*${markerId}\\s*${PROTECTED_HTML_MARKER_VARIANT_BRACKETS}{1,2}`,
      'g',
    );
    normalized = normalized.replace(variantPattern, canonical);
  });

  return normalized;
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

function serializeStructuredPlaceholderNode(
  node: ChildNode,
  tagMap: Record<string, string>,
  nextId: () => number,
): string | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }

  if (!(node instanceof HTMLElement)) {
    return '';
  }

  if (isDisallowedStructuredPlaceholderElement(node)) {
    return null;
  }

  const isInline = PLACEHOLDER_RICH_TEXT_TAGS.has(node.tagName);
  const isBlockWrapper = PLACEHOLDER_WRAPPABLE_BLOCK_TAGS.has(node.tagName);
  if (!isInline && !isBlockWrapper) {
    return null;
  }

  const innerParts: string[] = [];
  for (const child of Array.from(node.childNodes)) {
    const serializedChild = serializeStructuredPlaceholderNode(child, tagMap, nextId);
    if (serializedChild === null) {
      return null;
    }
    innerParts.push(serializedChild);
  }

  const id = String(nextId());
  const openToken = `[[${PLACEHOLDER_MARKER_NAME}${id}]]`;
  const closeToken = `[[/${PLACEHOLDER_MARKER_NAME}${id}]]`;
  tagMap[openToken] = buildOpeningTag(node);
  tagMap[closeToken] = `</${node.tagName.toLowerCase()}>`;

  const wrapped = `${openToken}${innerParts.join('')}${closeToken}`;
  return isBlockWrapper ? ` ${wrapped} ` : wrapped;
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
    element.matches(ATOMIC_HTML_SELECTOR_QUERY) ||
    element.querySelector(ATOMIC_HTML_SELECTOR_QUERY) ||
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

  const inner = buildPlaceholderRichTextContent(soleChild);
  if (inner) {
    return {
      content: inner.content,
      tagMap: inner.tagMap,
      wrapperPrefix: buildOpeningTag(soleChild),
      wrapperSuffix: `</${soleChild.tagName.toLowerCase()}>`,
    };
  }

  const structured = buildStructuredWrappedPlaceholderRichTextContent(soleChild);
  if (!structured) {
    return null;
  }

  return {
    content: structured.content,
    tagMap: structured.tagMap,
    wrapperPrefix: buildOpeningTag(soleChild),
    wrapperSuffix: `</${soleChild.tagName.toLowerCase()}>`,
  };
}

function buildStructuredWrappedPlaceholderRichTextContent(
  wrapperElement: HTMLElement,
): PlaceholderRichTextContent | null {
  const tagMap: Record<string, string> = {};
  let nextId = 0;
  const pieces: string[] = [];

  for (const child of Array.from(wrapperElement.childNodes)) {
    const serialized = serializeStructuredPlaceholderNode(child, tagMap, () => nextId++);
    if (serialized === null) {
      return null;
    }
    pieces.push(serialized);
  }

  const content = normalizeText(pieces.join(' '));
  const hasProtectedMarkers = containsProtectedHtmlMarker(content);
  if (!content || (Object.keys(tagMap).length === 0 && !hasProtectedMarkers)) {
    return null;
  }

  return {
    content,
    tagMap,
  };
}

function containsProtectedHtmlMarker(content: string): boolean {
  const matches = content.matchAll(new RegExp(PROTECTED_HTML_MARKER_PATTERN.source, 'gi'));
  return !matches.next().done;
}

function extractTopLevelPlaceholderSegments(content: string): string[] {
  const pattern = new RegExp(PLACEHOLDER_MARKER_PATTERN.source, 'gi');
  const segments: string[] = [];
  let current = '';
  let depth = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content))) {
    current += content.slice(lastIndex, match.index);
    current += match[0];
    lastIndex = pattern.lastIndex;

    depth += match[1] ? -1 : 1;
    if (depth === 0) {
      const trailingWhitespace = content.slice(lastIndex).match(/^\s+/)?.[0] ?? '';
      current += trailingWhitespace;
      lastIndex += trailingWhitespace.length;

      const normalized = normalizeText(current);
      if (normalized) {
        segments.push(normalized);
      }
      current = '';
    }
  }

  current += content.slice(lastIndex);
  const trailing = normalizeText(current);
  if (trailing) {
    segments.push(trailing);
  }

  return segments;
}

function packPlaceholderTextPieces(
  pieces: string[],
  maxChars: number,
  maxProtectedMarkersPerSegment?: number,
): string[] {
  const normalizedPieces = pieces.flatMap((piece) => {
    if (isProtectedMarkerPiece(piece) || piece.length <= maxChars) {
      return [piece];
    }
    return splitTextForPlaceholder(piece, maxChars);
  });

  const packed: string[] = [];
  let current = '';
  let currentProtectedMarkerCount = 0;

  normalizedPieces.forEach((piece) => {
    const pieceProtectedMarkerCount = countProtectedMarkers(piece);
    const candidate = current ? concatenatePlaceholderPieces(current, piece) : piece;
    const candidateProtectedMarkerCount = currentProtectedMarkerCount + pieceProtectedMarkerCount;
    if (
      maxProtectedMarkersPerSegment &&
      current &&
      candidateProtectedMarkerCount > maxProtectedMarkersPerSegment
    ) {
      packed.push(current);
      current = piece;
      currentProtectedMarkerCount = pieceProtectedMarkerCount;
      return;
    }

    if (candidate.length <= maxChars) {
      current = candidate;
      currentProtectedMarkerCount = candidateProtectedMarkerCount;
      return;
    }

    if (current) {
      packed.push(current);
    }
    current = piece;
    currentProtectedMarkerCount = pieceProtectedMarkerCount;
  });

  if (current) {
    packed.push(current);
  }

  return packed;
}

function extractProtectedMarkerSegments(content: string): string[] {
  const pattern = new RegExp(PROTECTED_HTML_MARKER_PATTERN.source, 'gi');
  const pieces: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content))) {
    const before = normalizeText(content.slice(lastIndex, match.index));
    if (before) {
      pieces.push(before);
    }

    pieces.push(`[[${PROTECTED_HTML_MARKER_NAME}${match[1]}]]`);
    lastIndex = pattern.lastIndex;
  }

  const trailing = normalizeText(content.slice(lastIndex));
  if (trailing) {
    pieces.push(trailing);
  }

  return pieces;
}

function coalescePlaceholderPiecesIntoSentenceUnits(pieces: string[]): string[] {
  if (pieces.length <= 1) {
    return pieces;
  }

  const units: string[] = [];
  let current = '';

  pieces.forEach((piece) => {
    current = current ? concatenatePlaceholderPieces(current, piece) : piece;
    if (endsPlaceholderSentenceUnit(piece)) {
      units.push(current);
      current = '';
    }
  });

  if (current) {
    units.push(current);
  }

  return units;
}

function rebalanceDenseProtectedMarkerSegments(
  segments: string[],
  maxChars: number,
  maxProtectedMarkersPerSegment: number,
): string[] {
  const rebalanced: string[] = [];

  segments.forEach((segment) => {
    if (countProtectedMarkers(segment) <= maxProtectedMarkersPerSegment) {
      rebalanced.push(segment);
      return;
    }

    const pieces = extractProtectedMarkerSegments(segment);
    // Apply sentence-unit coalescing so markers at sentence boundaries
    // (e.g., "is a basis of [[x0]].") stay together, but only when the
    // resulting unit won't exceed the per-segment marker limit.
    const sentenceAware = coalesceProtectedPiecesWithMarkerBudget(
      pieces,
      maxProtectedMarkersPerSegment,
    );
    const packed = packPlaceholderTextPieces(
      sentenceAware,
      maxChars,
      maxProtectedMarkersPerSegment,
    );
    rebalanced.push(...packed);
  });

  return rebalanced;
}

function shouldConcatenatePlaceholderPiecesWithoutSpace(left: string, right: string): boolean {
  const trimmedLeft = left.trimEnd();
  const trimmedRight = right.trimStart();
  if (!trimmedLeft || !trimmedRight) {
    return true;
  }

  if (isProtectedMarkerPiece(left)) {
    return /^[,.;:!?%)\]}]/.test(trimmedRight);
  }

  if (isProtectedMarkerPiece(right)) {
    return /[(\[{]$/.test(trimmedLeft);
  }

  return false;
}

function concatenatePlaceholderPieces(left: string, right: string): string {
  return shouldConcatenatePlaceholderPiecesWithoutSpace(left, right)
    ? `${left}${right}`
    : `${left} ${right}`;
}

function coalesceProtectedPiecesWithMarkerBudget(
  pieces: string[],
  maxMarkersPerUnit: number,
): string[] {
  if (pieces.length <= 1) {
    return pieces;
  }

  const units: string[] = [];
  let current = '';
  let currentMarkers = 0;

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    const pieceMarkers = countProtectedMarkers(piece);

    // If adding this piece would exceed the marker budget, flush first —
    // but only if the current piece is a marker. Don't flush before a text
    // piece that follows a marker, as that would split "is a basis of [[x0]]".
    if (
      currentMarkers > 0 &&
      currentMarkers + pieceMarkers > maxMarkersPerUnit &&
      current &&
      pieceMarkers > 0
    ) {
      // Only flush if the piece after this marker has substantial text
      // (not just trailing punctuation). If the marker is sentence-final
      // like "basis of [[x0]].", keep it attached.
      const pieceAfterThis = i + 1 < pieces.length ? pieces[i + 1] : null;
      const afterIsSubstantial = pieceAfterThis &&
        pieceAfterThis.replace(/[\s.。!?！？,，;；:：)\]}/]+/g, '').length > 3;
      if (afterIsSubstantial) {
        units.push(current);
        current = '';
        currentMarkers = 0;
      }
    }

    current = current ? concatenatePlaceholderPieces(current, piece) : piece;
    currentMarkers += pieceMarkers;

    if (endsPlaceholderSentenceUnit(piece)) {
      const nextPiece = i + 1 < pieces.length ? pieces[i + 1] : null;
      const nextIsMarker = nextPiece && isProtectedMarkerPiece(nextPiece);
      if (nextIsMarker) {
        // Check what follows the marker — if it's just punctuation or
        // nothing, the marker is a sentence-final variable (e.g., "basis of [[x0]].")
        // and MUST stay attached even if it exceeds the marker budget.
        const pieceAfterMarker = i + 2 < pieces.length ? pieces[i + 2] : null;
        const afterMarkerIsTrailing = !pieceAfterMarker ||
          pieceAfterMarker.replace(/[\s.。!?！？,，;；:：)\]}/]+/g, '').length <= 3;
        if (afterMarkerIsTrailing || currentMarkers + 1 <= maxMarkersPerUnit) {
          continue; // Don't split — keep accumulating
        }
      }
      units.push(current);
      current = '';
      currentMarkers = 0;
    }
  }

  if (current) {
    units.push(current);
  }

  return units;
}

function isProtectedMarkerPiece(piece: string): boolean {
  return /^\[\[\s*x\d+\s*\]\]$/i.test(piece);
}

function endsPlaceholderSentenceUnit(piece: string): boolean {
  const trimmed = piece.trim();
  if (!trimmed || isProtectedMarkerPiece(trimmed)) {
    return false;
  }

  return /(?:[.!?。！？:：]|\[\[\/t\d+\]\])$/i.test(trimmed);
}

function countProtectedMarkers(content: string): number {
  return content.match(new RegExp(PROTECTED_HTML_MARKER_PATTERN.source, 'gi'))?.length ?? 0;
}

function isDisallowedStructuredPlaceholderElement(element: HTMLElement): boolean {
  return (
    element.matches('.reference, .references, .reflist') ||
    element.matches('.mwe-math-element, .mwe-math-fallback-image-inline, .mwe-math-fallback-image-display') ||
    element.matches('a[href^="#cite_note"], a[href^="#cite_ref"]')
  );
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

function splitTextForPlaceholder(text: string, maxChars: number): string[] {
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

    const clauseChunks = splitLongPlaceholderSentenceByClauses(sentence, maxChars);
    if (clauseChunks.length > 1) {
      chunks.push(...clauseChunks);
      current = '';
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

function splitLongPlaceholderSentenceByClauses(text: string, maxChars: number): string[] {
  const clauses =
    text.match(/[^,;:、，；：]+(?:[,;:、，；：]+|$)/g)?.map((clause) => clause.trim()) ?? [text];
  if (clauses.length <= 1) {
    return [text];
  }

  const chunks: string[] = [];
  let current = '';

  clauses.forEach((clause) => {
    const candidate = current ? `${current} ${clause}` : clause;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) {
      chunks.push(current);
    }

    if (clause.length <= maxChars) {
      current = clause;
      return;
    }

    current = '';
  });

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 1 ? chunks : [text];
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
