const EXACT_ERROR_MESSAGES: Record<string, string> = {
  'Translation failed.': '翻訳に失敗しました。',
  'Cancelled. Start a new run when ready.': '停止しました。',
  'Provider returned an invalid translations payload.': 'AI の返答をうまく読み取れませんでした。',
  'Provider returned the wrong number of translated fragments.':
    'AI の返答の数が想定と違いました。',
  'OpenRouter returned an empty response.': 'AI から空の返答が返ってきました。',
  'OpenRouter request failed.': 'AI サービス側でエラーが起きました。',
  'OpenRouter request timed out.': 'AI の応答が時間切れになりました。',
  'Provider response reached output limit.': 'AI の返答が長すぎました。',
};

export function localizeRuntimeError(message: string | null | undefined): string {
  const normalized = message?.trim() ?? '';
  if (!normalized) {
    return '翻訳に失敗しました。';
  }

  if (EXACT_ERROR_MESSAGES[normalized]) {
    return EXACT_ERROR_MESSAGES[normalized];
  }

  const lower = normalized.toLowerCase();

  if (
    lower.includes('api') ||
    lower.includes('key') ||
    lower.includes('401') ||
    lower.includes('403')
  ) {
    return 'API key を確認してください。';
  }

  if (lower.includes('429') || lower.includes('rate')) {
    return '混み合っています。少し待ってから再試行します。';
  }

  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('abort')) {
    return 'AI の応答が時間切れになりました。';
  }

  if (lower.includes('503') || lower.includes('502')) {
    return 'AI サービスが一時的に不安定です。';
  }

  if (
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('failed to fetch')
  ) {
    return '通信が不安定です。';
  }

  if (
    lower.includes('invalid translations payload') ||
    lower.includes('json') ||
    lower.includes('parse')
  ) {
    return 'AI の返答をうまく読み取れませんでした。';
  }

  if (lower.includes('empty response')) {
    return 'AI から空の返答が返ってきました。';
  }

  if (lower.includes('output limit') || lower.includes('too long')) {
    return 'AI の返答が長すぎました。';
  }

  return '翻訳に失敗しました。';
}

export function isRetryableRuntimeError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('429') ||
    lower.includes('408') ||
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('abort') ||
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('503') ||
    lower.includes('502')
  );
}
