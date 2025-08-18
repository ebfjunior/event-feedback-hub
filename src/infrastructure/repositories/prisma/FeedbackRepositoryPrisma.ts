import { PrismaClient } from '@prisma/client';
import type {
  FeedbackRepository,
  ListFeedbacksParams,
  ListFeedbacksResult,
  FeedbackListItem,
} from '@/application/ports/FeedbackRepository';
import { decodeCursor, encodeCursor, type CursorPayload } from '@/lib/cursor';
import {
  orderByForHighest,
  orderByForNewest,
  whereForFilters,
  whereForHighestKeyset,
  whereForNewestKeyset,
} from '@/lib/queries/feedbacks';

export class FeedbackRepositoryPrisma implements FeedbackRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(params: ListFeedbacksParams): Promise<ListFeedbacksResult> {
    const { eventId, rating, sort, limit } = params;
    const whereBase = whereForFilters({ eventId, rating });

    let where = whereBase;
    const orderBy = sort === 'newest' ? orderByForNewest() : orderByForHighest();

    let keyFromCursor: CursorPayload['k'] | undefined;
    if (params.cursor) {
      const decoded = decodeCursor(params.cursor);
      if (decoded.sort !== sort) {
        // If sort changed, ignore cursor
        keyFromCursor = undefined;
      } else {
        keyFromCursor = decoded.k;
      }
    }

    if (sort === 'newest') {
      const key = Array.isArray(keyFromCursor)
        ? { createdAtIso: String(keyFromCursor[0]), id: String(keyFromCursor[1]) }
        : undefined;
      where = whereForNewestKeyset(whereBase, key);
    } else {
      const key = Array.isArray(keyFromCursor)
        ? {
            rating: Number(keyFromCursor[0]),
            createdAtIso: String(keyFromCursor[1]),
            id: String(keyFromCursor[2]),
          }
        : undefined;
      where = whereForHighestKeyset(whereBase, key);
    }

    const rows = await this.prisma.feedback.findMany({
      where,
      orderBy,
      take: limit + 1,
      include: { event: true },
    });

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(
      (r): FeedbackListItem => ({
        id: r.id,
        eventId: r.eventId,
        eventName: r.event.name,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
      }),
    );

    let nextCursor: string | null = null;
    if (hasMore) {
      const last = rows[limit - 1];
      if (sort === 'newest') {
        nextCursor = encodeCursor({
          v: 1,
          sort: 'newest',
          k: [last.createdAt.toISOString(), last.id],
        });
      } else {
        nextCursor = encodeCursor({
          v: 1,
          sort: 'highest',
          k: [last.rating, last.createdAt.toISOString(), last.id],
        });
      }
    }

    return { items, nextCursor };
  }

  async create(data: { eventId: string; rating: number; text: string }): Promise<FeedbackListItem> {
    const created = await this.prisma.feedback.create({
      data,
      include: { event: true },
    });
    return {
      id: created.id,
      eventId: created.eventId,
      eventName: created.event.name,
      rating: created.rating,
      text: created.text,
      createdAt: created.createdAt,
    };
  }
}
