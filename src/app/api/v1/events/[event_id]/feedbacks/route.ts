import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/prisma';
import { FeedbackRepositoryPrisma } from '@/repositories/prisma/FeedbackRepositoryPrisma';
import { EventRepositoryPrisma } from '@/repositories/prisma/EventRepositoryPrisma';
import { ListFeedbacksQuerySchema } from '@/lib/validation';
import { notFound, ok, serverError, unprocessable } from '@/lib/responses';
import { listFeedbacks } from '@/usecases/listFeedbacks';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: { event_id: string } },
) {
  try {
    const { event_id } = context.params;
    // Ensure event exists to return 404 early
    const eventRepo = new EventRepositoryPrisma(prisma);
    const exists = await eventRepo.getNameById(event_id);
    if (!exists) {
      return NextResponse.json(notFound('Event not found'), { status: 404 });
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = ListFeedbacksQuerySchema.safeParse({
      event_id, // override from path
      rating: params.rating,
      sort: params.sort,
      limit: params.limit,
      cursor: params.cursor,
    });
    if (!parsed.success) {
      return NextResponse.json(unprocessable('Invalid query parameters', parsed.error.format()), { status: 422 });
    }

    const { rating, sort, limit, cursor } = parsed.data;
    const repo = new FeedbackRepositoryPrisma(prisma);
    const result = await listFeedbacks(repo, {
      eventId: event_id,
      rating,
      sort,
      limit,
      cursor,
    });
    const data = result.items.map((f) => ({
      id: f.id,
      event_id: f.eventId,
      event_name: f.eventName,
      rating: f.rating,
      text: f.text,
      created_at: f.createdAt.toISOString(),
    }));
    return NextResponse.json(ok(data, result.nextCursor));
  } catch (error) {
    return NextResponse.json(serverError('Failed to list event feedbacks'), { status: 500 });
  }
}


