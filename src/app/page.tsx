import { fetchEvents } from '@/lib/api';
import { SubmitFeedbackForm } from '@/components/organisms/SubmitFeedbackForm';
import { FeedbackStream } from '@/components/organisms/FeedbackStream';

export default async function Home() {
  const events = await fetchEvents();

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="text-lg font-semibold">Events Feedback HUB</div>
      </header>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <aside>
          <SubmitFeedbackForm events={events} />
        </aside>
        <main>
          <div className="mb-2 text-sm font-medium">Live Feedback Stream</div>
          <FeedbackStream events={events} />
        </main>
      </div>

      <footer className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div>© 2025 Events Feedback HUB</div>
        <div>Help</div>
        <div>Privacy</div>
        <div>Terms</div>
      </footer>
    </div>
  );
}
