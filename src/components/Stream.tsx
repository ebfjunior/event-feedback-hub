/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EventListItem, FeedbackItem, SortOption } from '@/types/api';
import { fetchFeedbacks } from '@/lib/api';
import { EventSelect } from '@/components/controls/EventSelect';
import { RatingSelect } from '@/components/controls/RatingSelect';
import { SortToggle } from '@/components/controls/SortToggle';
import { FeedbackCard } from '@/components/FeedbackCard';
import { FeedbackCardSkeleton } from '@/components/FeedbackCard.Skeleton';
import { InfiniteList } from '@/components/InfiniteList';
import { ReconnectBanner } from '@/components/ReconnectBanner';
import { NewItemsBanner } from '@/components/NewItemsBanner';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { getClientSocket } from '@/lib/realtime-client';
import { roomForAllFeedbacks, roomForEvent } from '@/lib/realtime';

export type StreamProps = {
  events: EventListItem[];
  fixedEventId?: string;
};

export function Stream({ events, fixedEventId }: StreamProps) {
  const [eventId, setEventId] = useState<string | undefined>(fixedEventId);
  const [rating, setRating] = useState<number | undefined>();
  const [sort, setSort] = useState<SortOption>('newest');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const initializedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState<FeedbackItem[]>([]);
  const [isAtTop, setIsAtTop] = useState(true);

  const room = useMemo(() => (eventId ? roomForEvent(eventId) : roomForAllFeedbacks()), [eventId]);

  const load = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchFeedbacks({ event_id: eventId, rating, sort, cursor: cursor ?? undefined, limit: 20 });
      setItems((previousItems) => {
        const existingIds = new Set(previousItems.map((item) => item.id));
        const itemsToAppend = res.data.filter((item) => !existingIds.has(item.id));
        return [...previousItems, ...itemsToAppend];
      });
      setCursor(res.next_cursor ?? null);
      setHasMore(Boolean(res.next_cursor));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, rating, sort, cursor, isLoading, hasMore]);

  useEffect(() => {
    // track scroll near top
    const onScroll = () => {
      setIsAtTop(window.scrollY < 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // reset list on filter/sort change
    if (initializedRef.current) {
      setItems([]);
      setCursor(null);
      setHasMore(true);
    }
    initializedRef.current = true;
    // immediate fetch
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchFeedbacks({ event_id: eventId, rating, sort, limit: 20 });
        // Ensure no duplicates in the initial set
        const seen = new Set<string>();
        const unique = res.data.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setItems(unique);
        setCursor(res.next_cursor ?? null);
        setHasMore(Boolean(res.next_cursor));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [eventId, rating, sort]);

  useEffect(() => {
    const socket = getClientSocket();
    function onCreated(payload: FeedbackItem) {
      // if user scrolled up, queue until they click banner
      if (!isAtTop) {
        setQueued((q) => (q.some((x) => x.id === payload.id) ? q : [payload, ...q]));
        return;
      }
      // filter match
      if (eventId && payload.event_id !== eventId) return;
      if (typeof rating === 'number' && payload.rating !== rating) return;
      if (sort === 'newest') {
        setItems((previousItems) => {
          if (previousItems.some((item) => item.id === payload.id)) return previousItems;
          return [payload, ...previousItems];
        });
      } else {
        // insert keeping ordering by rating desc then created_at desc then id desc
        setItems((previousItems) => {
          if (previousItems.some((item) => item.id === payload.id)) return previousItems;
          const next = [...previousItems];
          const idx = next.findIndex(
            (x) =>
              x.rating < payload.rating ||
              (x.rating === payload.rating && x.created_at < payload.created_at) ||
              (x.rating === payload.rating && x.created_at === payload.created_at && x.id < payload.id),
          );
          if (idx === -1) next.push(payload);
          else next.splice(idx, 0, payload);
          return next;
        });
      }
    }

    socket.on('feedback.created', onCreated);
    socket.emit('join', room as any);
    return () => {
      socket.emit('leave', room as any);
      socket.off('feedback.created', onCreated);
    };
  }, [room, eventId, rating, sort, isAtTop]);

  const applyQueued = useCallback(() => {
    if (queued.length === 0) return;
    setItems((prev) => [...queued, ...prev]);
    setQueued([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [queued]);

  return (
    <div className="space-y-4">
      <ReconnectBanner />
      <div className="flex flex-wrap items-center gap-2">
        {!fixedEventId && <EventSelect events={events} value={eventId} onChange={setEventId} />}
        <RatingSelect value={rating} onChange={setRating} />
        <SortToggle value={sort} onChange={setSort} />
      </div>

      {queued.length > 0 && <NewItemsBanner count={queued.length} onApply={applyQueued} />}

      {error && <ErrorState message={error} onRetry={() => void load()} />}

      {isLoading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <FeedbackCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState message="No feedback yet." />)
      : (
        <InfiniteList
          items={items.map((f) => (
            <FeedbackCard key={f.id} feedback={f} />
          ))}
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={load}
        />
      )}
    </div>
  );
}
