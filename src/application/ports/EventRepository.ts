export interface EventListItem {
  id: string;
  name: string;
}

export interface EventRepository {
  listAll(): Promise<EventListItem[]>;
  getNameById(eventId: string): Promise<string | null>;
}
