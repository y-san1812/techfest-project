import { z } from 'zod';

export const assignFacultySchema = z.object({
  body: z.object({
    eventId: z.string().cuid('Event ID must be valid'),
    userId: z.string().cuid('User ID must be valid'),
  }),
});

export const removeFacultySchema = z.object({
  params: z.object({
    eventId: z.string().cuid(),
    userId: z.string().cuid(),
  }),
});
