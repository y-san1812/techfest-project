import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    deadline: z.string().datetime().optional(),
    eventId: z.string().cuid().optional(),
    teamId: z.string().cuid().optional(),
    assigneeId: z.string().cuid().optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']),
  }),
});

export const addTaskCommentSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    content: z.string().min(1),
  }),
});

