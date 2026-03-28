import { describe, expect, it } from 'vitest';
import { formatLogContext } from '../src/shared/debug-log';

describe('debug-log', () => {
  it('serializes Error objects into readable JSON', () => {
    const formatted = formatLogContext({
      phase: 'background',
      error: new Error('Boom'),
    });

    expect(formatted).toContain('"phase":"background"');
    expect(formatted).toContain('"name":"Error"');
    expect(formatted).toContain('"message":"Boom"');
  });

  it('handles nested objects without collapsing to [object Object]', () => {
    const formatted = formatLogContext({
      splitSizes: [4, 4],
      details: {
        reason: 'Provider returned the wrong number of translated fragments.',
      },
    });

    expect(formatted).toContain('"splitSizes":[4,4]');
    expect(formatted).toContain('"reason":"Provider returned the wrong number of translated fragments."');
    expect(formatted).not.toContain('[object Object]');
  });
});
