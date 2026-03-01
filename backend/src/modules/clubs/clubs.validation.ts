import { z } from 'zod';

export const createClubSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Club name must be at least 3 characters'),
  }),
});

export const updateClubSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: createClubSchema.shape.body.partial(),
});
