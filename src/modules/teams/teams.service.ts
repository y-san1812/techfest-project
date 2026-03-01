import { Prisma } from '@prisma/client';
import { prisma } from '@core/prisma';

interface CreateTeamInput {
  name: string;
  eventId: string;
  teamLeadId: string;
}

export async function listTeamsByEvent(eventId: string) {
  return prisma.team.findMany({
    where: { eventId },
    include: {
      teamLead: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getTeamById(id: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      event: true,
      teamLead: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      tasks: {
        include: {
          assignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
      joinRequests: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });
  if (!team) {
    const error = new Error('Team not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
  return team;
}

export async function createTeam(input: CreateTeamInput) {
  return prisma.team.create({
    data: {
      name: input.name,
      eventId: input.eventId,
      teamLeadId: input.teamLeadId,
    },
    include: {
      teamLead: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function updateTeam(id: string, input: Partial<CreateTeamInput>) {
  await getTeamById(id);
  return prisma.team.update({
    where: { id },
    data: {
      name: input.name,
      teamLeadId: input.teamLeadId,
    },
  });
}

export async function deleteTeam(id: string) {
  await getTeamById(id);
  await prisma.team.delete({ where: { id } });
}

export async function requestToJoinTeam(teamId: string, userId: string) {
  const existingRequest = await prisma.teamJoinRequest.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });

  if (existingRequest) {
    const error = new Error('You already have a pending or processed request for this team') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  return prisma.teamJoinRequest.create({
    data: {
      teamId,
      userId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      team: {
        select: { id: true, name: true },
      },
    },
  });
}

export async function getPendingJoinRequests(teamId: string) {
  return prisma.teamJoinRequest.findMany({
    where: {
      teamId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export async function approveJoinRequest(requestId: string) {
  const request = await prisma.teamJoinRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    const error = new Error('Join request not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  // Check if already a member
  const isMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: request.teamId,
        userId: request.userId,
      },
    },
  });

  if (isMember) {
    const error = new Error('User is already a member of this team') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  // Update request status and add to team
  await prisma.teamJoinRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED' },
  });

  return prisma.teamMember.create({
    data: {
      teamId: request.teamId,
      userId: request.userId,
    },
  });
}

export async function rejectJoinRequest(requestId: string) {
  const request = await prisma.teamJoinRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    const error = new Error('Join request not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  return prisma.teamJoinRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' },
  });
}
