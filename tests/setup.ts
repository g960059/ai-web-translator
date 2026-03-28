import '@testing-library/jest-dom/vitest';

import { beforeEach, vi } from 'vitest';
import { resetEstimateCalibrationCache } from '../src/shared/estimate-calibration';

type Listener = (...args: unknown[]) => void;

const runtimeListeners = new Set<Listener>();
const storageState = new Map<string, unknown>();
const intersectionObservers = new Set<MockIntersectionObserver>();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];
  private readonly observed = new Set<Element>();

  constructor(
    private readonly callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {
    intersectionObservers.add(this);
  }

  observe(target: Element): void {
    this.observed.add(target);
  }

  unobserve(target: Element): void {
    this.observed.delete(target);
  }

  disconnect(): void {
    this.observed.clear();
    intersectionObservers.delete(this);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  emit(target: Element, isIntersecting: boolean): void {
    if (!this.observed.has(target)) {
      return;
    }

    this.callback(
      [
        {
          time: Date.now(),
          target,
          rootBounds: null,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          intersectionRatio: isIntersecting ? 1 : 0,
          isIntersecting,
        } as IntersectionObserverEntry,
      ],
      this,
    );
  }
}

function createLocalStorageArea() {
  return {
    get: vi.fn(async (keys?: string | string[] | Record<string, unknown> | null) => {
      if (keys == null) {
        return Object.fromEntries(storageState.entries());
      }

      if (typeof keys === 'string') {
        return { [keys]: storageState.get(keys) };
      }

      if (Array.isArray(keys)) {
        return keys.reduce<Record<string, unknown>>((result, key) => {
          result[key] = storageState.get(key);
          return result;
        }, {});
      }

      return Object.entries(keys).reduce<Record<string, unknown>>((result, [key, fallback]) => {
        result[key] = storageState.has(key) ? storageState.get(key) : fallback;
        return result;
      }, {});
    }),
    set: vi.fn(async (items: Record<string, unknown>) => {
      Object.entries(items).forEach(([key, value]) => storageState.set(key, value));
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      const normalized = Array.isArray(keys) ? keys : [keys];
      normalized.forEach((key) => storageState.delete(key));
    }),
    clear: vi.fn(async () => {
      storageState.clear();
    }),
    getBytesInUse: vi.fn(async () => 0),
    onChanged: {} as never,
  };
}

const runtime = {
  sendMessage: vi.fn(async () => ({ ok: true })),
  onMessage: {
    addListener: vi.fn((listener: Listener) => {
      runtimeListeners.add(listener);
    }),
    removeListener: vi.fn((listener: Listener) => {
      runtimeListeners.delete(listener);
    }),
    hasListener: vi.fn(),
    hasListeners: vi.fn(),
  },
};

const tabs = {
  query: vi.fn(async () => [{ id: 1 }]),
  sendMessage: vi.fn(async () => ({ ok: true })),
  onActivated: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
    hasListeners: vi.fn(),
  },
  onRemoved: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
    hasListeners: vi.fn(),
  },
  onUpdated: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
    hasListeners: vi.fn(),
  },
};

const contextMenus = {
  create: vi.fn((_properties, callback?: () => void) => callback?.()),
  update: vi.fn((_id, _properties, callback?: () => void) => callback?.()),
  removeAll: vi.fn((callback?: () => void) => callback?.()),
  onClicked: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(),
    hasListeners: vi.fn(),
  },
};

const chromeMock = {
  runtime,
  tabs,
  storage: {
    local: createLocalStorageArea(),
  },
  contextMenus,
  i18n: {
    getUILanguage: vi.fn(() => 'ja'),
  },
};

Object.defineProperty(globalThis, 'chrome', {
  value: chromeMock as unknown as typeof chrome,
  configurable: true,
});

Object.defineProperty(globalThis, 'crypto', {
  value: globalThis.crypto,
  configurable: true,
});

Object.defineProperty(globalThis, 'IntersectionObserver', {
  value: MockIntersectionObserver,
  configurable: true,
});

beforeEach(() => {
  resetEstimateCalibrationCache();
  storageState.clear();
  intersectionObservers.forEach((observer) => observer.disconnect());
  intersectionObservers.clear();
  runtime.sendMessage.mockReset();
  runtime.sendMessage.mockResolvedValue({ ok: true });
  tabs.query.mockReset();
  tabs.query.mockResolvedValue([{ id: 1 }]);
  tabs.sendMessage.mockReset();
  tabs.sendMessage.mockResolvedValue({ ok: true });
  chromeMock.storage.local.get.mockClear();
  chromeMock.storage.local.set.mockClear();
  chromeMock.storage.local.remove.mockClear();
  chromeMock.storage.local.clear.mockClear();
  contextMenus.create.mockClear();
  contextMenus.update.mockClear();
  contextMenus.removeAll.mockClear();
  document.body.innerHTML = '';
});

export function emitRuntimeMessage(message: unknown): void {
  runtimeListeners.forEach((listener) => listener(message, {}, vi.fn()));
}

export function emitIntersection(target: Element, isIntersecting = true): void {
  intersectionObservers.forEach((observer) => observer.emit(target, isIntersecting));
}

export function getChromeMock() {
  return chromeMock;
}
