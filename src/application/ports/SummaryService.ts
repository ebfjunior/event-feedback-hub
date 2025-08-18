export interface SummaryService {
  computeSummaryForEvent(eventId: string): Promise<string>;
}
