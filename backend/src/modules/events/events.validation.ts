import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    category: z.string().min(2),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    location: z.string().min(3),
    registrationCap: z.number().int().positive().optional().nullable(),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: createEventSchema.shape.body.partial(),
});

export const listEventsSchema = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
    category: z.string().optional(),
  }),
});

