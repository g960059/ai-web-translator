import { estimateTokensFromChars } from './analysis';
import { normalizeText, supportsPlaceholderRichTextHtml } from './html';
import type {
  DefaultTranslationScope,
  TranslationContentMode,
  TranslationContext,
} from '../shared/types';

export interface BlockSeed {
  element: HTMLElement;
  originalHtml: string;
  originalText: string;
  contentMode: TranslationContentMode;
  isVisible: boolean;
  estimatedTokens: number;
  sectionContext: string;
  top: number;
  priorityScore: number;
}

const BLOCK_TAGS = new Set([
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TD',
  'TH',
  'UL',
]);
const STRUCTURAL_CONTAINER_TAGS = new Set(['BODY', 'HEAD', 'HTML']);
const GENERIC_CONTAINER_TAGS = new Set(['DIV', 'SECTION', 'MAIN', 'ARTICLE']);
const STRUCTURED_DESCENDANT_SELECTOR =
  'p, li, dd, dt, blockquote, h1, h2, h3, h4, h5, h6, pre, figure, table, .maruku-equation';
const RECOVERY_BLOCK_SELECTOR =
  'p, li, dd, dt, blockquote, h1, h2, h3, h4, h5, h6, pre, figcaption, td, th';

const EXCLUDED_SELECTOR = [
  'script',
  'style',
  'noscript',
  'meta',
  'link',
  'textarea',
  'input',
  'select',
  'option',
  'button',
  'svg',
  'canvas',
  'nav',
  'aside',
  'footer',
  'form',
  'label',
  '[role="navigation"]',
  '[role="complementary"]',
  '[role="search"]',
  '[role="menu"]',
  '.breadcrumb',
  '.breadcrumbs',
  '[class*="breadcrumb"]',
  '[class*="breadcrumbs"]',
  '[class*="sidebar"]',
  '[class*="pagination"]',
  '[class*="pager"]',
  '[class*="related"]',
  '[class*="share"]',
  '[class*="social"]',
  '[class*="cookie"]',
  '.toc',
  '.navbox',
  '.reflist',
  '.reference',
  '.references',
  '.mw-editsection',
  '.hatnote',
  '.noprint',
  '.metadata',
  '.sidebar',
  '.rightHandSide',
  '.infobox',
  '.portal',
  '.maruku_toc',
  '.sistersitebox',
  '.ambox',
  '.rellink',
  '.dablink',
  '.catlinks',
  'ol.references',
  'ul.gallery',
  'table.infobox',
  'table.vertical-navbox',
  '[translate="no"]',
  '[aria-hidden="true"]',
  '[contenteditable="true"]',
].join(', ');

const MAIN_CANDIDATE_SELECTOR = [
  'main',
  'article',
  '[role="main"]',
  '#revision',
  '#content',
  '#main',
  '#bodyContent',
  '#mw-content-text',
  '.mw-parser-output',
  '.main',
  '.content',
  '.main-content',
  '.page-content',
  '.article-content',
  '.article-body',
  '.entry-content',
  '.post-content',
  '.story-body',
  '.markdown-body',
  '.doc-content',
].join(', ');

const COMPLEX_DESCENDANT_SELECTOR =
  'a, code, pre, table, ruby, sup, sub, math, img, picture, video, audio, iframe, form, input, select, textarea, button';
const TEXT_FRIENDLY_INLINE_TAGS = new Set([
  'SPAN',
  'STRONG',
  'EM',
  'B',
  'I',
  'U',
  'S',
  'SMALL',
  'MARK',
  'CITE',
  'Q',
  'TIME',
  'ABBR',
  'WBR',
]);
const MERGEABLE_PARENT_TAGS = new Set(['DIV', 'SECTION', 'UL', 'OL', 'DL']);
const MERGEABLE_CHILD_TAGS = new Set([
  'P',
  'LI',
  'DD',
  'DT',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
]);
const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
const STRUCTURED_CONTAINER_TAGS = new Set(['DIV', 'SECTION', 'ARTICLE']);
const STRUCTURED_CONTAINER_HINT_PATTERN =
  /\b(num_(?:defn|remark|prop)|proof|remark|definition|theorem|lemma|corollary|proposition|example|exercise|claim|fact|notation)\b/i;
const STRUCTURED_CONTAINER_HEADING_PATTERN =
  /^(definition|remark|proposition|proof|theorem|lemma|corollary|example|exercise|claim|fact|notation)$/i;
