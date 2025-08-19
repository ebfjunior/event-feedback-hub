import type { SortOption, EventListItem } from '@/types/api';
import { EventSelect } from '@/components/molecules/controls/EventSelect';
import { RatingSelect } from '@/components/molecules/controls/RatingSelect';
import { SortToggle } from '@/components/molecules/controls/SortToggle';

export type FilterBarProps = {
  events: EventListItem[];
  fixedEventId?: string;
  eventId?: string;
  rating?: number;
  sort: SortOption;
  onEventChange?: (eventId: string | undefined) => void;
  onRatingChange?: (rating: number | undefined) => void;
  onSortChange: (sort: SortOption) => void;
};

export function FilterBar({ events, fixedEventId, eventId, rating, sort, onEventChange, onRatingChange, onSortChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!fixedEventId && <EventSelect events={events} value={eventId} onChange={onEventChange} />}
      <RatingSelect value={rating} onChange={onRatingChange} />
      <SortToggle value={sort} onChange={onSortChange} />
    </div>
  );
}


