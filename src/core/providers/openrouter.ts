import type {
  ProviderModelInfo,
  TranslationBatchRequest,
  TranslationBatchResult,
} from '../../shared/types';
import { estimateCompletionTokensForBatch } from '../analysis';

interface OpenRouterModelsResponse {
  data?: Array<{
    id: string;
    name?: string;
    pricing?: {
      prompt?: string;
      completion?: string;
    };
  }>;
}

export const OPENROUTER_REQUEST_TIMEOUT_MS = 30_000;
export const OPENROUTER_WARMUP_TIMEOUT_MS = 8_000;
const OPENROUTER_MAX_OUTPUT_TOKENS_MIN = 400;
const OPENROUTER_MAX_OUTPUT_TOKENS_MAX = 16000;
const OPENROUTER_MAX_OUTPUT_TOKENS_HEADROOM = 1.65;

function buildSystemPrompt(request: TranslationBatchRequest): string {
  const sourceLanguage =
    request.sourceLanguage && request.sourceLanguage !== 'auto'
      ? request.sourceLanguage
      : 'the detected source language';
  const hasHints = Boolean(request.sectionContext || request.glossary?.length);
  const hasFragmentRoles = Boolean(
    request.fragmentRoles?.length && request.fragmentRoles.length === request.fragments.length,
  );
  const hasPrecedingContexts = Boolean(
    request.precedingContexts?.some((context) => typeof context === 'string' && context.length > 0),
  );
  const hasFragmentIds = Boolean(
    request.fragmentIds?.length && request.fragmentIds.length === request.fragments.length,
  );
  const usesFragmentObjects = hasFragmentIds || hasFragmentRoles || hasPrecedingContexts;
  const hintShape = hasHints
    ? 'Input is JSON object {"s","g","f"}.'
    : usesFragmentObjects
      ? 'Input is JSON array of fragment objects.'
      : 'Input is JSON array.';
  const hintInstruction = hasHints
    ? [
        request.sectionContext ? 'Use s as context for the section topic.' : null,
        request.glossary?.length
          ? 'Follow g (glossary) entries for consistent terminology unless the context clearly demands otherwise.'
          : null,
      ]
        .filter(Boolean)
        .join(' ') || null
    : null;
  const fragmentObjectInstruction = usesFragmentObjects
    ? 'Each fragment: t=source text, i=id, r=role, p=preceding context (reference only — do not re-translate p content).'
    : null;
  const markerInstruction = request.hasProtectedMarkers
    ? 'Keep marker tokens like [[t0]], [[/t0]], and [[x0]] exactly unchanged. Every marker from the source fragment must appear exactly once in the translation, in the same order.'
    : null;
  const roleInstruction = hasFragmentRoles
    ? [
        'If r=heading, translate it as a concise section heading.',
        'If r=label, translate it as a structural label, not as a full sentence. Do not add Japanese sentence punctuation to labels.',
        'If r=list-item, translate it as a list entry, preserving the item structure.',
        'If r=caption, translate it as a short descriptive caption.',
      ].join(' ')
    : null;
  if (request.contentMode === 'html') {
    return [
      `Translate ${sourceLanguage} -> ${request.targetLanguage}.`,
      hintShape,
      fragmentObjectInstruction,
      'Each fragment is HTML.',
      'Keep tags, URLs, emphasis, and inline math intact.',
      buildStyleInstruction(request),
      hintInstruction,
      markerInstruction,
      roleInstruction,
      hasFragmentIds
        ? 'Return JSON: {"translations":[{"i":"0","t":"<html>"},{"i":"1","t":"<html>"}]}.'
        : 'Return JSON: {"translations":["<html>","<html>"]}.',
      'Translate every fragment completely. Never leave a source-language sentence or clause untranslated. Never mix source and target languages in the same sentence.',
      hasFragmentIds ? 'Same ids, same count. No prose.' : 'Same count. No prose.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `Translate ${sourceLanguage} -> ${request.targetLanguage}.`,
    hintShape,
    fragmentObjectInstruction,
    'Each fragment is plain text.',
    buildStyleInstruction(request),
    hintInstruction,
    markerInstruction,
    roleInstruction,
    'Translate every fragment completely. Never leave a source-language sentence or clause untranslated. Never mix source and target languages in the same sentence.',
    hasFragmentIds
      ? 'Return JSON: {"translations":[{"i":"0","t":"..."},{"i":"1","t":"..."}]}.'
      : 'Return JSON: {"translations":["...","..."]}.',
    hasFragmentIds ? 'Same ids, same count. No prose.' : 'Same count. Plain text only. No prose.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildStyleInstruction(request: TranslationBatchRequest): string {
  const registerInstruction = request.pageRegister
    ? `Japanese register: ${request.pageRegister}. Do not mix dearu and desu-masu styles.`
    : null;

  const styleInstruction = (() => {
    switch (request.style) {
    case 'readable':
      return 'Style: natural and easy to read.';
    case 'precise':
      return 'Style: precise and technically accurate.';
    case 'source-like':
      return 'Style: stay close to the source wording and structure.';
    case 'auto':
    default:
      return 'Style: fluent expository prose that reads naturally on the page.';
    }
  })();

  return [styleInstruction, registerInstruction].filter(Boolean).join(' ');
}

function parseTranslations(content: string, request: TranslationBatchRequest): string[] {
  const candidates = buildJsonCandidates(content);
  let parsedSummary: string | undefined;

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as
        | { translations?: string[] | Array<{ i?: string; id?: string; t?: string; text?: string }> }
        | string[];
      try {
        return normalizeTranslationsPayload(parsed, request.fragmentIds);
      } catch {
        parsedSummary ??= summarizeParsedPayload(parsed);
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    `Provider returned an invalid translations payload. details=${JSON.stringify({
      candidateCount: candidates.length,
      parsedSummary,
      excerpt: summarizePayloadExcerpt(content),
    })}`,
  );
}

function normalizeTranslationsPayload(
  parsed:
    | { translations?: string[] | Array<{ i?: string; id?: string; t?: string; text?: string }> }
    | string[],
  fragmentIds?: string[],
): string[] {
  const rootTranslations = normalizeTranslationArray(parsed, fragmentIds);
  if (rootTranslations) {
    return rootTranslations;
  }

  if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
    for (const key of ['translations', 'results', 'items', 'data']) {
      const candidate = normalizeTranslationArray(
        (parsed as Record<string, unknown>)[key],
        fragmentIds,
      );
      if (candidate) {
        return candidate;
      }
    }
  }

  throw new Error('Provider returned an invalid translations payload.');
}

function normalizeTranslationArray(
  candidate: unknown,
  fragmentIds?: string[],
): string[] | null {
  if (!Array.isArray(candidate)) {
    return null;
  }

  if (candidate.length === 0) {
    return [];
  }

  if (candidate.every((item) => typeof item === 'string')) {
    return candidate as string[];
  }

  if (
    !candidate.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))
  ) {
    return null;
  }

  const objects = candidate as Array<Record<string, unknown>>;
  const texts = objects.map(extractTranslationText);
  if (!texts.every((item): item is string => typeof item === 'string')) {
    return null;
  }

  if (!fragmentIds?.length) {
    return texts;
  }

  const ids = objects.map(extractTranslationId);
  if (ids.every((item): item is string => typeof item === 'string')) {
    const byId = new Map(ids.map((id, index) => [id, texts[index]]));
    const ordered = fragmentIds
      .map((id) => byId.get(id))
      .filter((value): value is string => typeof value === 'string');
    if (ordered.length === fragmentIds.length) {
      return ordered;
    }
  }

  if (texts.length === fragmentIds.length) {
    return texts;
  }

  return null;
}

