import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { validateRequest } from '@middleware/validateRequest';
import {
  createEvent,
  deleteEvent,
  getEventById,
  listEvents,
  updateEvent,
} from './events.service';
import {
  createEventSchema,
  listEventsSchema,
  updateEventSchema,
} from './events.validation';

export const eventsRouter = Router();

eventsRouter.get('/', validateRequest(listEventsSchema), async (req, res, next) => {
  try {
    const { status, category } = (req as any).validated.query;
    const events = await listEvents({ status, category });
    res.json(events);
  } catch (err) {
    next(err);
  }
});

eventsRouter.get('/:id', async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id);
    res.json(event);
  } catch (err) {
    next(err);
  }
});

eventsRouter.use(authenticateJwt);

const EVENT_MANAGER_ROLES = [
  ROLE.SUPER_ADMIN,
  ROLE.ADMIN,
  ROLE.FACULTY_COORDINATOR,
  ROLE.CLUB_COORDINATOR,
] as const;

eventsRouter.post(
  '/',
  requireRoles(EVENT_MANAGER_ROLES as any),
  validateRequest(createEventSchema),
  async (req, res, next) => {
    try {
      const created = await createEvent((req as any).validated.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },
);

eventsRouter.put(
  '/:id',
  requireRoles(EVENT_MANAGER_ROLES as any),
  validateRequest(updateEventSchema),
  async (req, res, next) => {
    try {
      const updated = await updateEvent({
        id: req.params.id,
        ...(req as any).validated.body,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

eventsRouter.delete(
  '/:id',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN] as any),
  async (req, res, next) => {
    try {
      await deleteEvent(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

