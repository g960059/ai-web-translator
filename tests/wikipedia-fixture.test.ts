import { TranslationController } from '../src/content/translation-controller';
import { createSettings, loadFixture, setDocumentHtml } from './test-utils';
import { getChromeMock } from './setup';
import { waitFor } from '@testing-library/react';

function translateWikipediaFragment(fragment: string): string {
  return fragment
    .replace(/\blinear representation\b/gi, '線形表現')
    .replace(/\bfollowing three maps\b/gi, '次の 3 つの写像')
    .replace(/\bthree maps:\b/gi, '3 つの写像:')
    .replace(/\bgroup homomorphism defined by\b/gi, '次で定まる群準同型')
    .replace(/\bthe following diagram commutes\b/gi, '次の図式は可換')
    .replace(/\bdiagram commutes\b/gi, '図式は可換')
    .replace(/\bSuch a map is also called\b/gi, 'このような写像は')
    .replace(/\bequivariant map\b/gi, '線形写像')
    .replace(/\brepresentation theory\b/gi, '表現論');
}

describe('Wikipedia-derived mathematical fixture', () => {
  it('translates mathematical and diagram-heavy Wikipedia markup without breaking formulas', async () => {
    setDocumentHtml(loadFixture('wikipedia-representation-theory.html'));

    const chromeMock = getChromeMock();
    const settings = createSettings({ style: 'source-like' });
    const providerCalls: string[] = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: { type: string; request?: { fragments: string[] } }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(...message.request.fragments);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map(translateWikipediaFragment),
            },
          };
        }

        return { ok: true };
      },
    );

    const initialMathElements = document.querySelectorAll('.mwe-math-element').length;
    const initialFallbackImages = document.querySelectorAll('.mwe-math-fallback-image-inline').length;
    const controller = new TranslationController(document);

    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.some((fragment) => fragment.includes('linear representation'))).toBe(true);

    await waitFor(() => {
      expect(document.getElementById('cases-lead')?.textContent).toContain('3 つの写像');
      expect(document.getElementById('matrix-lead')?.textContent).toContain('群準同型');
      expect(document.getElementById('diagram-paragraph')?.textContent).toContain('図式は可換');
      expect(document.getElementById('diagram-tail')?.textContent).toContain('線形写像');
    });

    expect(document.querySelectorAll('.mwe-math-element')).toHaveLength(initialMathElements);
    expect(document.querySelectorAll('.mwe-math-fallback-image-inline')).toHaveLength(
      initialFallbackImages,
    );

    expect(document.getElementById('linear-representation')?.textContent).toContain('線形表現');
    expect(document.getElementById('cases-lead')?.textContent).toContain('3 つの写像');
    expect(document.getElementById('matrix-lead')?.textContent).toContain('群準同型');
    expect(document.getElementById('diagram-paragraph')?.textContent).toContain('図式は可換');
    expect(document.getElementById('diagram-tail')?.textContent).toContain('線形写像');

    const diagramImage = document.querySelector(
      '#diagram-paragraph img.mw-file-element',
    ) as HTMLImageElement | null;
    expect(diagramImage?.src).toContain('Equivariant_map.svg');

    const casesImage = document.querySelector('#cases-block img') as HTMLImageElement | null;
    expect(casesImage?.alt).toContain('\\begin{cases}');

    const matrixImage = document.querySelector('#matrix-block img') as HTMLImageElement | null;
    expect(matrixImage?.alt).toContain('\\begin{pmatrix}');

    expect(
      document.querySelector('#linear-representation a[title="General linear group"]'),
    ).toBeInTheDocument();
    expect(document.querySelector('#diagram-tail a[title="Equivariant map"]')).toBeInTheDocument();
  });
});
