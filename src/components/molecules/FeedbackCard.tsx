import Link from 'next/link';
import type { FeedbackItem } from '@/types/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stars } from '@/components/atoms/Stars';

export type FeedbackCardProps = {
  feedback: FeedbackItem;
  highlight?: boolean;
};

export function FeedbackCard({ feedback, highlight }: FeedbackCardProps) {
  const created = new Date(feedback.created_at);
  const timeAgo = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const diffMs = Date.now() - created.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const rtf = diffMin < 60 ? timeAgo.format(-diffMin, 'minute') : timeAgo.format(-Math.round(diffMin / 60), 'hour');

  return (
    <Card className={cn('bg-card/60 shadow-sm', highlight && 'ring-1 ring-yellow-400')}>
      <CardHeader className="gap-1.5">
        <Badge asChild variant="secondary" className="truncate max-w-full">
          <Link href={`/events/${feedback.event_id}`} aria-label={`Open event ${feedback.event_name}`}>
            {feedback.event_name}
          </Link>
        </Badge>
        <CardDescription className="text-xs">{rtf}</CardDescription>
        <CardAction>
          <Stars rating={feedback.rating} />
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-foreground/90">{feedback.text}</div>
        <div className="mt-3 text-xs text-muted-foreground">Anonymous</div>
      </CardContent>
    </Card>
  );
}


