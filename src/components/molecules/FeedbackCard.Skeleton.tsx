import { Card, CardContent, CardHeader, CardAction } from '@/components/ui/card';

export function FeedbackCardSkeleton() {
  return (
    <Card className="animate-pulse bg-card/60">
      <CardHeader className="gap-1.5">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
        <CardAction>
          <div className="h-4 w-24 rounded bg-muted" />
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
          <div className="h-3 w-4/6 rounded bg-muted" />
        </div>
        <div className="mt-3 h-3 w-24 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}


