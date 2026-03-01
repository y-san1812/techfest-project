import { prisma } from '@core/prisma';
import { ROLE, type RoleValue } from '@config/roles';

interface CreateTaskInput {
  title: string;
  description?: string;
  deadline?: string;
  teamId: string;
}

async function getTaskOrThrow(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      team: { select: { teamLeadId: true } },
      assignments: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
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
      teamId: input.teamId,
    },
  });
}

export async function getTaskById(id: string) {
  return getTaskOrThrow(id);
}

export async function getTasksByTeam(teamId: string) {
  return prisma.task.findMany({
    where: { teamId },
    include: {
      assignments: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function listTasksForUser(userId: string) {
  return prisma.taskAssignment.findMany({
    where: { userId },
    include: {
      task: {
        include: {
          team: {
            select: { id: true, name: true },
          },
        },
      },
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
    task.assignments.some(a => a.userId === actor.userId) ||
    (task.team?.teamLeadId ? task.team.teamLeadId === actor.userId : false);

  if (!canEdit) {
    const error = new Error('Insufficient permissions') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  return prisma.taskAssignment.updateMany({
    where: {
      taskId: id,
      userId: actor.userId,
    },
    data: { status },
  });
}

export async function updateTask(id: string, input: Partial<CreateTaskInput>) {
  await getTaskOrThrow(id);

  return prisma.task.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
    },
  });
}

export async function deleteTask(id: string) {
  await getTaskOrThrow(id);
  await prisma.task.delete({ where: { id } });
}

export async function assignTask(taskId: string, userId: string) {
  const existingAssignment = await prisma.taskAssignment.findUnique({
    where: {
      taskId_userId: {
        taskId,
        userId,
      },
    },
  });

  if (existingAssignment) {
    const error = new Error('User is already assigned to this task') as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  return prisma.taskAssignment.create({
    data: {
      taskId,
      userId,
      status: 'TODO',
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      task: {
        select: { id: true, title: true },
      },
    },
  });
}

export async function unassignTask(taskId: string, userId: string) {
  return prisma.taskAssignment.delete({
    where: {
      taskId_userId: {
        taskId,
        userId,
      },
    },
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
    task.assignments.some(a => a.userId === actor.userId) ||
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