function extractTranslationId(item: Record<string, unknown>): string | undefined {
  const candidate = item.i ?? item.id ?? item.index;
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate;
  }
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return String(candidate);
  }
  return undefined;
}

function extractTranslationText(item: Record<string, unknown>): string | undefined {
  for (const key of ['t', 'text', 'translation', 'content', 'html', 'value', 'output']) {
    const candidate = item[key];
    if (typeof candidate === 'string') {
      return candidate;
    }
  }
  return undefined;
}

function buildJsonCandidates(content: string): string[] {
  const trimmed = content.trim();
  const candidates = new Set<string>();

  if (trimmed) {
    candidates.add(trimmed);
  }

  const unfenced = unwrapMarkdownFence(trimmed);
  if (unfenced) {
    candidates.add(unfenced);
  }

  for (const source of [trimmed, unfenced]) {
    for (const candidate of extractBalancedJsonCandidates(source)) {
      candidates.add(candidate);
    }
  }

  return Array.from(candidates);
}

function summarizeParsedPayload(
  parsed:
    | { translations?: string[] | Array<{ i?: string; id?: string; t?: string; text?: string }> }
    | string[],
): string {
  if (Array.isArray(parsed)) {
    return `array(len=${parsed.length},itemType=${typeof parsed[0]})`;
  }

  const keys = Object.keys(parsed).slice(0, 4).join(',');
  const translations = parsed.translations;
  if (Array.isArray(translations)) {
    const first = translations[0];
    if (typeof first === 'string') {
      return `object(keys=${keys},translations=len:${translations.length},itemType=string)`;
    }

    if (first && typeof first === 'object') {
      return `object(keys=${keys},translations=len:${translations.length},itemKeys=${Object.keys(first).slice(0, 4).join(',')})`;
    }

    return `object(keys=${keys},translations=len:${translations.length},itemType=${typeof first})`;
  }

  return `object(keys=${keys})`;
}