const MERGEABLE_CHILD_MAX_CHARS = 280;
const MERGED_BLOCK_MIN_CHARS = 40;
const MERGED_BLOCK_MAX_CHARS = 1100;
const MERGED_CHILD_COUNT_MIN = 2;
const MERGED_CHILD_COUNT_MAX = 10;
const UI_LIKE_TEXT_PATTERN =
  /^(menu|search|share|copy link|next|previous|prev|home|login|log in|sign in|sign up|subscribe|download|print|comments?|related|table of contents|contents?|toc|cookie|accept|reject|close|open)$/i;
const META_LIKE_TEXT_PATTERN =
  /^(updated .+|published .+|last updated .+|by [\p{L}\s.'-]+|\d+\s*(min read|mins read|minute read|minutes read|hours? ago|days? ago|weeks? ago|months? ago|years? ago))$/iu;
const CITATION_LIKE_TEXT_PATTERN =
  /(\bdoi\b|\bisbn\b|\bissn\b|\bpmid\b|\bbibcode\b|\barxiv\b|\bretrieved\b|\barchived\b|\bcitation\b)/iu;
const MAIN_POSITIVE_HINT_PATTERN =
  /(main|content|article|entry|post|story|body|markdown|document|doc|wiki|reader|revision)/i;
const MAIN_NEGATIVE_HINT_PATTERN =
  /(comment|footer|header|nav|menu|breadcrumb|share|social|sidebar|aside|related|promo|banner|modal|drawer|cookie|pager|pagination|toolbar|tools|toc|table-of-contents|advert|ads?)/i;
const JAPANESE_SCRIPT_PATTERN = /[\u3040-\u30ff\u3400-\u9fff々]/gu;
const CHINESE_SCRIPT_PATTERN = /[\u3400-\u9fff]/gu;
const KOREAN_SCRIPT_PATTERN = /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/gu;
const THAI_SCRIPT_PATTERN = /[\u0e00-\u0e7f]/gu;
const CYRILLIC_SCRIPT_PATTERN = /[\u0400-\u04ff]/gu;
const ARABIC_SCRIPT_PATTERN = /[\u0600-\u06ff]/gu;
const HEBREW_SCRIPT_PATTERN = /[\u0590-\u05ff]/gu;
const DEVANAGARI_SCRIPT_PATTERN = /[\u0900-\u097f]/gu;
const MAIN_ROOT_MIN_TEXT_CHARS = 160;
const SECTION_HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';
const NON_READER_SECTION_HEADING_PATTERN =
  /^(references|external links|see also|further reading|bibliography|sources|notes|citations)$/i;

function getNormalizedTagName(element: Element): string {
  return element.tagName.toUpperCase();
}

function isTranslatableText(text: string): boolean {
  const normalized = normalizeText(text);
  return normalized.length > 1 && /[\p{L}\p{N}]/u.test(normalized);
}

function hasBlockChild(element: HTMLElement): boolean {
  for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
    const childTagName = getNormalizedTagName(child);
    if (BLOCK_TAGS.has(childTagName) || STRUCTURAL_CONTAINER_TAGS.has(childTagName)) {
      return true;
    }
  }
  return false;
}

function isBoilerplateBlock(
  element: HTMLElement,
  text: string,
  options?: { selectionMode?: boolean },
): boolean {
  // Heading elements (h1-h6) are always translatable — they serve as
  // navigation labels that readers need in the target language.
  if (/^H[1-6]$/.test(element.tagName)) {
    return false;
  }

  const normalized = normalizeText(text).toLowerCase();
  const proseLike = looksLikeProseText(normalized);
  if (normalized.length <= 2) {
    return true;
  }

  if (options?.selectionMode) {
    return false;
  }

  if (normalized.length <= 18 && /^[a-z0-9\s\-_/|]+$/i.test(normalized)) {
    return true;
  }

  if (UI_LIKE_TEXT_PATTERN.test(normalized) || META_LIKE_TEXT_PATTERN.test(normalized)) {
    return true;
  }

  if (element.closest('header, nav, footer, aside, form')) {
    return true;
  }

  if (
    normalized.length <= 320 &&
    resolveLinkDensity(element, normalized.length) >= 0.55 &&
    element.querySelectorAll('a').length >= 2 &&
    !proseLike
  ) {
    return true;
  }

  if (
    normalized.length <= 420 &&
    resolveLinkDensity(element, normalized.length) >= 0.45 &&
    element.querySelectorAll('a').length >= 4 &&
    !proseLike
  ) {
    return true;
  }

  if (isCitationLikeBlock(element, normalized)) {
    return true;
  }

  if (isNonReaderSectionBlock(element)) {
    return true;
  }

  return false;
}

function looksLikeProseText(normalizedText: string): boolean {
  const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 5) {
    return false;
  }

  return /[.!?。]|[,;:]/.test(normalizedText);
}

