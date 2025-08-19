import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextResponse } from 'next/server';
import { EventRepositoryPrisma } from '@/infrastructure/repositories/prisma/EventRepositoryPrisma';

vi.mock('@/application/usecases/listFeedbacks', () => ({
  listFeedbacks: vi.fn(),
}));

vi.mock('@/application/usecases/createFeedback', () => ({
  createFeedback: vi.fn(),
}));

// realtime server removed; no-op mocks

function jsonResponseBody(res: NextResponse) {
  // NextResponse extends Response
  return (res as unknown as Response).json();
}

describe('api/v1/feedbacks route', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns 422 on invalid query params', async () => {
    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/v1/feedbacks?rating=6');
    const res = (await GET(req)) as NextResponse;
    expect(res.status).toBe(422);
    const body = await jsonResponseBody(res);
    expect(body.error.code).toBe(422);
  });

  it('GET returns mapped items and next_cursor on success', async () => {
    const { listFeedbacks } = await import('@/application/usecases/listFeedbacks');
    vi.mocked(listFeedbacks).mockResolvedValueOnce({
      items: [
        {
          id: 'f1',
          eventId: 'e1',
          eventName: 'Event 1',
          rating: 5,
          text: 'Great',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        },
        {
          id: 'f2',
          eventId: 'e2',
          eventName: 'Event 2',
          rating: 3,
          text: 'Ok',
          createdAt: new Date('2024-01-02T00:00:00.000Z'),
        },
      ],
      nextCursor: 'next123',
    });

    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/v1/feedbacks?sort=newest&limit=2');
    const res = (await GET(req)) as NextResponse;
    expect(res.status).toBe(200);
    const body = await jsonResponseBody(res);
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toMatchObject({
      id: 'f1',
      event_id: 'e1',
      event_name: 'Event 1',
      rating: 5,
      text: 'Great',
    });
    expect(body.data[0].created_at).toBe('2024-01-01T00:00:00.000Z');
    expect(body.next_cursor).toBe('next123');
  });

  it('POST returns 400 on invalid JSON body', async () => {
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/v1/feedbacks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalid-json',
    });
    const res = (await POST(req)) as NextResponse;
    expect(res.status).toBe(400);
    const body = await jsonResponseBody(res);
    expect(body.error.code).toBe(400);
  });

  it('POST returns 422 on invalid body content', async () => {
    const { POST } = await import('./route');
    const payload = { event_id: '123e4567-e89b-12d3-a456-426614174000', rating: 0, text: '' };
    const req = new Request('http://localhost/api/v1/feedbacks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res = (await POST(req)) as NextResponse;
    expect(res.status).toBe(422);
    const body = await jsonResponseBody(res);
    expect(body.error.code).toBe(422);
  });

  it('POST returns 404 when event is not found', async () => {
    const { POST } = await import('./route');
    const spy = vi
      .spyOn(EventRepositoryPrisma.prototype, 'getNameById')
      .mockResolvedValueOnce(null);

    const payload = { event_id: '123e4567-e89b-12d3-a456-426614174000', rating: 5, text: 'Hi' };
    const req = new Request('http://localhost/api/v1/feedbacks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res = (await POST(req)) as NextResponse;
    expect(spy).toHaveBeenCalled();
    expect(res.status).toBe(404);
    const body = await jsonResponseBody(res);
    expect(body.error.code).toBe(404);
  });

  it('POST creates feedback and returns mapped data', async () => {
    const { POST } = await import('./route');
    const { createFeedback } = await import('@/application/usecases/createFeedback');
    vi.spyOn(EventRepositoryPrisma.prototype, 'getNameById').mockResolvedValueOnce('My Event');
    vi.mocked(createFeedback).mockResolvedValueOnce({
      id: 'f1',
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      eventName: 'My Event',
      rating: 4,
      text: 'Nice',
      createdAt: new Date('2024-01-03T00:00:00.000Z'),
    });

    const payload = {
      event_id: '123e4567-e89b-12d3-a456-426614174000',
      rating: 4,
      text: 'Nice',
    };
    const req = new Request('http://localhost/api/v1/feedbacks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res = (await POST(req)) as NextResponse;
    expect(res.status).toBe(200);
    const body = await jsonResponseBody(res);
    expect(body.data).toMatchObject({
      id: 'f1',
      event_id: '123e4567-e89b-12d3-a456-426614174000',
      event_name: 'My Event',
      rating: 4,
      text: 'Nice',
      created_at: '2024-01-03T00:00:00.000Z',
    });
  });
});


