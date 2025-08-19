'use client';

import { io, type Socket } from 'socket.io-client';
import type { Room } from './realtime';

type ConnectedSocket = Socket<never, never>;

let socketSingleton: ConnectedSocket | null = null;

function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (env) return env;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

export function getClientSocket(): ConnectedSocket {
  if (!socketSingleton) {
    socketSingleton = io(getBaseUrl(), { path: '/api/socket' });
  }
  return socketSingleton;
}

export function subscribeToRoom(room: Room): void {
  const socket = getClientSocket();
  socket.emit('join', room);
}

export function unsubscribeFromRoom(room: Room): void {
  const socket = getClientSocket();
  socket.emit('leave', room);
}