function resolveContentMode(element: HTMLElement): TranslationContentMode {
  if (prefersTextContentMode(element)) {
    return 'text';
  }

  return 'html';
}

function prefersTextContentMode(element: HTMLElement): boolean {
  if (element.querySelector(COMPLEX_DESCENDANT_SELECTOR)) {
    return false;
  }

  if (element.childElementCount === 0) {
    return true;
  }

  const descendants = Array.from(element.querySelectorAll('*')) as HTMLElement[];
  if (descendants.length === 0 || descendants.length > 8) {
    return false;
  }

  return descendants.every((node) => TEXT_FRIENDLY_INLINE_TAGS.has(getNormalizedTagName(node)));
}

function getMergeableTextChildren(element: HTMLElement): HTMLElement[] | null {
  if (!MERGEABLE_PARENT_TAGS.has(getNormalizedTagName(element))) {
    return null;
  }

  const children = Array.from(element.children) as HTMLElement[];
  if (
    children.length < MERGED_CHILD_COUNT_MIN ||
    children.length > MERGED_CHILD_COUNT_MAX
  ) {
    return null;
  }

  let totalChars = 0;
  for (const child of children) {
    if (!MERGEABLE_CHILD_TAGS.has(getNormalizedTagName(child))) {
      return null;
    }

    if (child.matches(EXCLUDED_SELECTOR) || hasBlockChild(child)) {
      return null;
    }

    const text = child.textContent ?? '';
    const normalizedText = normalizeText(text);
    const canMergeRichText =
      resolveContentMode(child) === 'html' &&
      supportsPlaceholderRichTextHtml(child.innerHTML);
    if (
      (!canMergeRichText && resolveContentMode(child) !== 'text') ||
      !isTranslatableText(text) ||
      isBoilerplateBlock(child, text) ||
      normalizedText.length > MERGEABLE_CHILD_MAX_CHARS
    ) {
      return null;
    }

    totalChars += normalizedText.length;
  }

  if (totalChars < MERGED_BLOCK_MIN_CHARS || totalChars > MERGED_BLOCK_MAX_CHARS) {
    return null;
  }

  return children;
}

function resolveStructuredContainerBlock(
  element: HTMLElement,
  options?: { selectionMode?: boolean },
): BlockSeed | null {
  if (!isXmlLikeDocument(element.ownerDocument)) {
    return null;
  }

  if (!STRUCTURED_CONTAINER_TAGS.has(getNormalizedTagName(element))) {
    return null;
  }

  const directChildren = Array.from(element.children) as HTMLElement[];
  if (directChildren.length < 2 || directChildren.length > 18) {
    return null;
  }

  const normalizedText = normalizeText(element.textContent ?? '');
  if (normalizedText.length < 120 || normalizedText.length > 3200) {
    return null;
  }

  if (isBoilerplateBlock(element, normalizedText, options)) {
    return null;
  }

  const hints = [
    element.id,
    element.className || '',
    element.getAttribute('data-type') ?? '',
    element.getAttribute('role') ?? '',
  ].join(' ');
  const firstHeadingText = normalizeText(
    directChildren.find((child) => HEADING_TAGS.has(getNormalizedTagName(child)))?.textContent ?? '',
  );
  const hasSemanticHint =
    STRUCTURED_CONTAINER_HINT_PATTERN.test(hints) ||
    STRUCTURED_CONTAINER_HEADING_PATTERN.test(firstHeadingText);
  if (!hasSemanticHint) {
    return null;
  }

  let supportedChildCount = 0;
  let equationLikeChildCount = 0;
  for (const child of directChildren) {
    if (child.matches(EXCLUDED_SELECTOR)) {
      return null;
    }

    const tagName = getNormalizedTagName(child);
    if (
      HEADING_TAGS.has(tagName) ||
      MERGEABLE_CHILD_TAGS.has(tagName) ||
      tagName === 'BLOCKQUOTE' ||
      tagName === 'PRE' ||
      tagName === 'UL' ||
      tagName === 'OL'
    ) {
      supportedChildCount += 1;
      continue;
    }

    if (tagName === 'DIV' && child.classList.contains('maruku-equation')) {
      supportedChildCount += 1;
      equationLikeChildCount += 1;
      continue;
    }

    return null;
  }

  if (supportedChildCount < 3) {
    return null;
  }

  if (
    equationLikeChildCount > 0 &&
    directChildren.length - equationLikeChildCount < 2
  ) {
    return null;
  }

  return toBlockSeed(element, 'html');
}

