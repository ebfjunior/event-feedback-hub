import { Button } from '@/components/ui/button';

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
      <div className="text-destructive">{message}</div>
      <Button size="sm" variant="destructive" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
