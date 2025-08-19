import React from 'react';
import { BulletList } from '@/components/atoms/BulletList';

export type SummarySectionProps = {
  icon: React.ReactNode;
  title: string;
  items?: string[] | null;
};

export function SummarySection({ icon, title, items }: SummarySectionProps) {
  return (
    <section className="rounded-md bg-muted/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        <span>{title}</span>
      </div>
      <BulletList className="list-inside space-y-2 text-sm text-muted-foreground" items={items ?? []} />
    </section>
  );
}


