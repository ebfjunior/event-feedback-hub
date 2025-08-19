import { Button } from '@/components/ui/button';
import type { SortOption } from '@/types/api';

export type SortToggleProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

export function SortToggle({ value, onChange }: SortToggleProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <Button variant={value === 'newest' ? 'default' : 'outline'} size="sm" onClick={() => onChange('newest')}>
        Newest
      </Button>
      <Button variant={value === 'highest' ? 'default' : 'outline'} size="sm" onClick={() => onChange('highest')}>
        Highest Rated
      </Button>
    </div>
  );
}


