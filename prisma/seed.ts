import { PrismaClient } from '@prisma/client';
import { OpenAIChatClient } from '../src/infrastructure/ai/openaiClient';

const prisma = new PrismaClient();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const eventNames = [
    'Product Launch',
    'Tech Conference',
    'Team Offsite',
    'Customer Webinar',
    'Hackathon',
  ];

  // Upsert events
  const events = await Promise.all(
    eventNames.map((name) =>
      prisma.event.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const now = Date.now();
  const numFeedbacks = 250;

  // If OPENAI_API_KEY is present, use AI to generate realistic feedback texts in batches per event.
  const apiKey = process.env.OPENAI_API_KEY;
  const chatClient = apiKey ? new OpenAIChatClient(apiKey) : null;

  type GeneratedItem = { rating: number; text: string };

  async function generateAiFeedbackForEvent(eventName: string, count: number): Promise<GeneratedItem[]> {
    if (!chatClient) return [];
    const schemaHint = 'Return ONLY a compact JSON object: {"items": Array<{"rating": 1|2|3|4|5, "text": string}>}. No markdown.';
    const desired = Math.max(1, count);
    const prompt = `${schemaHint}\n\nTask: Generate ${desired} short, realistic user feedback entries for an event called "${eventName}".\n- Mix tone and specificity.\n- Keep each text 12-24 words.\n- Reflect ratings distribution (more 4-5 than 1-2, some 3s).\n- Do not number items.\n- Avoid emojis and repeated phrasing.\n- Keep content generic enough for a wide audience (no personally identifiable info).`;

    const raw = await chatClient.complete({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You write realistic, concise event feedback. Output strict JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      timeoutMs: 20000,
      responseFormat: 'json_object',
    });

    try {
      const parsed = JSON.parse(raw) as { items?: Array<{ rating: number; text: string }> };
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      return items
        .filter((i) => typeof i.rating === 'number' && i.rating >= 1 && i.rating <= 5 && typeof i.text === 'string')
        .map((i) => ({ rating: Math.round(i.rating), text: i.text.trim() }))
        .slice(0, desired);
    } catch {
      return [];
    }
  }

  function generateHeuristicText(eventName: string, rating: number): string {
    const positives = [
      `Loved the ${eventName}; sessions were engaging and well-paced with clear takeaways`,
      `Great energy at ${eventName}. Speakers were prepared and content felt actionable`,
      `Smooth logistics at ${eventName}; schedule ran on time and staff were helpful`,
      `Strong insights at ${eventName}. Networking breaks were the right length`,
    ];
    const neutrals = [
      `${eventName} was decent overall; a few talks stood out but pacing could improve`,
      `Mixed experience at ${eventName}. Content was fine though some segments dragged`,
      `${eventName} offered some value; logistics okay but room for polish`,
    ];
    const negatives = [
      `Disappointed by ${eventName}; sessions felt surface-level and hard to follow`,
      `Logistics were rough at ${eventName}. Long lines and unclear directions`,
      `Content at ${eventName} missed expectations; too salesy and not practical`,
    ];
    if (rating >= 4) return positives[randomInt(0, positives.length - 1)];
    if (rating === 3) return neutrals[randomInt(0, neutrals.length - 1)];
    return negatives[randomInt(0, negatives.length - 1)];
  }

  // Plan per-event distribution
  const perEvent = Math.floor(numFeedbacks / events.length);
  const remainder = numFeedbacks % events.length;

  for (let ei = 0; ei < events.length; ei += 1) {
    const event = events[ei];
    const count = perEvent + (ei < remainder ? 1 : 0);

    let items: GeneratedItem[] = [];
    if (chatClient) {
      try {
        items = await generateAiFeedbackForEvent(event.name, count);
      } catch {
        items = [];
      }
    }

    // If AI failed or not configured, fall back to heuristic generation
    if (items.length === 0) {
      for (let i = 0; i < count; i += 1) {
        const rating = randomInt(1, 5);
        items.push({ rating, text: generateHeuristicText(event.name, rating) });
      }
    }

    // Persist with randomized timestamps across last 72h
    // eslint-disable-next-line no-await-in-loop
    await prisma.$transaction(
      items.map((it) => {
        const hoursAgo = randomInt(0, 72);
        const createdAt = new Date(now - hoursAgo * 60 * 60 * 1000);
        return prisma.feedback.create({
          data: {
            eventId: event.id,
            rating: Math.max(1, Math.min(5, it.rating)),
            text: it.text.slice(0, 400),
            createdAt,
          },
        });
      }),
    );
  }

  // Optionally create empty summaries
  // for (const event of events) {
  //   await prisma.eventSummary.upsert({
  //     where: { eventId: event.id },
  //     update: {},
  //     create: { eventId: event.id, summary: '' },
  //   });
  // }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
