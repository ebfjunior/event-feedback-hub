import type { FeedbackRepository } from '@/types/FeedbackRepository';

export async function createFeedback(
  repo: FeedbackRepository,
  data: { eventId: string; eventName: string; rating: number; text: string },
)
{
  const created = await repo.create({
    eventId: data.eventId,
    rating: data.rating,
    text: data.text,
  });

  return created;
}


