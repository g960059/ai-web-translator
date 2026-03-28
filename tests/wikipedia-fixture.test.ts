import { TranslationController } from '../src/content/translation-controller';
import { createSettings, loadFixture, setDocumentHtml } from './test-utils';
import { getChromeMock } from './setup';
import { waitFor } from '@testing-library/react';

function translateWikipediaFragment(fragment: string): string {
  const root = parseFragment(fragment);
  const normalizedFragment = fragment.replace(/\s+/g, ' ').trim();
  const normalizedText = (root.textContent ?? '').replace(/\s+/g, ' ').trim();

  if (
    normalizedFragment.includes('A <b>linear representation</b>') ||
    normalizedText.includes('A linear representation')
  ) {
    const math = root.querySelectorAll('.mwe-math-element');
    const links = root.querySelectorAll('a');

    return [
      `まず ${math[0]?.outerHTML} を ${math[1]?.outerHTML}-ベクトル空間、${math[2]?.outerHTML} を有限群とします。`,
      `${math[3]?.outerHTML} の <b>線形表現</b> とは、${links[0]?.outerHTML} ${math[4]?.outerHTML} のことです。`,
      `ここで ${math[5]?.outerHTML} は ${links[1]?.outerHTML}、${math[6]?.outerHTML} は ${links[2]?.outerHTML} を表します。`,
      `つまり、線形表現とは ${math[7]?.outerHTML} で、すべての ${math[9]?.outerHTML} に対して ${math[8]?.outerHTML} を満たす写像です。`,
    ].join(' ');
  }

  if (/diagram commutes/i.test(normalizedText)) {
    const math = root.querySelector('.mwe-math-element');
    const diagram = root.querySelector('[typeof="mw:File"]');
    return `言い換えると、すべての ${math?.outerHTML} に対して次の図式は可換です: ${diagram?.outerHTML}`;
  }

  if (/following three maps|three maps:/i.test(normalizedText)) {
    const rho = root.querySelector('.mwe-math-element');
    return `言い換えると、${rho?.outerHTML} は次の 3 つの写像のいずれかです:`;
  }

  if (/group homomorphism defined by/i.test(normalizedText)) {
    const math = root.querySelectorAll('.mwe-math-element');
    return `ここで ${math[0]?.outerHTML} とし、${math[1]?.outerHTML} を次で定まる群準同型とします:`;
  }

  if (normalizedText.includes('Such a map is also called')) {
    const math = root.querySelector('.mwe-math-element');
    const link = root.querySelector('a');
    return `このような写像は <b>${math?.outerHTML}–線形写像</b>、または <b>${link?.outerHTML}</b> とも呼ばれます。`;
  }

  return fragment;
}

function parseFragment(fragment: string): HTMLElement {
  const parsed = new DOMParser().parseFromString(`<div>${fragment}</div>`, 'text/html');
  return parsed.body.firstElementChild as HTMLElement;
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
