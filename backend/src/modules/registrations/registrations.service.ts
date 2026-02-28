import { prisma } from '@core/prisma';

interface CreateRegistrationInput {
  eventId: string;
  type: 'INDIVIDUAL' | 'TEAM';
  referralCode?: string;
  teamName?: string;
  members?: { userId: string }[];
}

export async function createRegistration(userId: string, input: CreateRegistrationInput) {
  const event = await prisma.event.findUnique({ where: { id: input.eventId } });
  if (!event) {
    const error = new Error('Event not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  if (event.status !== 'PUBLISHED') {
    const error = new Error('Event is not open for registration') as Error & { statusCode?: number };
    error.statusCode = 409;
    throw error;
  }

  const existing = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId: input.eventId } },
  });
  if (existing) {
    const error = new Error('Already registered') as Error & { statusCode?: number };
    error.statusCode = 409;
    throw error;
  }

  const referral = input.referralCode
    ? await prisma.referral.findUnique({ where: { code: input.referralCode } })
    : null;

  if (input.type === 'INDIVIDUAL') {
    return prisma.$transaction(async (tx) => {
      if (event.registrationCap) {
        const count = await tx.registration.count({ where: { eventId: event.id } });
        if (count >= event.registrationCap) {
          const error = new Error('Registration cap reached') as Error & { statusCode?: number };
          error.statusCode = 409;
          throw error;
        }
      }

      return tx.registration.create({
        data: {
          userId,
          eventId: input.eventId,
          referralId: referral?.id,
        },
      });
    });
  }

  // TEAM registration
  return prisma.$transaction(async (tx) => {
    if (event.registrationCap) {
      const count = await tx.registration.count({ where: { eventId: event.id } });
      if (count >= event.registrationCap) {
        const error = new Error('Registration cap reached') as Error & { statusCode?: number };
        error.statusCode = 409;
        throw error;
      }
    }

    const memberIds = (input.members ?? []).map((m) => m.userId);
    const uniqueMemberIds = Array.from(new Set(memberIds.filter((id) => id !== userId)));

    if (uniqueMemberIds.length) {
      const existingUsers = await tx.user.findMany({
        where: { id: { in: uniqueMemberIds } },
        select: { id: true },
      });
      if (existingUsers.length !== uniqueMemberIds.length) {
        const error = new Error('One or more team members are invalid') as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
    }

    const team = await tx.team.create({
      data: {
        name: input.teamName ?? 'Team',
        eventId: input.eventId,
        teamLeadId: userId,
      },
    });

    await tx.teamMember.create({
      data: {
        teamId: team.id,
        userId,
      },
    });

    if (uniqueMemberIds.length) {
      await tx.teamMember.createMany({
        data: uniqueMemberIds.map((memberId) => ({
          teamId: team.id,
          userId: memberId,
        })),
        skipDuplicates: true,
      });
    }

    const registration = await tx.registration.create({
      data: {
        userId,
        eventId: input.eventId,
        teamId: team.id,
        referralId: referral?.id,
      },
    });

    return registration;
  });
}

export async function listRegistrationsForEvent(eventId: string) {
  return prisma.registration.findMany({
    where: { eventId },
    include: {
      user: true,
      team: true,
    },
  });
}

export async function updateRegistrationStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) {
    const error = new Error('Registration not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
  return prisma.registration.update({
    where: { id },
    data: { status },
  });
}

