import { Prisma } from '@prisma/client';

import { prisma } from '@core/prisma';

interface CreateEventInput {
  title: string;
  description: string;
  category: string;
  clubId: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  startTime: string;
  endTime: string;
  location: string;
  registrationCap?: number | null;
}

interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export async function listEvents(filters: { status?: string; category?: string }) {
  const where: Prisma.EventWhereInput = {};
  if (filters.status) where.status = filters.status as any;
  if (filters.category) where.category = filters.category;

  return prisma.event.findMany({
    where,
    orderBy: { startTime: 'asc' },
  });
}

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
  });
  if (!event) {
    const error = new Error('Event not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
  return event;
}

export async function createEvent(input: CreateEventInput) {
  return prisma.event.create({
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      clubId: input.clubId,
      status: (input.status ?? 'DRAFT') as any,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      location: input.location,
      registrationCap: input.registrationCap ?? null,
    },
  });
}

export async function updateEvent(input: UpdateEventInput) {
  await getEventById(input.id);

  return prisma.event.update({
    where: { id: input.id },
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      status: input.status as any,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      endTime: input.endTime ? new Date(input.endTime) : undefined,
      location: input.location,
      registrationCap:
        input.registrationCap === undefined ? undefined : input.registrationCap ?? null,
    },
  });
}

export async function deleteEvent(id: string) {
  await getEventById(id);
  await prisma.event.delete({ where: { id } });
}

