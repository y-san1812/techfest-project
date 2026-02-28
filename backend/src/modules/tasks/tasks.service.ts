import { prisma } from '@core/prisma';
import { ROLE, type RoleValue } from '@config/roles';

interface CreateTaskInput {
  title: string;
  description?: string;
  deadline?: string;
  eventId?: string;
  teamId?: string;
  assigneeId?: string;
}

async function getTaskOrThrow(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      team: { select: { teamLeadId: true } },
    },
  });
  if (!task) {
    const error = new Error('Task not found') as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }
  return task;
}

function isAdminLike(roles: RoleValue[]) {
  return roles.includes(ROLE.SUPER_ADMIN) || roles.includes(ROLE.ADMIN);
}

export async function createTask(input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      eventId: input.eventId,
      teamId: input.teamId,
      assigneeId: input.assigneeId,
    },
  });
}

export async function listTasksForUser(userId: string) {
  return prisma.task.findMany({
    where: {
      OR: [{ assigneeId: userId }, { team: { teamLeadId: userId } }],
    },
    include: {
      event: true,
      team: true,
    },
  });
}

export async function updateTaskStatus(
  actor: { userId: string; roles: RoleValue[] },
  id: string,
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED',
) {
  const task = await getTaskOrThrow(id);
  const canEdit =
    isAdminLike(actor.roles) ||
    task.assigneeId === actor.userId ||
    (task.team?.teamLeadId ? task.team.teamLeadId === actor.userId : false);

  if (!canEdit) {
    const error = new Error('Insufficient permissions') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  return prisma.task.update({
    where: { id },
    data: { status },
  });
}

export async function addTaskComment(
  actor: { userId: string; roles: RoleValue[] },
  taskId: string,
  authorId: string,
  content: string,
) {
  const task = await getTaskOrThrow(taskId);
  const canComment =
    isAdminLike(actor.roles) ||
    task.assigneeId === actor.userId ||
    (task.team?.teamLeadId ? task.team.teamLeadId === actor.userId : false);

  if (!canComment) {
    const error = new Error('Insufficient permissions') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  return prisma.taskComment.create({
    data: {
      taskId,
      authorId,
      content,
    },
  });
}

