export type FeedbackCreatedPayload = {
  id: string;
  eventId: string;
  eventName: string;
  rating: number;
  text: string;
  createdAtIso: string;
};

export interface RealtimePublisher {
  publishFeedbackCreatedGlobal(payload: FeedbackCreatedPayload): Promise<void>;
  publishFeedbackCreatedForEvent(eventId: string, payload: FeedbackCreatedPayload): Promise<void>;
}