function summarizePayloadExcerpt(content: string): string {
  return content.replace(/\s+/g, ' ').trim().slice(0, 180);
}

function unwrapMarkdownFence(content: string): string {
  const match = content.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match?.[1]?.trim() || content;
}

function extractBalancedJsonCandidates(content: string): string[] {
  const candidates: string[] = [];

  for (let index = 0; index < content.length; index += 1) {
    const startChar = content[index];
    if (startChar !== '{' && startChar !== '[') {
      continue;
    }

    const candidate = extractBalancedJsonFrom(content, index);
    if (candidate) {
      candidates.push(candidate);
    }
  }

  return candidates;
}

function extractBalancedJsonFrom(content: string, startIndex: number): string | null {
  const stack: string[] = [];
  let inString = false;
  let isEscaped = false;

  for (let index = startIndex; index < content.length; index += 1) {
    const char = content[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      stack.push('}');
      continue;
    }

    if (char === '[') {
      stack.push(']');
      continue;
    }

    if (char === '}' || char === ']') {
      const expected = stack.pop();
      if (expected !== char) {
        return null;
      }

      if (stack.length === 0) {
        return content.slice(startIndex, index + 1).trim();
      }
    }
  }

  return null;
}

function buildUserPayload(request: TranslationBatchRequest): string {
  const hasFragmentIds = request.fragmentIds?.length === request.fragments.length;
  const hasFragmentRoles = request.fragmentRoles?.length === request.fragments.length;
  const hasPrecedingContexts = request.precedingContexts?.length === request.fragments.length;
  const usesFragmentObjects = Boolean(hasFragmentIds || hasFragmentRoles || hasPrecedingContexts);
  const fragments = usesFragmentObjects
    ? request.fragments.map((text, index) => {
        const fragment: Record<string, string> = { t: text };
        const fragmentId = hasFragmentIds ? request.fragmentIds?.[index] : undefined;
        const fragmentRole = hasFragmentRoles ? request.fragmentRoles?.[index] : undefined;
        const precedingContext = hasPrecedingContexts ? request.precedingContexts?.[index] : undefined;
        if (fragmentId) {
          fragment.i = fragmentId;
        }
        if (fragmentRole) {
          fragment.r = fragmentRole;
        }
        if (precedingContext) {
          fragment.p = precedingContext;
        }
        return fragment;
      })
    : request.fragments;

  if (!request.sectionContext && !request.glossary?.length) {
    return JSON.stringify(fragments);
  }

  return JSON.stringify({
    s: request.sectionContext,
    g: request.glossary,
    f: fragments,
  });
}

