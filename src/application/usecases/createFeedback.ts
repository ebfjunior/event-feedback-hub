import type { FeedbackRepository } from '../ports/FeedbackRepository';
import type { RealtimePublisher } from '../ports/RealtimePublisher';

export async function createFeedback(
  repo: FeedbackRepository,
  publisher: RealtimePublisher,
  data: { eventId: string; eventName: string; rating: number; text: string },
) {
  const created = await repo.create({
    eventId: data.eventId,
    rating: data.rating,
    text: data.text,
  });

  await publisher.publishFeedbackCreatedGlobal({
    id: created.id,
    eventId: created.eventId,
    eventName: created.eventName,
    rating: created.rating,
    text: created.text,
    createdAtIso: created.createdAt.toISOString(),
  });
  await publisher.publishFeedbackCreatedForEvent(data.eventId, {
    id: created.id,
    eventId: created.eventId,
    eventName: created.eventName,
    rating: created.rating,
    text: created.text,
    createdAtIso: created.createdAt.toISOString(),
  });

  return created;
}
