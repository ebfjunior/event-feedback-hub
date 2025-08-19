import type { Server as IOServer } from 'socket.io';

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


