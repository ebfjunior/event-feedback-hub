import { Server as IOServer } from 'socket.io';
import { isValidRoom } from '@/lib/realtime';

declare global {
  // eslint-disable-next-line no-var
  var __io__: IOServer | undefined;
}

export function getServerIO(): IOServer | undefined {
  return global.__io__;
}

export function setServerIO(io: IOServer): void {
  global.__io__ = io;
}

function getAllowedOrigins(): string[] | string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
  try {
    const url = new URL(appUrl);
    const base = `${url.protocol}//${url.host}`;
    return [base];
  } catch {
    // Fallback: allow all origins (dev). Consider setting NEXT_PUBLIC_APP_URL in production.
    return '*';
  }
}

function getSocketPath(): string {
  return '/api/socket';
}

function getSocketPort(): number {
  const fromEnv = process.env.SOCKET_IO_PORT || process.env.NEXT_PUBLIC_SOCKET_PORT;
  const parsed = fromEnv ? Number(fromEnv) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3101;
}

export function ensureSocketIOServerStarted(): IOServer {
  if (global.__io__) return global.__io__;

  const io = new IOServer(getSocketPort(), {
    path: getSocketPath(),
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', (room: string) => {
      if (!isValidRoom(room)) {
        socket.emit('error', { message: 'Invalid room' });
        return;
      }
      socket.join(room);
    });
    socket.on('leave', (room: string) => {
      if (!isValidRoom(room)) return;
      socket.leave(room);
    });
  });

  setServerIO(io);
  return io;
}


