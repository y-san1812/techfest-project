import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    deadline: z.string().datetime().optional(),
    teamId: z.string().cuid('Team ID must be valid'),
  }),
});

export const assignTaskSchema = z.object({
  params: z.object({
    taskId: z.string().cuid(),
  }),
  body: z.object({
    userId: z.string().cuid('User ID must be valid'),
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

