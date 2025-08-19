import { describe, it, expect } from 'vitest';
import {
  encodeCursor,
  decodeCursor,
  isCursorPayload,
  makeCursorFromKey,
} from '@/lib/cursor';

describe('lib/cursor', () => {
  it('roundtrips encode/decode for newest', () => {
    const payload = { v: 1 as const, sort: 'newest' as const, k: ['2024-01-01T00:00:00.000Z', 'id_1'] as const };
    const encoded = encodeCursor(payload);
    const decoded = decodeCursor(encoded);
    expect(decoded).toEqual(payload);
  });

  it('roundtrips encode/decode for highest', () => {
    const payload = {
      v: 1 as const,
      sort: 'highest' as const,
      k: [5, '2024-01-01T00:00:00.000Z', 'id_1'] as const,
    };
    const encoded = encodeCursor(payload);
    const decoded = decodeCursor(encoded);
    expect(decoded).toEqual(payload);
  });

  it('rejects invalid payload on decode', () => {
    const notACursor = Buffer.from(JSON.stringify({ foo: 'bar' }), 'utf8')
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    expect(() => decodeCursor(notACursor)).toThrow('Invalid cursor payload');
  });

  it('isCursorPayload validates shape', () => {
    expect(isCursorPayload({ v: 1, sort: 'newest', k: ['iso', 'id'] })).toBe(true);
    expect(isCursorPayload({ v: 1, sort: 'highest', k: [3, 'iso', 'id'] })).toBe(true);
    expect(isCursorPayload({ v: 2, sort: 'newest', k: ['iso', 'id'] })).toBe(false);
    expect(isCursorPayload({ v: 1, sort: 'unknown', k: [] })).toBe(false);
    expect(isCursorPayload(null)).toBe(false);
  });

  it('makeCursorFromKey produces decodable cursor', () => {
    const c1 = makeCursorFromKey('newest', ['2024-01-01T00:00:00.000Z', 'id_2']);
    expect(decodeCursor(c1)).toEqual({ v: 1, sort: 'newest', k: ['2024-01-01T00:00:00.000Z', 'id_2'] });

    const c2 = makeCursorFromKey('highest', [4, '2024-01-02T00:00:00.000Z', 'id_3']);
    expect(decodeCursor(c2)).toEqual({ v: 1, sort: 'highest', k: [4, '2024-01-02T00:00:00.000Z', 'id_3'] });
  });
});