export async function translateWithOpenRouter(
  request: TranslationBatchRequest,
  options: { signal?: AbortSignal } = {},
): Promise<TranslationBatchResult> {
  const normalizedRequest: TranslationBatchRequest = {
    ...request,
    apiKey: request.apiKey.trim(),
    model: request.model.trim(),
    targetLanguage: request.targetLanguage.trim(),
    sourceLanguage: request.sourceLanguage.trim(),
  };
  const abortController = new AbortController();
  const handleExternalAbort = () => {
    abortController.abort();
  };
  options.signal?.addEventListener('abort', handleExternalAbort, { once: true });
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, OPENROUTER_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${normalizedRequest.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
      body: JSON.stringify({
        model: normalizedRequest.model,
        max_tokens: buildMaxOutputTokens(normalizedRequest),
        response_format: { type: 'json_object' },
        temperature: normalizedRequest.temperature ?? 0.2,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(normalizedRequest),
          },
          {
            role: 'user',
            content: buildUserPayload(normalizedRequest),
          },
        ],
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      if (options.signal?.aborted) {
        throw new Error('Cancelled. Start a new run when ready.');
      }
      throw new Error('OpenRouter request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', handleExternalAbort);
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(errorBody?.error?.message || 'OpenRouter request failed.');
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string | null }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
  const choice = payload.choices?.[0];
  const content = choice?.message?.content;
  const finishReason = normalizeFinishReason(choice?.finish_reason);
  if (!content) {
    throw new Error('OpenRouter returned an empty response.');
  }

  let translations: string[];
  try {
    translations = parseTranslations(content, normalizedRequest);
  } catch (error) {
    if (finishReason === 'length') {
      throw new Error('Provider response reached output limit.');
    }
    throw error;
  }

  return {
    translations,
    usage:
      typeof payload.usage?.prompt_tokens === 'number' &&
      typeof payload.usage?.completion_tokens === 'number'
        ? {
            promptTokens: payload.usage.prompt_tokens,
            completionTokens: payload.usage.completion_tokens,
            totalTokens:
              payload.usage.total_tokens ??
              payload.usage.prompt_tokens + payload.usage.completion_tokens,
          }
        : undefined,
    finishReason,
  };
}

function buildMaxOutputTokens(request: TranslationBatchRequest): number {
  if (request.maxOutputTokens) {
    return request.maxOutputTokens;
  }

  const estimatedCompletionTokens = estimateCompletionTokensForBatch({
    contentMode: request.contentMode,
    preparedChars: request.fragments.reduce((sum, fragment) => sum + fragment.length, 0),
    fragmentCount: request.fragments.length,
  });

  return clamp(
    Math.ceil(estimatedCompletionTokens * OPENROUTER_MAX_OUTPUT_TOKENS_HEADROOM),
    OPENROUTER_MAX_OUTPUT_TOKENS_MIN,
    OPENROUTER_MAX_OUTPUT_TOKENS_MAX,
  );
}

function normalizeFinishReason(finishReason: string | null | undefined): string | undefined {
  const normalized = finishReason?.trim().toLowerCase();
  return normalized || undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export async function getOpenRouterModels(): Promise<ProviderModelInfo[]> {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) {
    throw new Error('Failed to fetch OpenRouter models.');
  }

  const payload = (await response.json()) as OpenRouterModelsResponse;
  return (payload.data ?? [])
    .map((model) => ({
      id: model.id,
      name: model.name || model.id,
      pricing:
        model.pricing?.prompt && model.pricing?.completion
          ? {
              prompt: model.pricing.prompt,
              completion: model.pricing.completion,
            }
          : undefined,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function validateOpenRouterApiKey(apiKey: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      return { valid: true };
    }

    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'API Key が無効です。OpenRouter で確認してください。' };
    }

    return { valid: false, error: `OpenRouter が ${response.status} を返しました。しばらくしてからお試しください。` };
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return { valid: false, error: '接続がタイムアウトしました。' };
    }
    return { valid: false, error: 'ネットワークエラーが発生しました。' };
  }
}

export async function warmOpenRouterConnection(): Promise<void> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, OPENROUTER_WARMUP_TIMEOUT_MS);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error('Failed to warm OpenRouter connection.');
    }

    await response.text();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenRouter warmup timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
