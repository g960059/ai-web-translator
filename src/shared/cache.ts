import { hashString } from './hash';
import type { ExtensionSettings, TranslationContentMode } from './types';

const CACHE_PREFIX = 'translation-cache:v2:';
const CACHE_INDEX_KEY = `${CACHE_PREFIX}index`;
const CACHE_SOFT_LIMIT_BYTES = 8 * 1024 * 1024;
const CACHE_TARGET_BYTES = 7 * 1024 * 1024;
let cacheTouchCounter = 0;

interface CacheIndexEntry {
  size: number;
  touchedAt: number;
}

type CacheIndex = Record<string, CacheIndexEntry>;

export interface TranslationCacheLookup {
  provider: ExtensionSettings['provider'];
  model: string;
  sourceLanguage: string;
  targetLanguage: string;
  style: ExtensionSettings['style'];
  contentMode: TranslationContentMode;
  normalizedSource: string;
}

export function serializeTranslationCacheLookup(lookup: TranslationCacheLookup): string {
  return JSON.stringify(lookup);
}

export async function buildTranslationCacheKey(lookup: TranslationCacheLookup): Promise<string> {
  return `${CACHE_PREFIX}${await hashString(serializeTranslationCacheLookup(lookup))}`;
}

export async function getCachedTranslation(lookup: TranslationCacheLookup): Promise<string | null> {
  const key = await buildTranslationCacheKey(lookup);
  const result = await chrome.storage.local.get(key);
  const cached = (result[key] as string | undefined) ?? null;
  if (cached) {
    await touchCacheEntries([key]);
  }
  return cached;
}

export async function getCachedTranslations(
  lookups: TranslationCacheLookup[],
): Promise<Map<string, string>> {
  if (lookups.length === 0) {
    return new Map();
  }

  const keyedLookups = await Promise.all(
    lookups.map(async (lookup) => ({
      cacheKey: await buildTranslationCacheKey(lookup),
      lookupKey: serializeTranslationCacheLookup(lookup),
    })),
  );

  const result = await chrome.storage.local.get(keyedLookups.map((item) => item.cacheKey));
  const translations = new Map<string, string>();

  keyedLookups.forEach(({ cacheKey, lookupKey }) => {
    const value = result[cacheKey];
    if (typeof value === 'string') {
      translations.set(lookupKey, value);
    }
  });

  await touchCacheEntries(
    keyedLookups
      .filter(({ cacheKey }) => typeof result[cacheKey] === 'string')
      .map(({ cacheKey }) => cacheKey),
  );

  return translations;
}

export async function setCachedTranslation(
  lookup: TranslationCacheLookup,
  translation: string,
): Promise<void> {
  const key = await buildTranslationCacheKey(lookup);
  await setCachedItemsWithEviction({ [key]: translation });
}

export async function setCachedTranslations(
  entries: Array<{ lookup: TranslationCacheLookup; translation: string }>,
): Promise<void> {
  if (entries.length === 0) {
    return;
  }

  const items = await Promise.all(
    entries.map(async ({ lookup, translation }) => [await buildTranslationCacheKey(lookup), translation]),
  );
  await setCachedItemsWithEviction(Object.fromEntries(items));
}

export async function removeCachedTranslations(lookups: TranslationCacheLookup[]): Promise<void> {
  const keys = await Promise.all(lookups.map((lookup) => buildTranslationCacheKey(lookup)));
  if (keys.length > 0) {
    const cacheIndex = await loadCacheIndex();
    keys.forEach((key) => {
      delete cacheIndex[key];
    });
    await chrome.storage.local.remove(keys);
    await saveCacheIndex(cacheIndex);
  }
}

export async function clearAllTranslationCache(): Promise<void> {
  const allItems = await chrome.storage.local.get(null);
  const keys = Object.keys(allItems).filter((key) => key.startsWith(CACHE_PREFIX));
  if (keys.length > 0) {
    await chrome.storage.local.remove(keys);
  }
}

async function setCachedItemsWithEviction(items: Record<string, string>): Promise<void> {
  const cacheIndex = await loadCacheIndex();
  const now = nextTouchedAt();

  Object.entries(items).forEach(([cacheKey, translation]) => {
    cacheIndex[cacheKey] = {
      size: estimateCacheEntrySize(cacheKey, translation),
      touchedAt: now,
    };
  });

  const protectedKeys = new Set(Object.keys(items));
  const evictedKeys = evictCacheEntriesToBudget(cacheIndex, protectedKeys);
  if (evictedKeys.length > 0) {
    await chrome.storage.local.remove(evictedKeys);
  }

  await chrome.storage.local.set({
    ...items,
    [CACHE_INDEX_KEY]: cacheIndex,
  });
}

async function touchCacheEntries(cacheKeys: string[]): Promise<void> {
  if (cacheKeys.length === 0) {
    return;
  }

  const cacheIndex = await loadCacheIndex();
  const now = nextTouchedAt();
  let changed = false;

  cacheKeys.forEach((cacheKey) => {
    const entry = cacheIndex[cacheKey];
    if (!entry) {
      return;
    }

    entry.touchedAt = now;
    changed = true;
  });

  if (changed) {
    await saveCacheIndex(cacheIndex);
  }
}

async function loadCacheIndex(): Promise<CacheIndex> {
  const result = await chrome.storage.local.get(CACHE_INDEX_KEY);
  const cacheIndex = result[CACHE_INDEX_KEY];
  if (!cacheIndex || typeof cacheIndex !== 'object') {
    return {};
  }

  return cacheIndex as CacheIndex;
}

async function saveCacheIndex(cacheIndex: CacheIndex): Promise<void> {
  await chrome.storage.local.set({
    [CACHE_INDEX_KEY]: cacheIndex,
  });
}

function evictCacheEntriesToBudget(
  cacheIndex: CacheIndex,
  protectedKeys: Set<string>,
): string[] {
  const evictionQueue = Object.entries(cacheIndex)
    .filter(([cacheKey]) => !protectedKeys.has(cacheKey))
    .sort((left, right) => left[1].touchedAt - right[1].touchedAt);

  const evictedKeys: string[] = [];
  while (estimateCacheUsageBytes(cacheIndex) > CACHE_SOFT_LIMIT_BYTES && evictionQueue.length > 0) {
    const next = evictionQueue.shift();
    if (!next) {
      break;
    }

    delete cacheIndex[next[0]];
    evictedKeys.push(next[0]);
  }

  while (estimateCacheUsageBytes(cacheIndex) > CACHE_TARGET_BYTES && evictionQueue.length > 0) {
    const next = evictionQueue.shift();
    if (!next) {
      break;
    }

    delete cacheIndex[next[0]];
    evictedKeys.push(next[0]);
  }

  return evictedKeys;
}

function estimateCacheUsageBytes(cacheIndex: CacheIndex): number {
  const entryBytes = Object.values(cacheIndex).reduce((sum, entry) => sum + entry.size, 0);
  return entryBytes + estimateUtf8Bytes(JSON.stringify(cacheIndex)) + estimateUtf8Bytes(CACHE_INDEX_KEY);
}

function estimateCacheEntrySize(cacheKey: string, translation: string): number {
  return estimateUtf8Bytes(cacheKey) + estimateUtf8Bytes(translation);
}

function estimateUtf8Bytes(value: string): number {
  return new TextEncoder().encode(value).length;
}

function nextTouchedAt(): number {
  cacheTouchCounter += 1;
  return Date.now() * 1000 + cacheTouchCounter;
}
