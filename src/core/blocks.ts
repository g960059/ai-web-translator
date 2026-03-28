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
  '.infobox',
  '.portal',
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
  /(main|content|article|entry|post|story|body|markdown|document|doc|wiki|reader)/i;
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

function isTranslatableText(text: string): boolean {
  const normalized = normalizeText(text);
  return normalized.length > 1 && /[\p{L}\p{N}]/u.test(normalized);
}

function hasBlockChild(element: HTMLElement): boolean {
  for (let child = element.firstElementChild; child; child = child.nextElementSibling) {
    if (BLOCK_TAGS.has(child.tagName)) {
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
  const normalized = normalizeText(text).toLowerCase();
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
    element.querySelectorAll('a').length >= 2
  ) {
    return true;
  }

  if (
    normalized.length <= 420 &&
    resolveLinkDensity(element, normalized.length) >= 0.45 &&
    element.querySelectorAll('a').length >= 4
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

  return descendants.every((node) => TEXT_FRIENDLY_INLINE_TAGS.has(node.tagName));
}

function getMergeableTextChildren(element: HTMLElement): HTMLElement[] | null {
  if (!MERGEABLE_PARENT_TAGS.has(element.tagName)) {
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
    if (!MERGEABLE_CHILD_TAGS.has(child.tagName)) {
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
  if (element.matches(EXCLUDED_SELECTOR)) {
    return false;
  }

  if (!BLOCK_TAGS.has(element.tagName)) {
    return false;
  }

  if (hasBlockChild(element)) {
    return false;
  }

  const text = element.textContent ?? '';
  if (!isTranslatableText(text)) {
    return false;
  }

  return !isBoilerplateBlock(element, text, options);
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

  if (results.length === 0 && isTranslatableText(root.textContent ?? '')) {
    results.push(toBlockSeed(root));
  }

  return results;
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

function resolveLinkDensity(element: HTMLElement, normalizedLength: number): number {
  if (normalizedLength === 0) {
    return 0;
  }

  const linkTextLength = Array.from(element.querySelectorAll('a')).reduce(
    (sum, link) => sum + normalizeText(link.textContent ?? '').length,
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

function isNonReaderSectionBlock(element: HTMLElement): boolean {
  const heading = findNearestHeadingText(element);
  return Boolean(heading && NON_READER_SECTION_HEADING_PATTERN.test(heading));
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
    if (current && HEADING_TAGS.has(current.tagName)) {
      const currentHeading = normalizeText(current.textContent ?? '');
      if (currentHeading) {
        return currentHeading;
      }
    }
  }

  return '';
}

function findLastHeadingTextInSubtree(root: HTMLElement): string {
  if (HEADING_TAGS.has(root.tagName)) {
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
  const tagBonus = HEADING_TAGS.has(element.tagName)
    ? 320 - Number.parseInt(element.tagName.slice(1), 10) * 24
    : element.tagName === 'P'
      ? 120
      : element.tagName === 'LI'
        ? 80
        : 40;
  const siblingHeadingBonus =
    element.previousElementSibling && HEADING_TAGS.has(element.previousElementSibling.tagName)
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
