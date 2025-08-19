/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { EventListItem, FeedbackItem, SortOption } from '@/types/api';
import { fetchFeedbacks } from '@/lib/api';
import { FeedbackCard } from '@/components/molecules/FeedbackCard';
import { FeedbackCardSkeleton } from '@/components/molecules/FeedbackCard.Skeleton';
import { InfiniteList } from '@/components/molecules/InfiniteList';
import { NewItemsBanner } from '@/components/molecules/NewItemsBanner';
import { EmptyState } from '@/components/atoms/EmptyState';
import { ErrorBanner } from '@/components/molecules/ErrorBanner';
import { FilterBar } from '@/components/molecules/FilterBar';

export type FeedbackStreamProps = {
  events: EventListItem[];
  fixedEventId?: string;
};

export function FeedbackStream({ events, fixedEventId }: FeedbackStreamProps) {
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
    const onScroll = () => {
      setIsAtTop(window.scrollY < 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (initializedRef.current) {
      setItems([]);
      setCursor(null);
      setHasMore(true);
    }
    initializedRef.current = true;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchFeedbacks({ event_id: eventId, rating, sort, limit: 20 });
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
        // ignore polling errors
      }
    }

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
      <FilterBar
        events={events}
        fixedEventId={fixedEventId}
        eventId={eventId}
        rating={rating}
        sort={sort}
        onEventChange={setEventId}
        onRatingChange={setRating}
        onSortChange={setSort}
      />

      {queued.length > 0 && <NewItemsBanner count={queued.length} onApply={applyQueued} />}

      {error && <ErrorBanner message={error} onRetry={() => void load()} />}

      {isLoading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <FeedbackCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState message="No feedback yet." />
      ) : (
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