function isVisibleInViewport(element: HTMLElement): boolean {
  const computedStyle = window.getComputedStyle(element);
  if (
    computedStyle.display === 'none' ||
    computedStyle.visibility === 'hidden' ||
    computedStyle.visibility === 'collapse'
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  return rect.bottom >= -viewportHeight && rect.top <= viewportHeight * 2;
}

function isEligibleBlock(
  element: HTMLElement,
  options?: { selectionMode?: boolean },
): boolean {
  return resolveBlockIneligibilityReason(element, options) === null;
}

function resolveBlockIneligibilityReason(
  element: HTMLElement,
  options?: { selectionMode?: boolean },
): string | null {
  const tagName = getNormalizedTagName(element);
  if (element.matches(EXCLUDED_SELECTOR)) {
    return 'excluded-self';
  }

  if (!BLOCK_TAGS.has(tagName)) {
    return 'non-block-tag';
  }

  if (STRUCTURAL_CONTAINER_TAGS.has(tagName)) {
    return 'structural-container';
  }

  if (hasBlockChild(element)) {
    return 'has-block-child';
  }

  if (GENERIC_CONTAINER_TAGS.has(tagName)) {
    const structuredDescendantCount = element.querySelectorAll(STRUCTURED_DESCENDANT_SELECTOR).length;
    if (structuredDescendantCount >= 2) {
      return 'generic-wrapper';
    }
  }

  const text = element.textContent ?? '';
  if (!isTranslatableText(text)) {
    return 'not-translatable';
  }

  if (isBoilerplateBlock(element, text, options)) {
    return 'boilerplate';
  }

  return null;
}

function toBlockSeed(
  element: HTMLElement,
  contentMode: TranslationContentMode = resolveContentMode(element),
): BlockSeed {
  const originalText = normalizeText(element.textContent ?? '');
  const top = element.getBoundingClientRect().top;
  return {
    element,
    originalHtml: element.innerHTML,
    originalText,
    contentMode,
    isVisible: isVisibleInViewport(element),
    estimatedTokens: estimateTokensFromChars(originalText.length),
    sectionContext: resolveSectionContext(element),
    top,
    priorityScore: resolvePriorityScore(element, originalText, top),
  };
}

function collectBlocks(
  root: HTMLElement,
  options?: {
    range?: Range;
    allowMergedParents?: boolean;
    selectionMode?: boolean;
  },
): BlockSeed[] {
  const results: BlockSeed[] = [];

  const visit = (element: HTMLElement): void => {
    if (options?.range && !options.range.intersectsNode(element)) {
      return;
    }

    if (!options?.selectionMode && element.matches(EXCLUDED_SELECTOR)) {
      return;
    }

    const structuredContainerBlock = resolveStructuredContainerBlock(element, {
      selectionMode: options?.selectionMode,
    });
    if (structuredContainerBlock) {
      results.push(structuredContainerBlock);
      return;
    }

    if (options?.allowMergedParents !== false && getMergeableTextChildren(element)) {
      results.push(toBlockSeed(element, 'html'));
      return;
    }

    if (isEligibleBlock(element, { selectionMode: options?.selectionMode })) {
      results.push(toBlockSeed(element));
      return;
    }

    for (let child = element.firstElementChild as HTMLElement | null; child; child = child
      .nextElementSibling as HTMLElement | null) {
      visit(child);
    }
  };

  visit(root);

  if (results.length === 0) {
    const recovered = collectRecoveryBlocks(root, options);
    if (recovered.length > 0) {
      return recovered;
    }
  }

  if (results.length === 0 && isTranslatableText(root.textContent ?? '')) {
    results.push(toBlockSeed(root));
  }

  return results;
}

function collectRecoveryBlocks(
  root: HTMLElement,
  options?: {
    range?: Range;
    allowMergedParents?: boolean;
    selectionMode?: boolean;
  },
): BlockSeed[] {
  const recovered: BlockSeed[] = [];
  root.querySelectorAll<HTMLElement>(RECOVERY_BLOCK_SELECTOR).forEach((element) => {
    if (options?.range && !options.range.intersectsNode(element)) {
      return;
    }

    if (!options?.selectionMode && element.matches(EXCLUDED_SELECTOR)) {
      return;
    }

    if (element.closest(EXCLUDED_SELECTOR)) {
      return;
    }

    if (!isEligibleBlock(element, { selectionMode: options?.selectionMode })) {
      return;
    }

    recovered.push(toBlockSeed(element));
  });

  return recovered;
}

export function resolveScopeRoot(
  documentRef: Document,
  scope: DefaultTranslationScope,
): HTMLElement {
  if (scope === 'main') {
    const candidate = resolveBestMainRoot(documentRef);

    if (candidate) {
      return candidate;
    }
  }

  return documentRef.body;
}

export function debugCollectRecoveryProbe(root: HTMLElement): {
  recoveryCandidateCount: number;
  eligibleRecoveryCount: number;
  reasonCounts: Record<string, number>;
  samples: Array<{
    tagName: string;
    textLength: number;
    preview: string;
    reason: string | null;
  }>;
} {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(RECOVERY_BLOCK_SELECTOR));
  const samples = candidates.slice(0, 12).map((element) => {
    const text = normalizeText(element.textContent ?? '');
    const reason = !element.closest(EXCLUDED_SELECTOR)
      ? resolveBlockIneligibilityReason(element)
      : 'excluded-ancestor';
    return {
      tagName: element.tagName.toLowerCase(),
      textLength: text.length,
      preview: text.slice(0, 160),
      reason,
    };
  });

  const reasonCounts: Record<string, number> = {};
  const eligibleRecoveryCount = candidates.filter((element) => {
    let reason: string | null = null;
    if (element.closest(EXCLUDED_SELECTOR)) {
      reason = 'excluded-ancestor';
    } else {
      reason = resolveBlockIneligibilityReason(element);
    }
    reasonCounts[reason ?? 'eligible'] = (reasonCounts[reason ?? 'eligible'] ?? 0) + 1;

    if (reason === 'excluded-ancestor') {
      return false;
    }
    return reason === null;
  }).length;

  return {
    recoveryCandidateCount: candidates.length,
    eligibleRecoveryCount,
    reasonCounts,
    samples,
  };
}

