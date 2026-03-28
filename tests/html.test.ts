import { collectTranslatableBlocks, resolveScopeRoot } from '../src/core/blocks';
import {
  normalizeHtml,
  prepareContentForTranslation,
  restorePreparedContent,
  sanitizeTranslatedHtml,
  splitHtmlIntoSafeSegments,
} from '../src/core/html';
import { loadFixture, setDocumentHtml } from './test-utils';

describe('core html and block extraction', () => {
  it('collects leaf blocks from main content and whole page scopes', () => {
    setDocumentHtml(loadFixture('article.html'));

    const mainBlocks = collectTranslatableBlocks(resolveScopeRoot(document, 'main'));
    const pageBlocks = collectTranslatableBlocks(resolveScopeRoot(document, 'page'));

    expect(mainBlocks.map((block) => block.element.id)).toEqual([
      '',
      'lead',
      'detail',
      '',
    ]);
    expect(pageBlocks.some((block) => block.element.id === 'footer-copy')).toBe(false);
    expect(mainBlocks.find((block) => block.element.id === 'lead')?.contentMode).toBe('text');
    expect(mainBlocks.filter((block) => block.element.tagName === 'UL')).toHaveLength(1);
  });

  it('prefers the most article-like content root when semantic main tags are absent', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <header>
            <nav>Home Docs Pricing Blog About Contact</nav>
          </header>
          <div class="layout">
            <aside class="sidebar">
              <p>Docs Guides API Blog Pricing Contact</p>
              <p>Share Search Menu Previous Next</p>
            </aside>
            <section id="story" class="page-content article-body">
              <h1>Representation theory</h1>
              <p id="story-lead">Representation theory studies how algebraic structures act on vector spaces.</p>
              <p>Characters encode traces of these linear actions.</p>
              <p>Applications appear in physics, number theory, and combinatorics.</p>
            </section>
          </div>
          <footer>Related posts and navigation links.</footer>
        </body>
      </html>`);

    const root = resolveScopeRoot(document, 'main');
    const blocks = collectTranslatableBlocks(root);

    expect(root.id).toBe('story');
    expect(
      blocks.some((block) =>
        block.originalText.includes(
          'Representation theory studies how algebraic structures act on vector spaces.',
        ),
      ),
    ).toBe(true);
    expect(blocks.some((block) => /share search menu/i.test(block.originalText))).toBe(false);
  });

  it('round-trips readable mode HTML preparation', () => {
    const html = '<a href="/wiki">Representation Theory</a>';
    const prepared = prepareContentForTranslation(html, 'html', 'readable');
    const restored = restorePreparedContent(prepared.content, 'html', prepared.restoreMap);

    expect(prepared.content).toContain('data-ai-tx-attrs');
    expect(normalizeHtml(restored)).toBe(normalizeHtml(html));
  });

  it('splits oversized html at safe node boundaries while preserving markup order', () => {
    const html = [
      '<span><a href="/alpha">Alpha segment with enough text to matter.</a></span>',
      '<span><a href="/beta">Beta segment with enough text to matter.</a></span>',
      '<span><a href="/gamma">Gamma segment with enough text to matter.</a></span>',
      '<span><a href="/delta">Delta segment with enough text to matter.</a></span>',
    ].join('');

    const segments = splitHtmlIntoSafeSegments(html, 140);

    expect(segments.length).toBeGreaterThan(1);
    expect(segments.every((segment) => normalizeHtml(segment).length <= 140)).toBe(true);
    expect(normalizeHtml(segments.join(''))).toBe(normalizeHtml(html));
  });

  it('sanitizes dangerous translated html before insertion', () => {
    const sanitized = sanitizeTranslatedHtml(
      '<a href="javascript:alert(1)" onclick="alert(1)">Read more</a><img src="x" onerror="alert(1)"><script>alert(1)</script>',
    );

    expect(sanitized).toContain('<a>Read more</a>');
    expect(sanitized).toContain('<img src="x">');
    expect(sanitized).not.toContain('onclick=');
    expect(sanitized).not.toContain('onerror=');
    expect(sanitized).not.toContain('javascript:');
    expect(sanitized).not.toContain('<script>');
  });

  it('escapes double quotes in serialized opening tags', () => {
    const html = '<span data-title="He said &quot;hi&quot;">Quoted</span><span>tail</span>';

    const segments = splitHtmlIntoSafeSegments(html, 40);

    expect(segments.length).toBeGreaterThan(1);
    expect(segments.join('')).toContain('&quot;');
  });

  it('skips zero-size blocks when collecting visible translation targets', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="hidden-copy">Invisible but in the DOM with enough text to otherwise translate.</p>
            <p id="visible-copy">Visible copy with enough text to translate safely.</p>
          </main>
        </body>
      </html>`);

    const hidden = document.getElementById('hidden-copy') as HTMLElement;
    const visible = document.getElementById('visible-copy') as HTMLElement;
    hidden.getBoundingClientRect = () =>
      ({
        width: 0,
        height: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    visible.getBoundingClientRect = () =>
      ({
        width: 400,
        height: 40,
        top: 100,
        bottom: 140,
        left: 0,
        right: 400,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      }) as DOMRect;

    const blocks = collectTranslatableBlocks(resolveScopeRoot(document, 'main'));

    expect(blocks.find((block) => block.element.id === 'hidden-copy')?.isVisible).toBe(false);
    expect(blocks.find((block) => block.element.id === 'visible-copy')?.isVisible).toBe(true);
  });

  it('prunes reference-heavy and wiki chrome blocks from page extraction', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <main class="mw-parser-output">
            <div class="toc">Contents 1. History 2. Examples</div>
            <table class="infobox"><tr><td>Group theory quick facts</td></tr></table>
            <p id="lead">Representation theory studies symmetry through linear actions.</p>
            <ol class="references">
              <li>Retrieved 2026. ISBN 123-4. doi example.</li>
            </ol>
          </main>
        </body>
      </html>`);

    const blocks = collectTranslatableBlocks(resolveScopeRoot(document, 'page'));

    expect(
      blocks.some((block) =>
        block.originalText.includes(
          'Representation theory studies symmetry through linear actions.',
        ),
      ),
    ).toBe(true);
    expect(
      blocks.some((block) => block.originalText.includes('Contents 1. History 2. Examples')),
    ).toBe(false);
    expect(
      blocks.some((block) => block.originalText.includes('Retrieved 2026. ISBN 123-4. doi example.')),
    ).toBe(false);
  });
});
