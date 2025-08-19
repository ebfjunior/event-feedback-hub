import { fetchEvents, fetchEventSummary } from '@/lib/api';
import { SubmitFeedbackForm } from '@/components/organisms/SubmitFeedbackForm';
import { FeedbackStream } from '@/components/organisms/FeedbackStream';
import { AISummaryCard } from '@/components/organisms/AISummaryCard';

export default async function EventPage({ params }: { params: Promise<{ event_id: string }> }) {
  const events = await fetchEvents();
  const { event_id } = await params;
  const selected = events.find((e) => e.id === event_id);
  const summariesEnabled = process.env.FEATURE_SUMMARIES === 'true';
  let summary:
    | { positive_percentage: number; top_highlights: string[]; areas_for_improvement: string[] }
    | null = null;
  if (summariesEnabled && selected) {
    try {
      const data = await fetchEventSummary(selected.id);
      summary = data.summary;
    } catch {
      summary = null;
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="text-lg font-semibold">{selected ? selected.name : 'Event'}</div>
      </header>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          {summariesEnabled && selected && <AISummaryCard summary={summary} />}
          <SubmitFeedbackForm events={events} />
        </aside>
        <main>
          <div className="mb-2 text-sm font-medium">Event Feedback</div>
          <FeedbackStream events={events} fixedEventId={event_id} />
        </main>
      </div>
    </div>
  );
}
