import { Prisma } from '@prisma/client';
import { prisma } from '@core/prisma';

interface CreateClubInput {
  name: string;
}

export async function listClubs() {
  return prisma.club.findMany({
    orderBy: { createdAt: 'desc' },
    include: { events: true },
  });
}

export async function getClubById(id: string) {
  const club = await prisma.club.findUnique({
    where: { id },
    include: { events: true },
  });
  if (!club) {
    const error = new Error('Club not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
  return club;
}

export async function createClub(input: CreateClubInput) {
  return prisma.club.create({
    data: {
      name: input.name,
    },
  });
}

export async function updateClub(id: string, input: Partial<CreateClubInput>) {
  await getClubById(id);
  return prisma.club.update({
    where: { id },
    data: {
      name: input.name,
    },
  });
}

export async function deleteClub(id: string) {
  await getClubById(id);
  await prisma.club.delete({ where: { id } });
}
