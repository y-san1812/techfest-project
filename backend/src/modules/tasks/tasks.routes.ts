import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { validateRequest } from '@middleware/validateRequest';
import {
  addTaskComment,
  createTask,
  listTasksForUser,
  updateTaskStatus,
} from './tasks.service';
import {
  addTaskCommentSchema,
  createTaskSchema,
  updateTaskStatusSchema,
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

tasksRouter.post(
  '/',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.FACULTY_COORDINATOR, ROLE.CLUB_COORDINATOR] as any),
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

