import { describe, it, expect, vi } from 'vitest';
import type { Server as IOServer } from 'socket.io';
import { SocketRealtimePublisher } from './socketPublisher';

function createFakeIO() {
  const toMock = vi.fn().mockReturnThis();
  const emitMock = vi.fn();
  const io = {
    to: toMock,
    emit: emitMock,
  } as unknown as IOServer;

  return { io, toMock, emitMock };
}

describe('SocketRealtimePublisher', () => {
  it('emits feedback.created to global room', async () => {
    const { io, toMock } = createFakeIO();
    const publisher = new SocketRealtimePublisher(io);
    await publisher.publishFeedbackCreatedGlobal({
      id: 'id',
      eventId: 'e',
      eventName: 'Event',
      rating: 5,
      text: 'hello',
      createdAtIso: new Date().toISOString(),
    });
    expect(toMock).toHaveBeenCalledWith('feedbacks');
  });

  it('emits feedback.created to event room', async () => {
    const { io, toMock } = createFakeIO();
    const publisher = new SocketRealtimePublisher(io);
    await publisher.publishFeedbackCreatedForEvent('123e4567-e89b-12d3-a456-426614174000', {
      id: 'id',
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      eventName: 'Event',
      rating: 5,
      text: 'hello',
      createdAtIso: new Date().toISOString(),
    });
    expect(toMock).toHaveBeenCalledWith('event:123e4567-e89b-12d3-a456-426614174000');
  });
});


