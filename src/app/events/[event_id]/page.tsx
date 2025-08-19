import { fetchEvents } from '@/lib/api';
import { SubmitForm } from '@/components/SubmitForm';
import { Stream } from '@/components/Stream';

export default async function EventPage({ params }: { params: { event_id: string } }) {
  const events = await fetchEvents();
  const selected = events.find((e) => e.id === params.event_id);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="text-lg font-semibold">{selected ? selected.name : 'Event'}</div>
      </header>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <aside>
          <SubmitForm events={events} />
        </aside>
        <main>
          <div className="mb-2 text-sm font-medium">Event Feedback</div>
          <Stream events={events} fixedEventId={params.event_id} />
        </main>
      </div>
    </div>
  );
}
