import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Team name must be at least 2 characters'),
    eventId: z.string().cuid('Event ID must be valid'),
    teamLeadId: z.string().cuid('Team lead ID must be valid'),
  }),
});

export const updateTeamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: createTeamSchema.shape.body.partial(),
});

export const joinTeamSchema = z.object({
  params: z.object({
    teamId: z.string().cuid(),
  }),
});

export const requestDecisionSchema = z.object({
  params: z.object({
    requestId: z.string().cuid(),
  }),
});
