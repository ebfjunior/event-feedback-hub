export type EventListItem = {
  id: string;
  name: string;
};

export type FeedbackItem = {
  id: string;
  event_id: string;
  event_name: string;
  rating: number;
  text: string;
  created_at: string; // ISO string
};

export type SuccessEnvelope<T> = {
  data: T;
  next_cursor?: string | null;
};

export type SortOption = 'newest' | 'highest';

export type ListFeedbacksRequest = {
  event_id?: string;
  rating?: number;
  sort?: SortOption;
  limit?: number;
  cursor?: string | null;
};

// Next API route Socket.IO augmentation
import type { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: {
      io?: unknown;
    };
  };
};
