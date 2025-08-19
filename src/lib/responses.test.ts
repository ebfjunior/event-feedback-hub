import { describe, it, expect } from 'vitest';
import { ok, badRequest, notFound, unprocessable, serverError } from '@/lib/responses';

describe('lib/responses', () => {
  it('ok wraps data and null next_cursor by default', () => {
    expect(ok({ a: 1 })).toEqual({ data: { a: 1 }, next_cursor: null });
  });

  it('ok can include next_cursor', () => {
    expect(ok([1, 2, 3], 'abc')).toEqual({ data: [1, 2, 3], next_cursor: 'abc' });
  });

  it('error envelopes set codes and messages', () => {
    expect(badRequest('bad')).toEqual({ error: { code: 400, message: 'bad' } });
    expect(notFound('nope')).toEqual({ error: { code: 404, message: 'nope' } });
    expect(unprocessable('invalid', { field: 'x' })).toEqual({ error: { code: 422, message: 'invalid', details: { field: 'x' } } });
    expect(serverError('oops')).toEqual({ error: { code: 500, message: 'oops' } });
  });
});


