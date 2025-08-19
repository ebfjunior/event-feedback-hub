import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type RatingSelectProps = {
  value?: number;
  onChange?: (rating: number | undefined) => void;
};

export function RatingSelect({ value, onChange }: RatingSelectProps) {
  return (
    <Select
      value={typeof value === 'number' ? String(value) : 'all'}
      onValueChange={(v) => onChange?.(v === 'all' ? undefined : Number(v))}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="All Ratings" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Ratings</SelectItem>
        {[5, 4, 3, 2, 1].map((r) => (
          <SelectItem key={r} value={String(r)}>
            {r} stars
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


