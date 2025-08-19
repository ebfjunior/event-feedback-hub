import React from 'react';

export type BulletListProps = {
  items?: string[] | null;
  maxItems?: number;
  placeholder?: string;
  className?: string;
};

export function BulletList({ items, maxItems = 5, placeholder = '—', className }: BulletListProps) {
  const safeItems = (items && items.length > 0 ? items : [placeholder]).slice(0, maxItems);
  return (
    <ul className={className}>
      {safeItems.map((item, idx) => (
        <li key={idx} className="flex gap-2">
          <span className="select-none">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}


