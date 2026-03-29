import { waitFor } from '@testing-library/react';
import { TranslationController } from '../src/content/translation-controller';
import { getChromeMock } from './setup';
import { createSettings, loadFixture, setDocumentHtml } from './test-utils';

function translateFiniteGroupsFragment(fragment: string): string {
  return fragment
    .replace(/\boperations of groups on vector spaces\b/gi, '群のベクトル空間への作用')
    .replace(/\bpermutation representations\b/gi, '置換表現')
    .replace(/\bMaschke\b/gi, 'Maschke')
    .replace(/\blinear representation\b/gi, '線形表現')
    .replace(/\bgroup homomorphism\b/gi, '群準同型')
    .replace(/\bequivariant\b/gi, '同変')
    .replace(/\bcharacter of the representation\b/gi, '表現の指標');
}

describe('Wikipedia-derived finite-groups mathematical fixture', () => {
  it('translates finite-groups math and diagram-heavy markup without breaking formulas or media', async () => {
    setDocumentHtml(loadFixture('wikipedia-representation-theory-of-finite-groups.html'));

    const chromeMock = getChromeMock();
    const settings = createSettings({ style: 'source-like' });
    const providerCalls: Array<{
      contentMode: string;
      fragments: string[];
      hasProtectedMarkers?: boolean;
      fragmentIds?: string[];
    }> = [];

    (chromeMock.runtime.sendMessage as any).mockImplementation(
      async (message: {
        type: string;
        request?: {
          contentMode: string;
          fragments: string[];
          hasProtectedMarkers?: boolean;
          fragmentIds?: string[];
        };
      }) => {
        if (message.type === 'SESSION_STATE_CHANGED') {
          return { ok: true };
        }

        if (message.type === 'TRANSLATE_API' && message.request) {
          providerCalls.push(message.request);
          return {
            ok: true,
            result: {
              translations: message.request.fragments.map(translateFiniteGroupsFragment),
            },
          };
        }

        return { ok: true };
      },
    );

    const initialMathElements = document.querySelectorAll('.mwe-math-element').length;
    const initialFallbackImages = document.querySelectorAll('.mwe-math-fallback-image-inline').length;
    const initialMediaImages = document.querySelectorAll('img.mw-file-element').length;
    const controller = new TranslationController(document);

    const response = await controller.handleMessage({
      type: 'START_TRANSLATION',
      settings,
      scope: 'main',
    });

    expect(response.ok).toBe(true);
    expect(providerCalls.some((request) => request.hasProtectedMarkers)).toBe(true);
    expect(providerCalls.some((request) => request.contentMode === 'text')).toBe(true);
    expect(providerCalls.some((request) => request.fragments.some((fragment) => fragment.includes('[[x')))).toBe(
      true,
    );

    await waitFor(() => {
      expect(document.getElementById('intro-paragraph')?.textContent).toContain('群のベクトル空間への作用');
      expect(document.getElementById('matrix-paragraph')?.textContent).toContain('群準同型');
      expect(document.getElementById('equivariant-tail')?.textContent).toContain('同変');
      expect(document.getElementById('character-paragraph')?.textContent).toContain('指標');
    });

    expect(document.querySelectorAll('.mwe-math-element')).toHaveLength(initialMathElements);
    expect(document.querySelectorAll('.mwe-math-fallback-image-inline')).toHaveLength(
      initialFallbackImages,
    );
    expect(document.querySelectorAll('img.mw-file-element')).toHaveLength(initialMediaImages);

    const diagramImage = document.querySelector(
      '#equivariant-block img.mw-file-element',
    ) as HTMLImageElement | null;
    expect(diagramImage?.src).toContain('Equivariant_map.svg');

    expect(
      document.querySelector('#intro-paragraph a[href="/wiki/Permutation_representation"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('#equivariant-tail a[href="/wiki/Equivariant_map"]'),
    ).toBeInTheDocument();

    const matrixImages = Array.from(
      document.querySelectorAll('#matrix-paragraph img.mwe-math-fallback-image-inline'),
    ) as HTMLImageElement[];
    expect(matrixImages.some((image) => image.alt.includes('\\begin{pmatrix}'))).toBe(true);
  });
});
