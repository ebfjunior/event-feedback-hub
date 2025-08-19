import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedbackItem } from '@/types/api';

export type FeedbackCardProps = {
  feedback: FeedbackItem;
  highlight?: boolean;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn('h-4 w-4', i < rating ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-muted-foreground')}
        />
      ))}
    </div>
  );
}

export function FeedbackCard({ feedback, highlight }: FeedbackCardProps) {
  const created = new Date(feedback.created_at);
  const timeAgo = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const diffMs = Date.now() - created.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const rtf = diffMin < 60 ? timeAgo.format(-diffMin, 'minute') : timeAgo.format(-Math.round(diffMin / 60), 'hour');

  return (
    <div className={cn('rounded-md border bg-card/60 p-3 shadow-sm', highlight && 'ring-1 ring-yellow-400')}> 
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <div className="truncate font-medium text-primary/80">{feedback.event_name}</div>
        <div>{rtf}</div>
      </div>
      <div className="mb-2 text-sm text-foreground/90">{feedback.text}</div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Anonymous</div>
        <Stars rating={feedback.rating} />
      </div>
    </div>
  );
}
