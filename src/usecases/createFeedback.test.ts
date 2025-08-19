import { describe, it, expect, vi } from 'vitest';
import { createFeedback } from '@/usecases/createFeedback';
import type { FeedbackRepository, ListFeedbacksParams, ListFeedbacksResult } from '@/types/FeedbackRepository';

function makeRepo(overrides?: Partial<FeedbackRepository>): FeedbackRepository {
  return {
    async list(_params: ListFeedbacksParams): Promise<ListFeedbacksResult> {
      return { items: [], nextCursor: null };
    },
    async create(_data: { eventId: string; rating: number; text: string }) {
      return {
        id: 'fb_1',
        eventId: _data.eventId,
        eventName: 'Example Event',
        rating: _data.rating,
        text: _data.text,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      };
    },
    ...overrides,
  };
}

describe('usecases/createFeedback', () => {
  it('maps fields and calls repository.create without eventName', async () => {
    const create = vi.fn().mockResolvedValue({
      id: 'fb_1',
      eventId: 'evt_123',
      eventName: 'Ignored Name',
      rating: 5,
      text: 'Great event!',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    const repo = makeRepo({ create });

    const result = await createFeedback(repo, {
      eventId: 'evt_123',
      eventName: 'Some UI name',
      rating: 5,
      text: 'Great event!',
    });

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({ eventId: 'evt_123', rating: 5, text: 'Great event!' });
    expect(result).toEqual({
      id: 'fb_1',
      eventId: 'evt_123',
      eventName: 'Ignored Name',
      rating: 5,
      text: 'Great event!',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    });
  });

  it('propagates repository errors', async () => {
    const error = new Error('db down');
    const repo = makeRepo({ create: vi.fn().mockRejectedValue(error) });

    await expect(
      createFeedback(repo, {
        eventId: 'evt_123',
        eventName: 'Some UI name',
        rating: 3,
        text: 'ok',
      }),
    ).rejects.toThrow('db down');
  });
});


