import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/prisma';
import { FeedbackRepositoryPrisma } from '@/infrastructure/repositories/prisma/FeedbackRepositoryPrisma';
import { EventRepositoryPrisma } from '@/infrastructure/repositories/prisma/EventRepositoryPrisma';
import { ListFeedbacksQuerySchema, CreateFeedbackBodySchema } from '@/lib/validation';
import { badRequest, notFound, ok, serverError, unprocessable } from '@/lib/responses';
import { listFeedbacks } from '@/application/usecases/listFeedbacks';
import { createFeedback } from '@/application/usecases/createFeedback';
import { SocketRealtimePublisher } from '@/infrastructure/realtime/socketPublisher';
import { getServerIO } from '@/infrastructure/realtime/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = ListFeedbacksQuerySchema.safeParse({
      event_id: params.event_id,
      rating: params.rating,
      sort: params.sort,
      limit: params.limit,
      cursor: params.cursor,
    });
    if (!parsed.success) {
      return NextResponse.json(unprocessable('Invalid query parameters', parsed.error.format()), { status: 422 });
    }

    const { event_id, rating, sort, limit, cursor } = parsed.data;
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
    return NextResponse.json(serverError('Failed to list feedbacks'), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(badRequest('Invalid JSON body'), { status: 400 });
    }

    const parsed = CreateFeedbackBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(unprocessable('Invalid request body', parsed.error.format()), { status: 422 });
    }

    const { event_id, rating, text } = parsed.data;
    const eventRepo = new EventRepositoryPrisma(prisma);
    const eventName = await eventRepo.getNameById(event_id);
    if (!eventName) {
      return NextResponse.json(notFound('Event not found'), { status: 404 });
    }

    const feedbackRepo = new FeedbackRepositoryPrisma(prisma);
    const publisher = new SocketRealtimePublisher(getServerIO());
    const created = await createFeedback(feedbackRepo, publisher, {
      eventId: event_id,
      eventName,
      rating,
      text,
    });
    const data = {
      id: created.id,
      event_id: created.eventId,
      event_name: created.eventName,
      rating: created.rating,
      text: created.text,
      created_at: created.createdAt.toISOString(),
    };
    return NextResponse.json(ok(data));
  } catch (error) {
    return NextResponse.json(serverError('Failed to create feedback'), { status: 500 });
  }
}


