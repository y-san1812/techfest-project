import { z } from 'zod';

export const createRegistrationSchema = z.object({
  body: z.object({
    eventId: z.string().cuid(),
    type: z.enum(['INDIVIDUAL', 'TEAM']),
    referralCode: z.string().optional(),
    teamName: z.string().min(3).optional(),
    members: z
      .array(
        z.object({
          userId: z.string().cuid(),
        }),
      )
      .optional(),
  }),
});

export const updateRegistrationStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  }),
});

