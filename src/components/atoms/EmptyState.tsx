export function EmptyState({ message = 'No feedback yet.' }: { message?: string }) {
  return (
    <div className="rounded-md border bg-card p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}


