import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Server as IOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { isValidRoom } from '@/lib/realtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

declare global {
  // eslint-disable-next-line no-var
  var __io__: IOServer | undefined;
}

function getAllowedOrigins(): string[] {
  const origin = process.env.NEXT_PUBLIC_SOCKET_URL || '';
  try {
    const url = new URL(origin);
    const base = `${url.protocol}//${url.host}`;
    return [base];
  } catch {
    // Fallback to same-origin
    return [];
  }
}

function getIO(server: HTTPServer): IOServer {
  if (!global.__io__) {
    global.__io__ = new IOServer(server, {
      path: '/api/socket',
      cors: {
        origin: getAllowedOrigins(),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    global.__io__.on('connection', (socket) => {
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
  }
  return global.__io__;
}

export async function GET(request: NextRequest) {
  // Next.js provides the underlying Node server on the request
  // @ts-expect-error - adapter provides a non-typed socket instance
  const server: HTTPServer | undefined = (request as any).socket?.server;
  if (!server) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  getIO(server);
  return new NextResponse(null, { status: 200 });
}


