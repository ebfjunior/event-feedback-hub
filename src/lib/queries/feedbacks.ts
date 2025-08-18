import type { Prisma } from '@prisma/client';

export type FeedbackFilters = {
  eventId?: string;
  rating?: number;
};

export function whereForFilters(filters: FeedbackFilters): Prisma.FeedbackWhereInput {
  const { eventId, rating } = filters;
  return {
    AND: [eventId ? { eventId } : {}, typeof rating === 'number' ? { rating } : {}],
  } satisfies Prisma.FeedbackWhereInput;
}

export function whereForNewestKeyset(
  base: Prisma.FeedbackWhereInput,
  key?: { createdAtIso: string; id: string },
): Prisma.FeedbackWhereInput {
  if (!key) return base;
  const createdAt = new Date(key.createdAtIso);
  return {
    AND: [
      base,
      {
        OR: [{ createdAt: { lt: createdAt } }, { AND: [{ createdAt }, { id: { lt: key.id } }] }],
      },
    ],
  } satisfies Prisma.FeedbackWhereInput;
}

export function whereForHighestKeyset(
  base: Prisma.FeedbackWhereInput,
  key?: { rating: number; createdAtIso: string; id: string },
): Prisma.FeedbackWhereInput {
  if (!key) return base;
  const createdAt = new Date(key.createdAtIso);
  return {
    AND: [
      base,
      {
        OR: [
          { rating: { lt: key.rating } },
          {
            AND: [
              { rating: key.rating },
              {
                OR: [
                  { createdAt: { lt: createdAt } },
                  { AND: [{ createdAt }, { id: { lt: key.id } }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  } satisfies Prisma.FeedbackWhereInput;
}

export function orderByForNewest(): Prisma.FeedbackOrderByWithRelationInput[] {
  return [{ createdAt: 'desc' }, { id: 'desc' }];
}

export function orderByForHighest(): Prisma.FeedbackOrderByWithRelationInput[] {
  return [{ rating: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }];
}