function resolveBestMainRoot(documentRef: Document): HTMLElement | null {
  const body = documentRef.body;
  const bodyTextLength = normalizeText(body.textContent ?? '').length;
  const candidates = collectMainRootCandidates(documentRef);

  let bestCandidate: HTMLElement | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    const score = scoreMainRootCandidate(candidate, bodyTextLength);
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  if (bestCandidate && bestScore > 0) {
    return bestCandidate;
  }

  return (
    documentRef.querySelector<HTMLElement>('main') ??
    documentRef.querySelector<HTMLElement>('article') ??
    documentRef.querySelector<HTMLElement>('[role="main"]') ??
    null
  );
}

function collectMainRootCandidates(documentRef: Document): HTMLElement[] {
  const candidates = new Set<HTMLElement>();

  documentRef.querySelectorAll<HTMLElement>(MAIN_CANDIDATE_SELECTOR).forEach((element) => {
    if (!element.matches(EXCLUDED_SELECTOR)) {
      candidates.add(element);
    }
  });

  Array.from(documentRef.body.children).forEach((child) => {
    if (child instanceof HTMLElement && !child.matches(EXCLUDED_SELECTOR)) {
      candidates.add(child);
    }
  });

  return Array.from(candidates);
}

function scoreMainRootCandidate(candidate: HTMLElement, bodyTextLength: number): number {
  const totalTextLength = normalizeText(candidate.textContent ?? '').length;
  if (totalTextLength < MAIN_ROOT_MIN_TEXT_CHARS) {
    return Number.NEGATIVE_INFINITY;
  }

  const excludedTextLength = collectExcludedDescendantText(candidate);
  const contentTextLength = Math.max(0, totalTextLength - excludedTextLength);
  if (contentTextLength < 80) {
    return Number.NEGATIVE_INFINITY;
  }

  const descendantCount = candidate.querySelectorAll('*').length;
  const paragraphCount = candidate.querySelectorAll('p, li, dd, dt, blockquote').length;
  const headingCount = candidate.querySelectorAll('h1, h2, h3').length;
  const structuredContentCount = candidate.querySelectorAll('figure, pre, table, math').length;
  const linkTextLength = Array.from(candidate.querySelectorAll('a')).reduce(
    (sum, link) => sum + normalizeText(link.textContent ?? '').length,
    0,
  );
  const normalizedHints = [
    candidate.id,
    candidate.getAttribute('role') ?? '',
    candidate.className || '',
    candidate.tagName.toLowerCase(),
  ].join(' ');

  let score = contentTextLength;
  score += Math.min(260, (contentTextLength / Math.max(1, descendantCount + 1)) * 6);
  score += paragraphCount * 22;
  score += headingCount * 64;
  score += structuredContentCount * 18;
  score += resolveMainRootHintBonus(candidate, normalizedHints);
  score -= excludedTextLength * 1.15;
  score -= Math.min(240, linkTextLength * 0.35);

  if (bodyTextLength > 0) {
    const bodyShare = contentTextLength / bodyTextLength;
    if (bodyShare > 0.92) {
      score -= 220;
    } else if (bodyShare > 0.8) {
      score -= 120;
    }
  }

  return score;
}

