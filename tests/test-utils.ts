import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ExtensionSettings } from '../src/shared/types';

export function loadFixture(name: string): string {
  return readFileSync(resolve(process.cwd(), 'tests/fixtures', name), 'utf8');
}

export function setDocumentHtml(html: string): void {
  document.documentElement.innerHTML = html;
}

export function createSettings(overrides: Partial<ExtensionSettings> = {}): ExtensionSettings {
  return {
    provider: 'openrouter',
    apiKey: 'test-api-key',
    model: 'google/gemini-3.1-flash-lite-preview',
    modelPreset: 'custom',
    targetLanguage: 'ja',
    style: 'auto',
    translateFullPage: false,
    cacheEnabled: true,
    ...overrides,
  };
}

export function selectElementContents(element: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) {
    throw new Error('Selection API is unavailable.');
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function getWidgetHost(): HTMLDivElement {
  const host = document.querySelector(
    '[data-ai-web-translator-widget="true"]',
  ) as HTMLDivElement | null;
  if (!host) {
    throw new Error('Translation widget host was not found.');
  }
  return host;
}

export function getWidgetShadowRoot(): ShadowRoot {
  const shadowRoot = getWidgetHost().shadowRoot;
  if (!shadowRoot) {
    throw new Error('Translation widget shadow root was not found.');
  }
  return shadowRoot;
}
