"use client";

import { useEffect, useState } from 'react';
import { getClientSocket } from '@/lib/realtime-client';

export function ReconnectBanner() {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const socket = getClientSocket();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  if (connected) return null;

  return (
    <div className="mb-2 rounded-md border border-yellow-400 bg-yellow-50 p-2 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
      Connection lost. Trying to reconnect…
    </div>
  );
}
