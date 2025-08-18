import { z } from 'zod';

export const SortSchema = z.union([z.literal('newest'), z.literal('highest')]);

export const ListFeedbacksQuerySchema = z.object({
  event_id: z.string().uuid().optional(),
  rating: z
    .preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int().min(1).max(5))
    .optional(),
  sort: SortSchema.default('newest'),
  limit: z
    .preprocess((v) => (typeof v === 'string' ? Number(v) : v), z.number().int().min(1).max(50))
    .default(20),
  cursor: z.string().min(1).optional(),
});

export type ListFeedbacksQuery = z.infer<typeof ListFeedbacksQuerySchema>;

export const CreateFeedbackBodySchema = z.object({
  event_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(1000),
});

export type CreateFeedbackBody = z.infer<typeof CreateFeedbackBodySchema>;
