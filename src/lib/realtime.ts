import type { Server as IOServer } from 'socket.io';

export type Room = 'feedbacks' | `event:${string}`;

export function roomForAllFeedbacks(): Room {
  return 'feedbacks';
}

export function roomForEvent(eventId: string): Room {
  return `event:${eventId}`;
}

export function isValidRoom(room: string): room is Room {
  if (room === 'feedbacks') return true;
  if (!room.startsWith('event:')) return false;
  const id = room.slice('event:'.length);
  // UUID v4-ish validation (accept any canonical UUID)
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
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

export type ClientEvents = {
  join: (room: Room) => void;
  leave: (room: Room) => void;
};

export function emitSafely(
  io: IOServer | null | undefined,
  room: Room,
  event: FeedbackCreatedEvent,
): void {
  if (!io) return;
  io.to(room).emit(event.type, event.payload);
}
