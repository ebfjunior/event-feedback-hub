import { Button } from '@/components/ui/button';

export type NewItemsBannerProps = {
  count: number;
  onApply: () => void;
};

export function NewItemsBanner({ count, onApply }: NewItemsBannerProps) {
  if (count <= 0) return null;
  return (
    <div className="flex items-center justify-between rounded-md border border-cyan-500/50 bg-cyan-50 p-2 text-sm text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-100">
      <div>{count} new feedback {count === 1 ? 'submission' : 'submissions'} available</div>
      <Button size="sm" variant="secondary" onClick={onApply}>
        Show
      </Button>
    </div>
  );
}
