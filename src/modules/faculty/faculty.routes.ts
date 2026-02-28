import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { validateRequest } from '@middleware/validateRequest';
import {
  assignFacultyCoordinator,
  getFacultyCoordinators,
  removeFacultyCoordinator,
  getEventsByFacultyCoordinator,
} from './faculty.service';
import { assignFacultySchema, removeFacultySchema } from './faculty.validation';

export const facultyRouter = Router();

facultyRouter.use(authenticateJwt);

// Get faculty coordinators for an event
facultyRouter.get('/event/:eventId', async (req, res, next) => {
  try {
    const coordinators = await getFacultyCoordinators(req.params.eventId);
    res.json(coordinators);
  } catch (err) {
    next(err);
  }
});

// Get events where user is a faculty coordinator
facultyRouter.get('/my-events', async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const events = await getEventsByFacultyCoordinator(userId);
    res.json(events);
  } catch (err) {
    next(err);
  }
});

// Assign faculty coordinator (Admin only)
facultyRouter.post(
  '/assign',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN] as any),
  validateRequest(assignFacultySchema),
  async (req, res, next) => {
    try {
      const result = await assignFacultyCoordinator((req as any).validated.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

// Remove faculty coordinator (Admin only)
facultyRouter.delete(
  '/:eventId/:userId',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN] as any),
  async (req, res, next) => {
    try {
      await removeFacultyCoordinator(req.params.eventId, req.params.userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
