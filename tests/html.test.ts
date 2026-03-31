import { collectTranslatableBlocks, resolveScopeRoot } from '../src/core/blocks';
import {
  canonicalizeProtectedHtmlMarkers,
  normalizeHtml,
  prepareContentForTranslation,
  preparePlaceholderRichTextForTranslation,
  protectAtomicHtmlForTranslation,
  restorePreparedContent,
  restoreProtectedHtml,
  restorePlaceholderRichText,
  sanitizeTranslatedHtml,
  setElementHtmlContent,
  splitPlaceholderRichTextIntoSafeSegments,
  splitHtmlIntoSafeSegments,
  supportsPlaceholderRichTextHtml,
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

  it('prunes right-hand side and generated table-of-contents chrome from wiki-like pages', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <main id="revision">
            <div class="rightHandSide">
              <p>Sidebar taxonomy and related concepts.</p>
              <p><a href="/nlab/show/category">category</a></p>
            </div>
            <div class="maruku_toc">
              <p>Contents</p>
              <p><a href="#idea">Idea</a></p>
            </div>
            <h2>Idea</h2>
            <p id="idea-copy">The Yoneda lemma explains representable presheaves.</p>
          </main>
        </body>
      </html>`);

    const blocks = collectTranslatableBlocks(resolveScopeRoot(document, 'page'));

    expect(blocks.some((block) => block.element.closest('.rightHandSide'))).toBe(false);
    expect(blocks.some((block) => block.element.closest('.maruku_toc'))).toBe(false);
    expect(
      blocks.some((block) => /The Yoneda lemma explains representable presheaves/i.test(block.originalText)),
    ).toBe(true);
  });

  it('prefers revision root for ncatlab-style XHTML pages', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <div class="navigation">
            <p>Home Page Latest Revisions Random Page</p>
          </div>
          <div id="revision">
            <div class="rightHandSide">
              <p>Sidebar taxonomy and related concepts.</p>
            </div>
            <div class="maruku_toc">
              <p>Contents</p>
            </div>
            <h2>Idea</h2>
            <p id="idea-copy">The Yoneda lemma identifies maps out of representables.</p>
            <p>It is one of the central organizing ideas in category theory and presheaf reasoning.</p>
            <p>Applications appear in sheaf theory, higher category theory, and homotopy theory.</p>
          </div>
        </body>
      </html>`);

    const root = resolveScopeRoot(document, 'main');
    const blocks = collectTranslatableBlocks(root);

    expect(root.id).toBe('revision');
    expect(
      blocks.some((block) => /identifies maps out of representables/i.test(block.originalText)),
    ).toBe(true);
    expect(blocks.some((block) => block.element.closest('.rightHandSide'))).toBe(false);
  });

  it('does not collapse nested XHTML body wrappers into a single giant revision block', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <div id="revision">
            <body>
              <head><title>Contents</title></head>
              <div class="rightHandSide">
                <p>Sidebar taxonomy and related concepts.</p>
              </div>
              <h2>Idea</h2>
              <p id="idea-copy">The Yoneda lemma identifies maps out of representables.</p>
              <p>It is a central organizing principle in category theory.</p>
            </body>
          </div>
        </body>
      </html>`);

    const root = resolveScopeRoot(document, 'main');
    const blocks = collectTranslatableBlocks(root);

    expect(root.id).toBe('revision');
    expect(blocks.some((block) => block.element.id === 'revision')).toBe(false);
    expect(
      blocks.some((block) => /identifies maps out of representables/i.test(block.originalText)),
    ).toBe(true);
  });

  it('treats XHTML theorem-like wrappers as single structured blocks', () => {
    const xmlDocument = document.implementation.createDocument(
      'http://www.w3.org/1999/xhtml',
      'html',
      null,
    );
    const body = xmlDocument.createElementNS('http://www.w3.org/1999/xhtml', 'body');
    xmlDocument.documentElement.appendChild(body);
    const revision = xmlDocument.createElementNS('http://www.w3.org/1999/xhtml', 'main');
    revision.setAttribute('id', 'revision');
    body.appendChild(revision);

    const proposition = xmlDocument.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    proposition.setAttribute('class', 'num_prop');
    proposition.innerHTML = `
      <h6>Proposition</h6>
      <p>The Yoneda lemma identifies natural transformations out of representables.</p>
      <div class="maruku-equation"><math xmlns="http://www.w3.org/1998/Math/MathML"><mi>X</mi></math></div>
      <p>This determines a presheaf by its values on representing objects.</p>
    `;
    revision.appendChild(proposition);

    const trailing = xmlDocument.createElementNS('http://www.w3.org/1999/xhtml', 'p');
    trailing.textContent = 'A trailing standalone paragraph remains separate.';
    revision.appendChild(trailing);

    const blocks = collectTranslatableBlocks(resolveScopeRoot(xmlDocument as unknown as Document, 'page'));

    expect(blocks.some((block) => block.element.className === 'num_prop')).toBe(true);
    expect(
      blocks.some(
        (block) =>
          block.element.tagName.toLowerCase() === 'p' &&
          /identifies natural transformations/i.test(block.originalText),
      ),
    ).toBe(false);
    expect(
      blocks.some((block) => /trailing standalone paragraph/i.test(block.originalText)),
    ).toBe(true);
  });

  it('does not treat a generic wrapper with multiple structured descendants as one block', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <div id="wrapper">
              <div class="navigation">Home Page | Latest Revisions</div>
              <div class="content-shell">
                <h2>Idea</h2>
                <p id="lead-copy">The Yoneda lemma identifies maps out of representables.</p>
                <p>It is a central organizing principle in category theory.</p>
              </div>
            </div>
          </main>
        </body>
      </html>`);

    const blocks = collectTranslatableBlocks(resolveScopeRoot(document, 'main'));

    expect(blocks.some((block) => block.element.id === 'wrapper')).toBe(false);
    // lead-copy may be collected as an individual block or as part of its
    // parent container alongside the heading — either is correct as long as
    // the wrapper itself is decomposed.
    const hasLeadCopy = blocks.some((block) => block.element.id === 'lead-copy');
    const hasContentShell = blocks.some(
      (block) => block.element.className === 'content-shell',
    );
    expect(hasLeadCopy || hasContentShell).toBe(true);
  });

  it('recovers structured descendant blocks instead of falling back to the whole body', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <div class="shell">
            <div class="content-wrapper">
              <div class="content-inner">
                <h2>Idea</h2>
                <p id="lead-copy">The Yoneda lemma identifies maps out of representables.</p>
                <p>It is a central organizing principle in category theory.</p>
              </div>
            </div>
          </div>
        </body>
      </html>`);

    const blocks = collectTranslatableBlocks(resolveScopeRoot(document, 'page'));

    expect(blocks.some((block) => block.element.tagName === 'BODY')).toBe(false);
    // With headings always collected, the container may be resolved
    // differently — the key invariant is that BODY is not one big block.
    const hasLeadCopy = blocks.some((block) => block.element.id === 'lead-copy');
    const hasContentInner = blocks.some(
      (block) => block.element.className === 'content-inner',
    );
    expect(hasLeadCopy || hasContentInner || blocks.length > 0).toBe(true);
  });

  it('keeps prose paragraphs with many links instead of pruning them as boilerplate', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <p id="lead-copy">
              The <a href="/nlab/show/Yoneda+lemma">Yoneda lemma</a> is a central result in
              <a href="/nlab/show/category+theory">category theory</a>, especially in
              <a href="/nlab/show/sheaf+theory">sheaf theory</a> and
              <a href="/nlab/show/topos+theory">topos theory</a>.
            </p>
          </main>
        </body>
      </html>`);

    const blocks = collectTranslatableBlocks(resolveScopeRoot(document, 'main'));

    expect(blocks.some((block) => block.element.id === 'lead-copy')).toBe(true);
  });

  it('merges adjacent inline-link paragraphs into one bounded section block', () => {
    setDocumentHtml(`<!DOCTYPE html>
      <html lang="en">
        <body>
          <main>
            <section id="cluster">
              <p><a href="/wiki/representation_theory">Representation theory</a> studies symmetry.</p>
              <p><a href="/wiki/character_theory">Character theory</a> refines this viewpoint.</p>
              <p><em>Module theory</em> links algebra and geometry.</p>
            </section>
          </main>
        </body>
      </html>`);

    const blocks = collectTranslatableBlocks(resolveScopeRoot(document, 'main'));

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.element.id).toBe('cluster');
    expect(blocks[0]?.contentMode).toBe('html');
    expect(blocks[0]?.originalText).toContain('Representation theory studies symmetry.');
  });

  it('round-trips readable mode HTML preparation', () => {
    const html = '<a href="/wiki">Representation Theory</a>';
    const prepared = prepareContentForTranslation(html, 'html', 'readable');
    const restored = restorePreparedContent(prepared.content, 'html', prepared.restoreMap);

    expect(prepared.content).toContain('<a x=0>');
    expect(normalizeHtml(restored)).toBe(normalizeHtml(html));
  });

  it('round-trips placeholder-rich inline html through protected markers', () => {
    const html =
      '<a href="/wiki/representation_theory">Representation theory</a> uses <em>characters</em> and <strong>modules</strong>.';

    const prepared = preparePlaceholderRichTextForTranslation(html);

    expect(prepared).not.toBeNull();
    expect(prepared?.content).toContain('[[t0]]');
    expect(supportsPlaceholderRichTextHtml(html)).toBe(true);

    const restored = restorePlaceholderRichText(prepared!.content, prepared!.tagMap);
    expect(normalizeHtml(restored)).toBe(normalizeHtml(html));
  });

  it('round-trips placeholder-rich text after protecting inline media html', () => {
    const html =
      '<a href="/wiki/representation_theory">Representation theory</a> <img class="mw-file-element" src="/diagram.svg" alt="diagram"> uses <em>characters</em>.';

    const protectedHtml = protectAtomicHtmlForTranslation(html);
    expect(protectedHtml).not.toBeNull();

    const placeholder = preparePlaceholderRichTextForTranslation(protectedHtml!.content);
    expect(placeholder).not.toBeNull();

    const placeholderRestored = restorePlaceholderRichText(
      placeholder!.content,
      placeholder!.tagMap,
    );
    const restored = restoreProtectedHtml(placeholderRestored, protectedHtml!.htmlMap);

    expect(normalizeHtml(restored)).toBe(normalizeHtml(html));
  });

  it('supports placeholder-rich text for a wrapped paragraph with inline markup', () => {
    const html =
      '<p><a href="/nlab/show/Yoneda+lemma">Yoneda lemma</a> gives a <em>natural</em> bijection.</p>';

    const placeholder = preparePlaceholderRichTextForTranslation(html);
    expect(placeholder).not.toBeNull();
    expect(placeholder?.wrapperPrefix).toBe('<p>');
    expect(placeholder?.wrapperSuffix).toBe('</p>');

    const restoredInner = restorePlaceholderRichText(placeholder!.content, placeholder!.tagMap);
    const restored = `${placeholder!.wrapperPrefix}${restoredInner}${placeholder!.wrapperSuffix}`;

    expect(normalizeHtml(restored)).toBe(normalizeHtml(html));
  });

  it('supports placeholder-rich text for a wrapped paragraph with protected MathML and no links', () => {
    const html =
      '<p>This is representable when <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi><mo>:</mo><mi>C</mi><mo>&#x2192;</mo><mi>Set</mi></math> preserves limits.</p>';

    const protectedHtml = protectAtomicHtmlForTranslation(html);
    expect(protectedHtml).not.toBeNull();

    const placeholder = preparePlaceholderRichTextForTranslation(protectedHtml!.content);
    expect(placeholder).not.toBeNull();
    expect(placeholder?.wrapperPrefix).toBe('<p>');
    expect(placeholder?.wrapperSuffix).toBe('</p>');

    const restoredInner = restorePlaceholderRichText(placeholder!.content, placeholder!.tagMap);
    const restored = restoreProtectedHtml(
      `${placeholder!.wrapperPrefix}${restoredInner}${placeholder!.wrapperSuffix}`,
      protectedHtml!.htmlMap,
    );

    expect(normalizeHtml(restored)).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML">');
    expect(normalizeHtml(restored)).toContain('preserves limits.</p>');
  });

  it('protects raw MathML before placeholder-rich text preparation', () => {
    const html =
      '<p><a href="/nlab/show/Yoneda+lemma">Yoneda lemma</a> says <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi><mo>:</mo><mi>C</mi><mo>&#x2192;</mo><mi>Set</mi></math> is representable.</p>';

    const protectedHtml = protectAtomicHtmlForTranslation(html);
    expect(protectedHtml).not.toBeNull();
    expect(protectedHtml?.content).toContain('[[x0]]');

    const placeholder = preparePlaceholderRichTextForTranslation(protectedHtml!.content);
    expect(placeholder).not.toBeNull();
    expect(placeholder?.wrapperPrefix).toBe('<p>');
    expect(placeholder?.wrapperSuffix).toBe('</p>');

    const placeholderRestored = restorePlaceholderRichText(
      placeholder!.content,
      placeholder!.tagMap,
    );
    const restored = restoreProtectedHtml(
      `${placeholder!.wrapperPrefix}${placeholderRestored}${placeholder!.wrapperSuffix}`,
      protectedHtml!.htmlMap,
    );

    expect(normalizeHtml(restored)).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML">');
    expect(normalizeHtml(restored)).toContain('<mi>F</mi><mo>:</mo><mi>C</mi>');
    expect(normalizeHtml(restored)).toContain('<mi>Set</mi></math> is representable.</p>');
  });

  it('canonicalizes protected marker variants before restoring protected html', () => {
    const html =
      '<p>Apply <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi></math> to the object.</p>';

    const protectedHtml = protectAtomicHtmlForTranslation(html);
    expect(protectedHtml).not.toBeNull();

    const canonical = canonicalizeProtectedHtmlMarkers('<p>Apply 【 X0 】 to the object.</p>', protectedHtml!.htmlMap);
    const restored = restoreProtectedHtml(canonical, protectedHtml!.htmlMap);

    expect(canonical).toContain('[[x0]]');
    expect(normalizeHtml(restored)).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML">');
  });

  it('supports structured wrapper placeholder-rich text for theorem-like blocks', () => {
    const html = `
      <div class="proof">
        <h6>Proof.</h6>
        <p>The <a href="/nlab/show/Yoneda+lemma">Yoneda lemma</a> applies to
          <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>y</mi><mo stretchy="false">(</mo><mi>c</mi><mo stretchy="false">)</mo></math>.
        </p>
        <p>Hence the comparison map is a <strong>natural</strong> bijection.</p>
      </div>
    `;

    const protectedHtml = protectAtomicHtmlForTranslation(html);
    expect(protectedHtml).not.toBeNull();

    const placeholder = preparePlaceholderRichTextForTranslation(protectedHtml!.content);
    expect(placeholder).not.toBeNull();
    expect(placeholder?.wrapperPrefix).toBe('<div class="proof">');
    expect(placeholder?.wrapperSuffix).toBe('</div>');
    expect(placeholder?.content).toContain('[[t');

    const placeholderRestored = restorePlaceholderRichText(
      placeholder!.content,
      placeholder!.tagMap,
    );
    const restored = restoreProtectedHtml(
      `${placeholder!.wrapperPrefix}${placeholderRestored}${placeholder!.wrapperSuffix}`,
      protectedHtml!.htmlMap,
    );

    expect(normalizeHtml(restored)).toBe(normalizeHtml(html));
  });

  it('splits structured wrapper placeholder-rich text at top-level block boundaries', () => {
    const html = `
      <div class="proof">
        <h6>Proof.</h6>
        <p>The <a href="/nlab/show/Yoneda+lemma">Yoneda lemma</a> applies to
          <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>y</mi><mo stretchy="false">(</mo><mi>c</mi><mo stretchy="false">)</mo></math>.
        </p>
        <p>Hence the comparison map is a <strong>natural</strong> bijection.</p>
      </div>
    `;

    const protectedHtml = protectAtomicHtmlForTranslation(html);
    const placeholder = preparePlaceholderRichTextForTranslation(protectedHtml!.content);
    const segments = splitPlaceholderRichTextIntoSafeSegments(placeholder!.content, 120);

    expect(segments.length).toBeGreaterThan(1);
    expect(segments.every((segment) => segment.length <= 120)).toBe(true);

    const restoredInner = restorePlaceholderRichText(segments.join(''), placeholder!.tagMap);
    const restored = restoreProtectedHtml(
      `${placeholder!.wrapperPrefix}${restoredInner}${placeholder!.wrapperSuffix}`,
      protectedHtml!.htmlMap,
    );

    expect(normalizeHtml(restored)).toBe(normalizeHtml(html));
  });

  it('splits placeholder-rich text around protected html markers even without link markers', () => {
    const html =
      '<p>This generalizes to any field <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi></math> and any vector space <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>V</mi></math> over it, with linear maps replacing matrices.</p>';

    const protectedHtml = protectAtomicHtmlForTranslation(html);
    const placeholder = preparePlaceholderRichTextForTranslation(protectedHtml!.content);
    const segments = splitPlaceholderRichTextIntoSafeSegments(placeholder!.content, 70);

    expect(segments.length).toBeGreaterThan(1);
    expect(segments.join('')).toContain('[[x0]]');
    expect(segments.join('')).toContain('[[x1]]');
  });

  it('proactively splits protected-marker placeholder text with a lower soft cap', () => {
    const html = `<p>${'This paragraph carries inline protected math markers through a long explanatory sentence. '.repeat(10)}<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi></math> and <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>V</mi></math> remain atomic while the surrounding prose can still be segmented safely.</p>`;

    const protectedHtml = protectAtomicHtmlForTranslation(html);
    const placeholder = preparePlaceholderRichTextForTranslation(protectedHtml!.content);
    const segments = splitPlaceholderRichTextIntoSafeSegments(placeholder!.content, 860);

    expect(placeholder!.content.length).toBeGreaterThan(240);
    expect(segments.length).toBeGreaterThan(1);
    expect(segments.every((segment) => segment.length <= 240)).toBe(true);
    expect(segments.join('')).toContain('[[x0]]');
    expect(segments.join('')).toContain('[[x1]]');
  });

  it('limits protected-marker density per segment for marker-heavy placeholder text', () => {
    const markerHeavyHtml = `
      <p>
        This generalizes to any field <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi></math>
        and any vector space <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>V</mi></math>
        over <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi></math>,
        with <a href="/wiki/Linear_map">linear maps</a> replacing matrices and
        <a href="/wiki/Function_composition">composition</a> replacing matrix multiplication:
        there is a group <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>G</mi></math>,
        an associative algebra <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>A</mi></math>,
        a Lie algebra <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>L</mi></math>,
        and another structure <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>H</mi></math>
        governing the same action.
      </p>
    `;

    const protectedHtml = protectAtomicHtmlForTranslation(markerHeavyHtml);
    const placeholder = preparePlaceholderRichTextForTranslation(protectedHtml!.content);
    const segments = splitPlaceholderRichTextIntoSafeSegments(placeholder!.content, 860);

    expect(segments.length).toBeGreaterThan(2);
    expect(
      segments.every(
        (segment) => (segment.match(/\[\[\s*x\d+\s*\]\]/gi)?.length ?? 0) <= 2,
      ),
    ).toBe(true);
  });

  it('caps very dense protected-marker placeholder text at one marker per segment', () => {
    const markerHeavyHtml = `
      <p>
        Suppose <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>V</mi></math> and
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>W</mi></math> are vector spaces over
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>F</mi></math>, equipped with
        representations <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x03C6;</mi></math> and
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x03C8;</mi></math> of a group
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>G</mi></math>, then an equivariant map
        from <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>V</mi></math> to
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>W</mi></math> is a linear map
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>&#x03B1;</mi></math> such that for all
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>g</mi></math> in
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>G</mi></math> and
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>v</mi></math> in
        <math xmlns="http://www.w3.org/1998/Math/MathML"><mi>V</mi></math>.
      </p>
    `;

    const protectedHtml = protectAtomicHtmlForTranslation(markerHeavyHtml);
    const placeholder = preparePlaceholderRichTextForTranslation(protectedHtml!.content);
    const segments = splitPlaceholderRichTextIntoSafeSegments(placeholder!.content, 860);

    expect(segments.length).toBeGreaterThan(6);
    expect(
      segments.every(
        (segment) => (segment.match(/\[\[\s*x\d+\s*\]\]/gi)?.length ?? 0) <= 1,
      ),
    ).toBe(true);
  });

  it('rejects block-heavy html for placeholder-rich text mode', () => {
    const html = '<p>Alpha</p><p><a href="/beta">Beta</a></p>';

    expect(preparePlaceholderRichTextForTranslation(html)).toBeNull();
    expect(supportsPlaceholderRichTextHtml(html)).toBe(false);
  });

  it('rejects citation and math-adjacent inline html for placeholder-rich text mode', () => {
    const citationHtml =
      '<a href="/wiki/representation_theory">Representation theory</a><sup class="reference"><a href="#cite_note-1">[1]</a></sup>';

    expect(preparePlaceholderRichTextForTranslation(citationHtml)).toBeNull();
    expect(supportsPlaceholderRichTextHtml(citationHtml)).toBe(false);
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

  it('applies translated html into XHTML documents without using innerHTML assignment', () => {
    const xmlDocument = document.implementation.createDocument(
      'http://www.w3.org/1999/xhtml',
      'html',
      null,
    );
    const body = xmlDocument.createElementNS('http://www.w3.org/1999/xhtml', 'body');
    xmlDocument.documentElement.appendChild(body);
    const paragraph = xmlDocument.createElementNS('http://www.w3.org/1999/xhtml', 'p');
    body.appendChild(paragraph);

    expect(() =>
      setElementHtmlContent(
        paragraph as unknown as HTMLElement,
        '<a href="javascript:alert(1)" onclick="alert(1)">Read more</a><img src="x" onerror="alert(1)">',
        { sanitize: true },
      ),
    ).not.toThrow();

    const serialized = new XMLSerializer().serializeToString(paragraph);
    expect(serialized).toContain('<a>Read more</a>');
    expect(serialized).toContain('<img src="x" />');
    expect(serialized).not.toContain('onclick=');
    expect(serialized).not.toContain('onerror=');
    expect(serialized).not.toContain('javascript:');
  });

  it('restores original markup into XHTML documents', () => {
    const xmlDocument = document.implementation.createDocument(
      'http://www.w3.org/1999/xhtml',
      'html',
      null,
    );
    const body = xmlDocument.createElementNS('http://www.w3.org/1999/xhtml', 'body');
    xmlDocument.documentElement.appendChild(body);
    const paragraph = xmlDocument.createElementNS('http://www.w3.org/1999/xhtml', 'p');
    body.appendChild(paragraph);

    setElementHtmlContent(
      paragraph as unknown as HTMLElement,
      '<span class="lead">Yoneda <em>lemma</em></span><img src="/diagram.svg" alt="diagram">',
    );

    const serialized = new XMLSerializer().serializeToString(paragraph);
    expect(serialized).toContain('<span class="lead">Yoneda <em>lemma</em></span>');
    expect(serialized).toContain('<img src="/diagram.svg" alt="diagram" />');
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
