import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { EventRepositoryPrisma } from '@/repositories/prisma/EventRepositoryPrisma';

vi.mock('@/usecases/listFeedbacks', () => ({
  listFeedbacks: vi.fn(),
}));

function jsonResponseBody(res: NextResponse) {
  return (res as unknown as Response).json();
}

describe('api/v1/events/[event_id]/feedbacks route', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  const validEventId = '123e4567-e89b-12d3-a456-426614174000';

  it('returns 404 when event not found', async () => {
    const { GET } = await import('./route');
    vi.spyOn(EventRepositoryPrisma.prototype, 'getNameById').mockResolvedValueOnce(null);
    const req = new Request(`http://localhost/api/v1/events/${validEventId}/feedbacks`);
    const res = (await GET(req, { params: { event_id: validEventId } })) as NextResponse;
    expect(res.status).toBe(404);
    const body = await jsonResponseBody(res);
    expect(body.error.code).toBe(404);
  });

  it('returns 422 on invalid query parameters', async () => {
    const { GET } = await import('./route');
    vi.spyOn(EventRepositoryPrisma.prototype, 'getNameById').mockResolvedValueOnce('My Event');
    const req = new Request(
      `http://localhost/api/v1/events/${validEventId}/feedbacks?rating=10`,
    );
    const res = (await GET(req, { params: { event_id: validEventId } })) as NextResponse;
    expect(res.status).toBe(422);
    const body = await jsonResponseBody(res);
    expect(body.error.code).toBe(422);
  });

  it('returns mapped data and next_cursor on success', async () => {
    const { GET } = await import('./route');
    const { listFeedbacks } = await import('@/usecases/listFeedbacks');
    vi.spyOn(EventRepositoryPrisma.prototype, 'getNameById').mockResolvedValueOnce('My Event');
    vi.mocked(listFeedbacks).mockResolvedValueOnce({
      items: [
        {
          id: 'f1',
          eventId: validEventId,
          eventName: 'My Event',
          rating: 5,
          text: 'Great',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        },
      ],
      nextCursor: null,
    });

    const req = new Request(
      `http://localhost/api/v1/events/${validEventId}/feedbacks?sort=highest&limit=1`,
    );
    const res = (await GET(req, { params: { event_id: validEventId } })) as NextResponse;
    expect(res.status).toBe(200);
    const body = await jsonResponseBody(res);
    expect(body.data).toHaveLength(1);
    expect(body.next_cursor).toBeNull();
    expect(body.data[0]).toMatchObject({
      id: 'f1',
      event_id: validEventId,
      event_name: 'My Event',
      rating: 5,
      text: 'Great',
      created_at: '2024-01-01T00:00:00.000Z',
    });
  });
});


