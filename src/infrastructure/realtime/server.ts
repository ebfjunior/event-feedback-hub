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
  const configured = process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
  const parseToOrigin = (value: string): string | null => {
    try {
      const url = new URL(value);
      return `${url.protocol}//${url.host}`;
    } catch {
      return null;
    }
  };

  const origins = configured
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map(parseToOrigin)
    .filter((x): x is string => Boolean(x));

  if (origins.length > 0) return origins;

  // In development, be permissive to reduce setup friction.
  if (process.env.NODE_ENV !== 'production') return '*';

  // In production, require explicit configuration to avoid permissive CORS.
  // Throwing here makes the misconfiguration visible early.
  throw new Error(
    'Socket.IO CORS misconfigured: set ALLOWED_ORIGINS (comma-separated URLs) or NEXT_PUBLIC_APP_URL in the environment.',
  );
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


