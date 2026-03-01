import { prisma } from '@core/prisma';

interface AssignFacultyInput {
  eventId: string;
  userId: string;
}

export async function assignFacultyCoordinator(input: AssignFacultyInput) {
  const existingAssignment = await prisma.eventFacultyCoordinator.findUnique({
    where: {
      eventId_userId: {
        eventId: input.eventId,
        userId: input.userId,
      },
    },
  });

  if (existingAssignment) {
    const error = new Error('User is already a faculty coordinator for this event') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  return prisma.eventFacultyCoordinator.create({
    data: {
      eventId: input.eventId,
      userId: input.userId,
    },
    include: {
      event: {
        select: { id: true, title: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function getFacultyCoordinators(eventId: string) {
  return prisma.eventFacultyCoordinator.findMany({
    where: { eventId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function removeFacultyCoordinator(eventId: string, userId: string) {
  return prisma.eventFacultyCoordinator.delete({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });
}

export async function getEventsByFacultyCoordinator(userId: string) {
  return prisma.eventFacultyCoordinator.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          teams: {
            include: {
              members: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}
