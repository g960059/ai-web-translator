export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

export const languageOptions: LanguageOption[] = [
  { code: 'ja', label: '日本語', nativeLabel: '日本語' },
  { code: 'en', label: '英語', nativeLabel: 'English' },
  { code: 'es', label: 'スペイン語', nativeLabel: 'Español' },
  { code: 'fr', label: 'フランス語', nativeLabel: 'Français' },
  { code: 'de', label: 'ドイツ語', nativeLabel: 'Deutsch' },
  { code: 'it', label: 'イタリア語', nativeLabel: 'Italiano' },
  { code: 'pt-BR', label: 'ポルトガル語', nativeLabel: 'Português (Brasil)' },
  { code: 'ko', label: '韓国語', nativeLabel: '한국어' },
  { code: 'zh-CN', label: '中国語（簡体）', nativeLabel: '简体中文' },
  { code: 'zh-TW', label: '中国語（繁体）', nativeLabel: '繁體中文' },
  { code: 'vi', label: 'ベトナム語', nativeLabel: 'Tiếng Việt' },
  { code: 'id', label: 'インドネシア語', nativeLabel: 'Bahasa Indonesia' },
];

export const featuredLanguageOptions = languageOptions.slice(0, 8);

export const languageSuggestions = languageOptions.map((language) => language.code);

export function findLanguageOption(code: string): LanguageOption | undefined {
  const normalized = code.trim().toLowerCase();

  // Exact match
  const exact = languageOptions.find((language) => language.code.toLowerCase() === normalized);
  if (exact) {
    return exact;
  }

  // Special-case Chinese locale variants
  const zhMap: Record<string, string> = { 'zh-hans': 'zh-cn', 'zh-hant': 'zh-tw' };
  if (zhMap[normalized]) {
    const zhMatch = languageOptions.find(
      (language) => language.code.toLowerCase() === zhMap[normalized],
    );
    if (zhMatch) {
      return zhMatch;
    }
  }

  // Fallback: match on primary language tag (e.g. 'en-US' → 'en')
  const primary = normalized.split('-')[0];
  if (primary && primary !== normalized) {
    return languageOptions.find((language) => language.code.toLowerCase() === primary);
  }

  return undefined;
}

export function formatLanguageLabel(code: string): string {
  const option = findLanguageOption(code);
  if (option) {
    return option.label;
  }

  const normalized = code.trim();
  if (!normalized) {
    return '未設定';
  }

  return normalized;
}