function resolveMainRootHintBonus(candidate: HTMLElement, normalizedHints: string): number {
  let bonus = 0;

  if (candidate.matches('main, article, [role="main"]')) {
    bonus += 220;
  }

  if (MAIN_POSITIVE_HINT_PATTERN.test(normalizedHints)) {
    bonus += 180;
  }

  if (MAIN_NEGATIVE_HINT_PATTERN.test(normalizedHints)) {
    bonus -= 320;
  }

  return bonus;
}

function collectExcludedDescendantText(candidate: HTMLElement): number {
  let total = 0;

  candidate.querySelectorAll<HTMLElement>(EXCLUDED_SELECTOR).forEach((element) => {
    total += normalizeText(element.textContent ?? '').length;
  });

  return total;
}

function isXmlLikeDocument(documentRef: Document): boolean {
  const contentType = (documentRef.contentType || '').toLowerCase();
  return contentType.includes('xml') && contentType !== 'text/html';
}

export function collectTranslatableBlocks(root: HTMLElement): BlockSeed[] {
  return collectBlocks(root);
}

export function collectSelectionBlocks(selection: Selection): BlockSeed[] {
  if (selection.rangeCount === 0) {
    return [];
  }

  const range = selection.getRangeAt(0);
  const commonAncestor =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement;

  const root = commonAncestor ?? document.body ?? document.documentElement;
  return collectBlocks(root, {
    range,
    allowMergedParents: false,
    selectionMode: true,
  });
}

export function isLikelyAlreadyTargetLanguage(text: string, targetLanguage: string): boolean {
  const normalized = normalizeText(text);
  const sample = Array.from(normalized).filter((char) => /\p{L}/u.test(char));
  if (sample.length < 12) {
    return false;
  }

  const scriptRatio = resolveTargetScriptRatio(sample.join(''), targetLanguage.toLowerCase());
  return scriptRatio >= 0.45;
}

/**
 * Detect if a translation result appears to still be in the source language
 * (i.e., the model returned source text instead of a real translation).
 * Only meaningful when the target language uses a distinct script (CJK, Cyrillic, etc.).
 */
