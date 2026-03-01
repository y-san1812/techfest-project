import { z } from 'zod';

export const listUsersSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    role: z.string().optional(),
    take: z.coerce.number().int().min(1).max(100).optional(),
    skip: z.coerce.number().int().min(0).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    roles: z.array(z.string()).min(1),
  }),
});

export const setUserRolesSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    roles: z.array(z.string()).min(1),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

