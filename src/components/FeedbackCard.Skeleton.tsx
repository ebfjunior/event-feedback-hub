export function FeedbackCardSkeleton() {
  return (
    <div className="animate-pulse rounded-md border bg-card/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="h-3 w-32 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-4/6 rounded bg-muted" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}
