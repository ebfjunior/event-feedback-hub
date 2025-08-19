import type { EventListItem, FeedbackItem, SuccessEnvelope, ListFeedbacksRequest } from '@/types/api';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return (await res.json()) as T;
}

export async function fetchEvents(): Promise<EventListItem[]> {
  const url = new URL('/api/v1/events', typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  const json = await handle<SuccessEnvelope<EventListItem[]>>(res);
  return json.data;
}

export async function fetchFeedbacks(params: ListFeedbacksRequest): Promise<SuccessEnvelope<FeedbackItem[]>> {
  const url = new URL('/api/v1/feedbacks', typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin);
  if (params.event_id) url.searchParams.set('event_id', params.event_id);
  if (typeof params.rating === 'number') url.searchParams.set('rating', String(params.rating));
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (typeof params.limit === 'number') url.searchParams.set('limit', String(params.limit));
  if (params.cursor) url.searchParams.set('cursor', params.cursor);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  return handle<SuccessEnvelope<FeedbackItem[]>>(res);
}

export async function fetchEventFeedbacks(eventId: string, params: Omit<ListFeedbacksRequest, 'event_id'>): Promise<SuccessEnvelope<FeedbackItem[]>> {
  const url = new URL(`/api/v1/events/${eventId}/feedbacks`, typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin);
  if (typeof params.rating === 'number') url.searchParams.set('rating', String(params.rating));
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (typeof params.limit === 'number') url.searchParams.set('limit', String(params.limit));
  if (params.cursor) url.searchParams.set('cursor', params.cursor);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  return handle<SuccessEnvelope<FeedbackItem[]>>(res);
}

export async function createFeedback(body: { event_id: string; rating: number; text: string }): Promise<FeedbackItem> {
  const res = await fetch('/api/v1/feedbacks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await handle<SuccessEnvelope<FeedbackItem>>(res);
  return json.data;
}

export async function fetchEventSummary(eventId: string): Promise<{ event_id: string; summary: string }> {
  const url = new URL(`/api/v1/events/${eventId}/summary`, typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  const json = await handle<SuccessEnvelope<{ event_id: string; summary: string }>>(res);
  return json.data;
}
