export type EventSummary = {
  positive_percentage: number; // 0-100
  top_highlights: string[];
  areas_for_improvement: string[];
};

export interface SummaryService {
  computeSummaryForEvent(eventId: string): Promise<EventSummary>;
}


