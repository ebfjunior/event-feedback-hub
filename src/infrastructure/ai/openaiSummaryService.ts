import type { SummaryService, EventSummary } from '@/types/SummaryService';
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

  async computeSummaryForEvent(eventId: string): Promise<EventSummary> {
    // Fetch the most recent feedback for the event
    const feedbacks = await this.prisma.feedback.findMany({
      where: { eventId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { text: true, rating: true },
      take: this.maxItems,
    });

    if (feedbacks.length === 0) {
      return { positive_percentage: 0, top_highlights: [], areas_for_improvement: [] };
    }

    // Fallback path when no API key
    if (!this.chatClient) {
      const positive = feedbacks.filter((f: { rating: number | null }) => (f.rating ?? 0) >= 4).length;
      const negative = feedbacks.filter((f: { rating: number | null }) => (f.rating ?? 0) <= 2).length;
      const denom = positive + negative || feedbacks.length;
      const positive_percentage = Math.round((positive / Math.max(denom, 1)) * 100);
      return {
        positive_percentage,
        top_highlights: ['Summaries are unavailable without AI. Showing heuristic positivity only.'],
        areas_for_improvement: [],
      };
    }

    const concatenated = feedbacks
      .map((f: { text: string; rating: number | null }, i: number) => `${i + 1}. [rating:${f.rating ?? 'n/a'}] ${f.text}`)
      .join('\n');

    const schemaHint = `You must return ONLY a compact JSON object with keys: 
{"positive_percentage": number (0-100), "top_highlights": string[], "areas_for_improvement": string[]}`;

    const raw = await this.chatClient.complete({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You analyze event feedback and produce structured summaries. Return strict JSON only, no markdown.',
        },
        {
          role: 'user',
          content: `${schemaHint}\n\nHere are recent feedback entries (most recent first). Identify what went well and what to improve.\n\n${concatenated}`,
        },
      ],
      temperature: 0.2,
      timeoutMs: this.timeoutMs,
      responseFormat: 'json_object',
    });

    // Parse model output safely
    let parsed: EventSummary | null = null;
    try {
      parsed = JSON.parse(raw) as EventSummary;
      // Basic shape validation
      if (
        parsed === null ||
        typeof parsed.positive_percentage !== 'number' ||
        !Array.isArray(parsed.top_highlights) ||
        !Array.isArray(parsed.areas_for_improvement)
      ) {
        parsed = null;
      }
    } catch {
      parsed = null;
    }

    if (!parsed) {
      // Graceful fallback using heuristic
      const positive = feedbacks.filter((f: { rating: number | null }) => (f.rating ?? 0) >= 4).length;
      const negative = feedbacks.filter((f: { rating: number | null }) => (f.rating ?? 0) <= 2).length;
      const denom = positive + negative || feedbacks.length;
      const positive_percentage = Math.round((positive / Math.max(denom, 1)) * 100);
      return {
        positive_percentage,
        top_highlights: ['AI response could not be parsed. Showing heuristic positivity only.'],
        areas_for_improvement: [],
      };
    }

    // Clamp percentage to 0..100 just in case
    parsed.positive_percentage = Math.max(0, Math.min(100, Math.round(parsed.positive_percentage)));
    // Trim arrays and cap lengths
    parsed.top_highlights = parsed.top_highlights.map((s) => s.trim()).filter(Boolean).slice(0, 5);
    parsed.areas_for_improvement = parsed.areas_for_improvement.map((s) => s.trim()).filter(Boolean).slice(0, 5);
    return parsed;
  }
}


