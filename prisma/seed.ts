import { PrismaClient } from '@prisma/client';

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

  // Create randomized feedbacks across last 72h
  for (let i = 0; i < numFeedbacks; i += 1) {
    const event = events[randomInt(0, events.length - 1)];
    const hoursAgo = randomInt(0, 72);
    const createdAt = new Date(now - hoursAgo * 60 * 60 * 1000);
    const rating = randomInt(1, 5);
    const text = `Sample feedback ${i + 1}: rating ${rating}`;

    // eslint-disable-next-line no-await-in-loop
    await prisma.feedback.create({
      data: {
        eventId: event.id,
        rating,
        text,
        createdAt,
      },
    });
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
