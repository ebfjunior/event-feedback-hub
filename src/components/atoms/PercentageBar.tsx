import React from 'react';

export type PercentageBarProps = {
  value?: number | null;
  className?: string;
};

export function PercentageBar({ value, className }: PercentageBarProps) {
  const clamped = Math.min(Math.max(value ?? 0, 0), 100);
  return (
    <div className={className}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}


