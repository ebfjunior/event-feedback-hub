/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type InfiniteListProps = {
  items: React.ReactNode[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
};

export function InfiniteList({ items, hasMore, isLoading, onLoadMore, className }: InfiniteListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) onLoadMore();
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore]);

  return (
    <div className={cn('space-y-3', className)}>
      {items}
      {isLoading && <div className="text-center text-sm text-muted-foreground">Loading…</div>}
      {!hasMore && !isLoading && (
        <div className="text-center text-sm text-muted-foreground">End of the list</div>
      )}
      <div ref={sentinelRef} />
    </div>
  );
}
