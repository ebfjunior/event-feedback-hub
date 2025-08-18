import type { Server as IOServer } from 'socket.io';
import type {
  RealtimePublisher,
  FeedbackCreatedPayload,
} from '@/application/ports/RealtimePublisher';
import { emitSafely, roomForAllFeedbacks, roomForEvent } from '@/lib/realtime';

export class SocketRealtimePublisher implements RealtimePublisher {
  constructor(private readonly io: IOServer | null | undefined) {}

  async publishFeedbackCreatedGlobal(payload: FeedbackCreatedPayload): Promise<void> {
    emitSafely(this.io, roomForAllFeedbacks(), {
      type: 'feedback.created',
      payload: {
        id: payload.id,
        event_id: payload.eventId,
        event_name: payload.eventName,
        rating: payload.rating,
        text: payload.text,
        created_at: payload.createdAtIso,
      },
    });
  }

  async publishFeedbackCreatedForEvent(
    eventId: string,
    payload: FeedbackCreatedPayload,
  ): Promise<void> {
    emitSafely(this.io, roomForEvent(eventId), {
      type: 'feedback.created',
      payload: {
        id: payload.id,
        event_id: payload.eventId,
        event_name: payload.eventName,
        rating: payload.rating,
        text: payload.text,
        created_at: payload.createdAtIso,
      },
    });
  }
}
