import type { SummaryService } from '@/application/ports/SummaryService';
import type { PrismaClient } from '@prisma/client';
import type { ChatClient } from '@/infrastructure/ai/openaiClient';
import { OpenAIChatClient } from '@/infrastructure/ai/openaiClient';

type OpenAISummaryServiceOptions = {
  apiKey?: string;
  model?: string;
  maxItems?: number;
  timeoutMs?: number;
};

export class OpenAISummaryService implements SummaryService {
  private readonly prisma: PrismaClient;
  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly maxItems: number;
  private readonly timeoutMs: number;
  private readonly chatClient: ChatClient | null;

  constructor(prisma: PrismaClient, options: OpenAISummaryServiceOptions = {}) {
    this.prisma = prisma;
    this.apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    this.model = options.model ?? 'gpt-4o-mini';
    this.maxItems = options.maxItems ?? 100;
    this.timeoutMs = options.timeoutMs ?? 15000;
    this.chatClient = this.apiKey ? new OpenAIChatClient(this.apiKey) : null;
  }

  async computeSummaryForEvent(eventId: string): Promise<string> {
    // Fetch the most recent feedback texts for the event
    const feedbacks = await this.prisma.feedback.findMany({
      where: { eventId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { text: true },
      take: this.maxItems,
    });

    if (feedbacks.length === 0) {
      return 'No feedback available yet.';
    }

    const concatenated = feedbacks
      .map((f: { text: string }, i: number) => `${i + 1}. ${f.text}`)
      .join('\n');

    // If no API key is configured, return a simple heuristic summary as a safe fallback
    if (!this.chatClient) {
      // Very naive fallback: length and sentiment hints are omitted to avoid flaky behavior
      const approxCount = feedbacks.length;
      return `Summary (fallback): ${approxCount} recent feedback entries captured. Themes will appear here when the summaries feature is fully configured.`;
    }

    // Use the chat client abstraction for testability
    const content = await this.chatClient.complete({
      model: this.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that produces a concise, neutral summary of event feedback. Capture key themes, sentiment, and actionable insights in 3-6 bullet points. Keep it under 120 words. Do not include personal data or quotes.',
        },
        {
          role: 'user',
          content: `Summarize the following feedback entries for the event.\n\n${concatenated}`,
        },
      ],
      temperature: 0.2,
      timeoutMs: this.timeoutMs,
    });
    return content;
  }
}


