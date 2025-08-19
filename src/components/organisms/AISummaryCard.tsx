import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PercentageBar } from '@/components/atoms/PercentageBar';
import { SummarySection } from '@/components/molecules/SummarySection';
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

      <div className="mb-4">
        <div className="mb-1 text-xs text-muted-foreground">
          {summary ? `${summary.positive_percentage}% Positive` : 'Summary unavailable'}
        </div>
        <PercentageBar value={summary?.positive_percentage ?? 0} />
      </div>

      <div className="space-y-4">
        <SummarySection icon={<Check className="h-4 w-4 text-emerald-500" />} title="Top Highlights" items={summary?.top_highlights} />
        <SummarySection icon={<AlertTriangle className="h-4 w-4 text-red-500" />} title="Areas for Improvement" items={summary?.areas_for_improvement} />
      </div>
    </Card>
  );
}


