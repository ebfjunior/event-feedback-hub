import type { Server as IOServer } from 'socket.io';

export type Room = 'feedbacks' | `event:${string}`;

export function roomForAllFeedbacks(): Room {
  return 'feedbacks';
}

export function roomForEvent(eventId: string): Room {
  return `event:${eventId}`;
}

export type FeedbackCreatedEvent = {
  type: 'feedback.created';
  payload: {
    id: string;
    event_id: string;
    event_name: string;
    rating: number;
    text: string;
    created_at: string;
  };
};

export function emitSafely(
  io: IOServer | null | undefined,
  room: Room,
  event: FeedbackCreatedEvent,
): void {
  if (!io) return;
  io.to(room).emit(event.type, event.payload);
}
