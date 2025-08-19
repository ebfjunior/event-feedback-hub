import { describe, it, expect, vi } from 'vitest';
import { listFeedbacks } from '@/usecases/listFeedbacks';
import type { FeedbackRepository, ListFeedbacksParams, ListFeedbacksResult } from '@/types/FeedbackRepository';

function makeRepo(overrides?: Partial<FeedbackRepository>): FeedbackRepository {
  return {
    async list(params: ListFeedbacksParams): Promise<ListFeedbacksResult> {
      return { items: [], nextCursor: null };
    },
    async create(_data: { eventId: string; rating: number; text: string }) {
      throw new Error('not used');
    },
    ...overrides,
  };
}

describe('usecases/listFeedbacks', () => {
  it('delegates to repository.list and returns result', async () => {
    const params: ListFeedbacksParams = {
      eventId: 'evt_1',
      rating: 4,
      sort: 'newest',
      limit: 10,
      cursor: 'abc',
    };

    const expected: ListFeedbacksResult = {
      items: [
        {
          id: 'fb_1',
          eventId: 'evt_1',
          eventName: 'Event',
          rating: 4,
          text: 'nice',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        },
      ],
      nextCursor: 'next123',
    };

    const list = vi.fn().mockResolvedValue(expected);
    const repo = makeRepo({ list });

    const result = await listFeedbacks(repo, params);

    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith(params);
    expect(result).toEqual(expected);
  });

  it('propagates repository errors', async () => {
    const repo = makeRepo({ list: vi.fn().mockRejectedValue(new Error('boom')) });

    await expect(
      listFeedbacks(repo, { sort: 'highest', limit: 5 }),
    ).rejects.toThrow('boom');
  });
});


