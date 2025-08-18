export type SortOption = 'newest' | 'highest';

export interface FeedbackListItem {
  id: string;
  eventId: string;
  eventName: string;
  rating: number;
  text: string;
  createdAt: Date;
}

export type ListFeedbacksParams = {
  eventId?: string;
  rating?: number;
  sort: SortOption;
  limit: number;
  cursor?: string;
};

export type ListFeedbacksResult = {
  items: FeedbackListItem[];
  nextCursor: string | null;
};

export interface FeedbackRepository {
  list(params: ListFeedbacksParams): Promise<ListFeedbacksResult>;
  create(data: { eventId: string; rating: number; text: string }): Promise<FeedbackListItem>;
}
