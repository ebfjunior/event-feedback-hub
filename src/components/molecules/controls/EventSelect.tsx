import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EventListItem } from '@/types/api';

export type EventSelectProps = {
  events: EventListItem[];
  value?: string;
  onChange?: (eventId: string | undefined) => void;
};

export function EventSelect({ events, value, onChange }: EventSelectProps) {
  return (
    <Select value={value ?? 'all'} onValueChange={(v) => onChange?.(v === 'all' ? undefined : v)}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="All Events" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Events</SelectItem>
        {events.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


