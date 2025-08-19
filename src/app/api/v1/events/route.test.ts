import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { EventRepositoryPrisma } from '@/infrastructure/repositories/prisma/EventRepositoryPrisma';

function jsonResponseBody(res: NextResponse) {
  return (res as unknown as Response).json();
}

describe('api/v1/events route', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('returns list of events on success', async () => {
    const { GET } = await import('./route');
    vi.spyOn(EventRepositoryPrisma.prototype, 'listAll').mockResolvedValueOnce([
      { id: 'e1', name: 'A' },
      { id: 'e2', name: 'B' },
    ]);
    const req = new Request('http://localhost/api/v1/events');
    const res = (await GET()) as NextResponse;
    expect(res.status).toBe(200);
    const body = await jsonResponseBody(res);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data[0]).toMatchObject({ id: 'e1', name: 'A' });
  });

  it('returns 500 on server error', async () => {
    const { GET } = await import('./route');
    vi.spyOn(EventRepositoryPrisma.prototype, 'listAll').mockRejectedValueOnce(
      new Error('boom'),
    );
    const res = (await GET()) as NextResponse;
    expect(res.status).toBe(500);
    const body = await jsonResponseBody(res);
    expect(body.error.code).toBe(500);
  });
});


