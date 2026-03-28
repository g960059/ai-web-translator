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
const OPENROUTER_MAX_OUTPUT_TOKENS_MIN = 192;
const OPENROUTER_MAX_OUTPUT_TOKENS_MAX = 7000;
const OPENROUTER_MAX_OUTPUT_TOKENS_HEADROOM = 1.45;

function buildSystemPrompt(request: TranslationBatchRequest): string {
  const sourceLanguage =
    request.sourceLanguage && request.sourceLanguage !== 'auto'
      ? request.sourceLanguage
      : 'the detected source language';
  const hasHints = Boolean(request.sectionContext || request.glossary?.length);
  const hasFragmentIds = Boolean(
    request.fragmentIds?.length && request.fragmentIds.length === request.fragments.length,
  );
  const hintShape = hasHints ? 'Input is JSON object {"s","g","f"}.' : 'Input is JSON array.';
  const hintInstruction = hasHints
    ? 'Use s/g only as soft context.'
    : null;
  const markerInstruction = request.hasProtectedMarkers
    ? 'Keep tokens like [[AIWEBTX_0_OPEN]] and [[AIWEBTX_0_CLOSE]] exactly unchanged.'
    : null;
  if (request.contentMode === 'html') {
    return [
      `Translate ${sourceLanguage} -> ${request.targetLanguage}.`,
      hintShape,
      'Each fragment is HTML.',
      'Keep tags, URLs, emphasis, and inline math intact.',
      buildStyleInstruction(request.style),
      hintInstruction,
      markerInstruction,
      hasFragmentIds
        ? 'Return JSON: {"translations":[{"i":"f0","t":"<html>"},{"i":"f1","t":"<html>"}]}.'
        : 'Return JSON: {"translations":["<html>","<html>"]}.',
      hasFragmentIds ? 'Same ids, same count. No prose.' : 'Same count. No prose.',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    `Translate ${sourceLanguage} -> ${request.targetLanguage}.`,
    hintShape,
    'Each fragment is plain text.',
    buildStyleInstruction(request.style),
    hintInstruction,
    markerInstruction,
    hasFragmentIds
      ? 'Return JSON: {"translations":[{"i":"f0","t":"..."},{"i":"f1","t":"..."}]}.'
      : 'Return JSON: {"translations":["...","..."]}.',
    hasFragmentIds ? 'Same ids, same count. No prose.' : 'Same count. Plain text only. No prose.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildStyleInstruction(style: TranslationBatchRequest['style']): string {
  switch (style) {
    case 'readable':
      return 'Style: natural and easy to read.';
    case 'precise':
      return 'Style: precise and technically accurate.';
    case 'source-like':
      return 'Style: stay close to the source wording and structure.';
    case 'auto':
    default:
      return 'Style: choose one fluent page-consistent reading style.';
  }
}

function parseTranslations(content: string, request: TranslationBatchRequest): string[] {
  const candidates = buildJsonCandidates(content);

  for (const candidate of candidates) {
    try {
      return normalizeTranslationsPayload(
        JSON.parse(candidate) as
          | { translations?: string[] | Array<{ i?: string; id?: string; t?: string; text?: string }> }
          | string[],
        request.fragmentIds,
      );
    } catch {
      continue;
    }
  }

  throw new Error('Provider returned an invalid translations payload.');
}

function normalizeTranslationsPayload(
  parsed:
    | { translations?: string[] | Array<{ i?: string; id?: string; t?: string; text?: string }> }
    | string[],
  fragmentIds?: string[],
): string[] {
  if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
    return parsed;
  }

  if (
    !Array.isArray(parsed) &&
    typeof parsed === 'object' &&
    parsed !== null &&
    Array.isArray(parsed.translations) &&
    parsed.translations.every((item) => typeof item === 'string')
  ) {
    return parsed.translations as string[];
  }

  if (
    !Array.isArray(parsed) &&
    typeof parsed === 'object' &&
    parsed !== null &&
    Array.isArray(parsed.translations) &&
    parsed.translations.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof ((item as { i?: string; id?: string }).i ?? (item as { id?: string }).id) ===
          'string' &&
        typeof ((item as { t?: string; text?: string }).t ?? (item as { text?: string }).text) ===
          'string',
    )
  ) {
    const translations = parsed.translations as Array<{
      i?: string;
      id?: string;
      t?: string;
      text?: string;
    }>;

    if (!fragmentIds?.length) {
      return translations.map((item) => item.t ?? item.text ?? '');
    }

    const byId = new Map(
      translations.map((item) => [item.i ?? item.id ?? '', item.t ?? item.text ?? '']),
    );
    return fragmentIds
      .map((id) => byId.get(id))
      .filter((value): value is string => typeof value === 'string');
  }

  throw new Error('Provider returned an invalid translations payload.');
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
  const fragments =
    request.fragmentIds?.length === request.fragments.length
      ? request.fragments.map((text, index) => ({
          i: request.fragmentIds?.[index] ?? `f${index}`,
          t: text,
        }))
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
        Authorization: `Bearer ${request.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
      body: JSON.stringify({
        model: request.model,
        max_tokens: buildMaxOutputTokens(request),
        response_format: { type: 'json_object' },
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(request),
          },
          {
            role: 'user',
            content: buildUserPayload(request),
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
    translations = parseTranslations(content, request);
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
  const estimatedCompletionTokens =
    request.maxOutputTokens ??
    estimateCompletionTokensForBatch({
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