export function isLikelyUntranslated(
  translatedText: string,
  sourceText: string,
  targetLanguage: string,
  options?: { minLetters?: number },
): boolean {
  const lang = targetLanguage.toLowerCase();
  if (!hasDistinctTargetScript(lang)) {
    return false;
  }

  // Skip math/formula fragments — short text consisting only of Latin letters,
  // Greek letters, digits, math symbols, and punctuation is not translatable content.
  const stripped = normalizeText(sourceText).replace(/[\s\d=+\-*/<>≤≥≠≈∈∉⊂⊃∪∩∀∃→←↔×⊗⊕⟨⟩{}()\[\]|,.:;!?'"^_\\]/g, '');
  if (stripped.length <= 8 && /^[\p{Script=Latin}\p{Script=Greek}]*$/u.test(stripped)) {
    return false;
  }

  const minLetters = options?.minLetters ?? 16;

  const normalized = normalizeText(translatedText);
  const letters = Array.from(normalized).filter((char) => /\p{L}/u.test(char));
  if (letters.length < minLetters) {
    return false;
  }

  const targetRatio = resolveTargetScriptRatio(letters.join(''), lang);
  if (targetRatio >= 0.08) {
    return false;
  }

  const sourceNormalized = normalizeText(sourceText);
  const sourceLetters = Array.from(sourceNormalized).filter((char) => /\p{L}/u.test(char));
  if (sourceLetters.length < minLetters) {
    return false;
  }

  const sourceTargetRatio = resolveTargetScriptRatio(sourceLetters.join(''), lang);
  return sourceTargetRatio < 0.08;
}

/**
 * Detect if a translation result contains long stretches of source-language text
 * mixed with target-language text. Catches cases like:
 * - "Often the term 'representation of G' is also used for the representation space V."
 *   (entire English sentence left in a Japanese paragraph)
 * - "The trivial representation is given by ρ(s) = Id for all_s ∈ G.に対して与えられる。"
 *   (English sentence with Japanese appended)
 */
export function hasMixedLanguageContent(
  translatedText: string,
  sourceText: string,
  targetLanguage: string,
): boolean {
  const lang = targetLanguage.toLowerCase();
  if (!hasDistinctTargetScript(lang)) {
    return false;
  }

  // Strip HTML tags, protected markers, and control characters
  const cleaned = translatedText
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[\/?[tx]\d+\]\]/gi, '')
    .replace(/\{\\displaystyle[^}]*\}/g, '')
    .replace(/[\u0000-\u001f]/g, '');

  const letters = Array.from(cleaned).filter((c) => /\p{L}/u.test(c));
  if (letters.length < 20) {
    return false;
  }

  // If there's almost no target script, isLikelyUntranslated handles it
  const targetRatio = resolveTargetScriptRatio(letters.join(''), lang);
  if (targetRatio < 0.05) {
    return false;
  }

  // Extract runs of consecutive Latin characters (including spaces between words)
  const latinRuns = extractLatinWordRuns(cleaned);
  const sourceLower = sourceText.toLowerCase();

  for (const run of latinRuns) {
    const words = run.split(/\s+/).filter((w) => /^[a-zA-Z]{2,}$/.test(w));
    if (words.length < 4) {
      continue;
    }

    // Check if this run exists in the source text (avoid false positives on generated text)
    const runNormalized = run.toLowerCase().replace(/\s+/g, ' ').trim();
    const matchLength = Math.min(40, runNormalized.length);
    if (sourceLower.includes(runNormalized.substring(0, matchLength))) {
      return true;
    }
  }

  // Also check for long Latin letter sequences (30+ characters)
  for (const run of latinRuns) {
    const latinLetters = (run.match(/[a-zA-Z]/g) || []).length;
    if (latinLetters >= 30) {
      return true;
    }
  }

  return false;
}

function extractLatinWordRuns(text: string): string[] {
  const runs: string[] = [];
  let current = '';

  for (const char of text) {
    if (/\p{Script=Latin}/u.test(char) || (current.length > 0 && /[\s\-'.,;:()]/.test(char))) {
      current += char;
    } else {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        runs.push(trimmed);
      }
      current = '';
    }
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) {
    runs.push(trimmed);
  }

  return runs;
}

function hasDistinctTargetScript(targetLanguage: string): boolean {
  return (
    targetLanguage.startsWith('ja') ||
    targetLanguage.startsWith('zh') ||
    targetLanguage.startsWith('ko') ||
    targetLanguage.startsWith('th') ||
    targetLanguage.startsWith('ru') ||
    targetLanguage.startsWith('uk') ||
    targetLanguage.startsWith('ar') ||
    targetLanguage.startsWith('he') ||
    targetLanguage.startsWith('hi')
  );
}

function resolveLinkDensity(element: HTMLElement, normalizedLength: number): number {
  if (normalizedLength === 0) {
    return 0;
  }

  const linkTextLength = Array.from(element.querySelectorAll('a')).reduce(
    (sum, link) => {
      if (link.closest('sup.reference, sup.noprint, .reference')) {
        return sum;
      }
      return sum + normalizeText(link.textContent ?? '').length;
    },
    0,
  );
  return linkTextLength / normalizedLength;
}

function isCitationLikeBlock(element: HTMLElement, normalized: string): boolean {
  if (
    element.matches(
      'sup, .reference, .references, .reflist, ol.references li, .mw-editsection, .hatnote',
    )
  ) {
    return true;
  }

  if (CITATION_LIKE_TEXT_PATTERN.test(normalized) && normalized.length <= 240) {
    return true;
  }

  return (
    normalized.length <= 120 &&
    /\[[0-9,\s]+\]/.test(normalized) &&
    normalized.replace(/\[[0-9,\s]+\]/g, '').trim().length <= 40
  );
}

function resolveSectionContext(element: HTMLElement): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  const pageHeading = normalizeText(
    document.querySelector<HTMLElement>('main h1, article h1, h1')?.textContent ?? '',
  );

  if (pageHeading) {
    parts.push(pageHeading);
    seen.add(pageHeading);
  }

  const localHeading = findNearestHeadingText(element);
  if (localHeading && !seen.has(localHeading)) {
    parts.push(localHeading);
  }

  return parts.slice(-2).join(' > ');
}

