import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle, Bot } from 'lucide-react';

export type AISummaryData = {
  positive_percentage: number;
  top_highlights: string[];
  areas_for_improvement: string[];
} | null;

export function AISummaryCard({ summary }: { summary: AISummaryData }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <span>AI Feedback Summary</span>
        <Badge variant="secondary" className="gap-1">
          <Bot className="h-3.5 w-3.5" /> AI Generated
        </Badge>
      </div>

      {/* Positivity bar */}
      <div className="mb-4">
        <div className="mb-1 text-xs text-muted-foreground">
          {summary ? `${summary.positive_percentage}% Positive` : 'Summary unavailable'}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(Math.max(summary?.positive_percentage ?? 0, 0), 100)}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <section className="rounded-md bg-muted/40 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>Top Highlights</span>
          </div>
          <ul className="list-inside space-y-2 text-sm text-muted-foreground">
            {(summary?.top_highlights?.length ? summary.top_highlights : ['—']).slice(0, 5).map((item, idx) => (
              <li key={`hi-${idx}`} className="flex gap-2">
                <span className="select-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md bg-muted/40 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>Areas for Improvement</span>
          </div>
          <ul className="list-inside space-y-2 text-sm text-muted-foreground">
            {(summary?.areas_for_improvement?.length ? summary.areas_for_improvement : ['—']).slice(0, 5).map((item, idx) => (
              <li key={`imp-${idx}`} className="flex gap-2">
                <span className="select-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Card>
  );
}
