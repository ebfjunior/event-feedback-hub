/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { EventListItem, FeedbackItem, SortOption } from '@/types/api';
import { fetchFeedbacks } from '@/lib/api';
import { EventSelect } from '@/components/controls/EventSelect';
import { RatingSelect } from '@/components/controls/RatingSelect';
import { SortToggle } from '@/components/controls/SortToggle';
import { FeedbackCard } from '@/components/FeedbackCard';
import { FeedbackCardSkeleton } from '@/components/FeedbackCard.Skeleton';
import { InfiniteList } from '@/components/InfiniteList';
import { NewItemsBanner } from '@/components/NewItemsBanner';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
 

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

  const POLL_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_POLL_INTERVAL_MS || 5000);

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
    let cancelled = false;
    async function pollOnce() {
      try {
        const res = await fetchFeedbacks({ event_id: eventId, rating, sort, limit: 20 });
        if (cancelled) return;
        setItems((previousItems) => {
          const existingIds = new Set(previousItems.map((i) => i.id));
          const newItems = res.data.filter((i) => !existingIds.has(i.id));
          if (newItems.length === 0) return previousItems;

          if (!isAtTop) {
            setQueued((q) => {
              const seen = new Set(q.map((i) => i.id));
              const toQueue = newItems.filter((i) => !seen.has(i.id));
              return [...toQueue, ...q];
            });
            return previousItems;
          }

          if (sort === 'newest') {
            return [...newItems, ...previousItems];
          }

          // highest: insert by (rating desc, created_at desc, id desc)
          const next = [...previousItems];
          for (const payload of newItems) {
            const idx = next.findIndex(
              (x) =>
                x.rating < payload.rating ||
                (x.rating === payload.rating && x.created_at < payload.created_at) ||
                (x.rating === payload.rating && x.created_at === payload.created_at && x.id < payload.id),
            );
            if (idx === -1) next.push(payload);
            else next.splice(idx, 0, payload);
          }
          return next;
        });
      } catch {
        // ignore polling errors; visible errors come from explicit loads
      }
    }

    // immediate poll once, then interval
    void pollOnce();
    const id = window.setInterval(pollOnce, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [eventId, rating, sort, isAtTop, POLL_INTERVAL_MS]);

  const applyQueued = useCallback(() => {
    if (queued.length === 0) return;
    setItems((prev) => [...queued, ...prev]);
    setQueued([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [queued]);

  return (
    <div className="space-y-4">
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