const SEE_ALSO_HEADING_PATTERN = /^see also$/i;

function isNonReaderSectionBlock(element: HTMLElement): boolean {
  const heading = findNearestHeadingText(element);
  if (!heading || !NON_READER_SECTION_HEADING_PATTERN.test(heading)) {
    return false;
  }

  // "See also" section list items are short navigational links worth translating
  if (
    SEE_ALSO_HEADING_PATTERN.test(heading) &&
    (element.tagName === 'LI' || element.tagName === 'UL')
  ) {
    return false;
  }

  return true;
}

function findNearestHeadingText(element: HTMLElement): string {
  let current: HTMLElement | null = element;

  while (current) {
    let sibling = current.previousElementSibling as HTMLElement | null;
    while (sibling) {
      const heading = findLastHeadingTextInSubtree(sibling);
      if (heading) {
        return heading;
      }
      sibling = sibling.previousElementSibling as HTMLElement | null;
    }

    current = current.parentElement;
    if (current && HEADING_TAGS.has(getNormalizedTagName(current))) {
      const currentHeading = normalizeText(current.textContent ?? '');
      if (currentHeading) {
        return currentHeading;
      }
    }
  }

  return '';
}

function findLastHeadingTextInSubtree(root: HTMLElement): string {
  if (HEADING_TAGS.has(getNormalizedTagName(root))) {
    return normalizeText(root.textContent ?? '');
  }

  const headings = Array.from(root.querySelectorAll<HTMLElement>(SECTION_HEADING_SELECTOR));
  for (let index = headings.length - 1; index >= 0; index -= 1) {
    const text = normalizeText(headings[index]?.textContent ?? '');
    if (text) {
      return text;
    }
  }

  return '';
}

function resolvePriorityScore(
  element: HTMLElement,
  normalizedText: string,
  top: number,
): number {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const visibleBonus = top <= viewportHeight ? 220 : top <= viewportHeight * 1.5 ? 120 : 0;
  const nearTopBonus = top >= 0 ? Math.max(0, 180 - top / 5) : 140;
  const textBonus = Math.min(200, normalizedText.length);
  const tagName = getNormalizedTagName(element);
  const tagBonus = HEADING_TAGS.has(tagName)
    ? 320 - Number.parseInt(tagName.slice(1), 10) * 24
    : tagName === 'P'
      ? 120
      : tagName === 'LI'
        ? 80
        : 40;
  const siblingHeadingBonus =
    element.previousElementSibling &&
    HEADING_TAGS.has(getNormalizedTagName(element.previousElementSibling))
      ? 140
      : 0;

  return Math.round(visibleBonus + nearTopBonus + textBonus + tagBonus + siblingHeadingBonus);
}

function resolveTargetScriptRatio(text: string, targetLanguage: string): number {
  if (targetLanguage.startsWith('ja')) {
    return countPatternMatches(text, JAPANESE_SCRIPT_PATTERN) / Array.from(text).length;
  }

  if (targetLanguage.startsWith('zh')) {
    return countPatternMatches(text, CHINESE_SCRIPT_PATTERN) / Array.from(text).length;
  }

  if (targetLanguage.startsWith('ko')) {
    return countPatternMatches(text, KOREAN_SCRIPT_PATTERN) / Array.from(text).length;
  }

  if (targetLanguage.startsWith('th')) {
    return countPatternMatches(text, THAI_SCRIPT_PATTERN) / Array.from(text).length;
  }

  if (targetLanguage.startsWith('ru') || targetLanguage.startsWith('uk')) {
    return countPatternMatches(text, CYRILLIC_SCRIPT_PATTERN) / Array.from(text).length;
  }

  if (targetLanguage.startsWith('ar')) {
    return countPatternMatches(text, ARABIC_SCRIPT_PATTERN) / Array.from(text).length;
  }

  if (targetLanguage.startsWith('he')) {
    return countPatternMatches(text, HEBREW_SCRIPT_PATTERN) / Array.from(text).length;
  }

  if (targetLanguage.startsWith('hi')) {
    return countPatternMatches(text, DEVANAGARI_SCRIPT_PATTERN) / Array.from(text).length;
  }

  return 0;
}

function countPatternMatches(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

export function buildTranslationContext(documentRef: Document): TranslationContext {
  return {
    pageTitle: documentRef.title,
    pageDescription:
      documentRef.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    pageUrl: window.location.href,
    sourceLanguage: documentRef.documentElement.lang || 'auto',
    targetLanguage: '',
  };
}
