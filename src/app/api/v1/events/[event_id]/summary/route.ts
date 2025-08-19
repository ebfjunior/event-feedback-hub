import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/prisma';
import { EventRepositoryPrisma } from '@/infrastructure/repositories/prisma/EventRepositoryPrisma';
import { ok, notFound, serverError, badRequest } from '@/lib/responses';
import { OpenAISummaryService } from '@/infrastructure/ai/openaiSummaryService';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ event_id: string }> },
) {
  try {
    if (process.env.FEATURE_SUMMARIES !== 'true') {
      return NextResponse.json(notFound('Summaries feature is disabled'), { status: 404 });
    }

    const { event_id } = await context.params;
    if (!event_id) {
      return NextResponse.json(badRequest('Missing event_id'), { status: 400 });
    }

    const eventRepo = new EventRepositoryPrisma(prisma);
    const exists = await eventRepo.getNameById(event_id);
    if (!exists) {
      return NextResponse.json(notFound('Event not found'), { status: 404 });
    }

    const summaryService = new OpenAISummaryService(prisma);
    const summary = await summaryService.computeSummaryForEvent(event_id);
    return NextResponse.json(ok({ event_id, summary }));
  } catch (error) {
    return NextResponse.json(serverError('Failed to generate summary'), { status: 500 });
  }
}


