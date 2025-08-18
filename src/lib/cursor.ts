// Cursor utilities for opaque keyset pagination.
// Encodes/decodes a versioned object using base64url(JSON).

export type SortOption = 'newest' | 'highest';

export type NewestKeyTuple = [createdAtIso: string, id: string];
export type HighestKeyTuple = [rating: number, createdAtIso: string, id: string];

export type CursorPayload =
  | { v: 1; sort: 'newest'; k: NewestKeyTuple }
  | { v: 1; sort: 'highest'; k: HighestKeyTuple };

function toBase64Url(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(input: string): string {
  const padded = input + '==='.slice((input.length + 3) % 4);
  const b64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf8');
}

export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify(payload);
  return toBase64Url(json);
}

export function decodeCursor(encoded: string): CursorPayload {
  const json = fromBase64Url(encoded);
  const parsed = JSON.parse(json) as unknown;
  if (!isCursorPayload(parsed)) {
    throw new Error('Invalid cursor payload');
  }
  return parsed;
}

export function isCursorPayload(value: unknown): value is CursorPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = (value as { v?: unknown }).v;
  const sort = (value as { sort?: unknown }).sort;
  const k = (value as { k?: unknown }).k;
  if (v !== 1) return false;
  if (sort !== 'newest' && sort !== 'highest') return false;
  if (!Array.isArray(k)) return false;
  if (sort === 'newest') {
    return k.length === 2 && typeof k[0] === 'string' && typeof k[1] === 'string';
  }
  // highest
  return (
    k.length === 3 &&
    typeof k[0] === 'number' &&
    typeof k[1] === 'string' &&
    typeof k[2] === 'string'
  );
}

export function makeCursorFromKey(sort: 'newest', key: NewestKeyTuple): string;
export function makeCursorFromKey(sort: 'highest', key: HighestKeyTuple): string;
export function makeCursorFromKey(sort: SortOption, key: NewestKeyTuple | HighestKeyTuple): string {
  if (sort === 'newest') {
    const k = key as NewestKeyTuple;
    return encodeCursor({ v: 1, sort: 'newest', k });
  }
  const k = key as HighestKeyTuple;
  return encodeCursor({ v: 1, sort: 'highest', k });
}
