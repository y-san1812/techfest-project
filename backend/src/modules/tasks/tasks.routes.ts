import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { validateRequest } from '@middleware/validateRequest';
import {
  addTaskComment,
  createTask,
  listTasksForUser,
  updateTaskStatus,
  assignTask,
  unassignTask,
  getTaskById,
  getTasksByTeam,
} from './tasks.service';
import {
  addTaskCommentSchema,
  createTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
} from './tasks.validation';

export const tasksRouter = Router();

tasksRouter.use(authenticateJwt);

tasksRouter.get('/my', async (req, res, next) => {
  try {
    const tasks = await listTasksForUser(req.user!.id);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

tasksRouter.get('/:id', async (req, res, next) => {
  try {
    const task = await getTaskById(req.params.id);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.get('/team/:teamId', async (req, res, next) => {
  try {
    const tasks = await getTasksByTeam(req.params.teamId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

tasksRouter.post(
  '/',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.FACULTY_COORDINATOR, ROLE.TEAM_LEAD] as any),
  validateRequest(createTaskSchema),
  async (req, res, next) => {
    try {
      const created = await createTask((req as any).validated.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },
);

tasksRouter.post(
  '/:taskId/assign',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.TEAM_LEAD] as any),
  validateRequest(assignTaskSchema),
  async (req, res, next) => {
    try {
      const { userId } = (req as any).validated.body;
      const result = await assignTask(req.params.taskId, userId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

tasksRouter.delete(
  '/:taskId/assign/:userId',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.TEAM_LEAD] as any),
  async (req, res, next) => {
    try {
      await unassignTask(req.params.taskId, req.params.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

tasksRouter.patch(
  '/:id/status',
  validateRequest(updateTaskStatusSchema),
  async (req, res, next) => {
    try {
      const { status } = (req as any).validated.body;
      const updated = await updateTaskStatus(
        { userId: req.user!.id, roles: req.user!.roles as any },
        req.params.id,
        status,
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

tasksRouter.post(
  '/:id/comments',
  validateRequest(addTaskCommentSchema),
  async (req, res, next) => {
    try {
      const { content } = (req as any).validated.body;
      const comment = await addTaskComment(
        { userId: req.user!.id, roles: req.user!.roles as any },
        req.params.id,
        req.user!.id,
        content,
      );
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  },
);

