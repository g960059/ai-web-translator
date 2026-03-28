type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function logWithContext(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): void {
  const logger = console[level] ?? console.log;
  if (!context || Object.keys(context).length === 0) {
    logger(message);
    return;
  }

  logger(`${message} ${formatLogContext(context)}`);
}

export function formatLogContext(context: Record<string, unknown>): string {
  try {
    return JSON.stringify(serializeLogValue(context));
  } catch {
    return String(context);
  }
}

function serializeLogValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeLogValue(entry, seen));
  }

  if (value && typeof value === 'object') {
    if (seen.has(value as object)) {
      return '[Circular]';
    }

    seen.add(value as object);
    const entries = Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      serializeLogValue(entry, seen),
    ]);
    return Object.fromEntries(entries);
  }

  return value;
}
