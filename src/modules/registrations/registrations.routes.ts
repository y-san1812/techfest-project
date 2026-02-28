import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { validateRequest } from '@middleware/validateRequest';
import {
  createRegistration,
  listRegistrationsForEvent,
  updateRegistrationStatus,
} from './registrations.service';
import {
  createRegistrationSchema,
  updateRegistrationStatusSchema,
} from './registrations.validation';

export const registrationsRouter = Router();

registrationsRouter.use(authenticateJwt);

registrationsRouter.post(
  '/',
  validateRequest(createRegistrationSchema),
  async (req, res, next) => {
    try {
      const { eventId, type, referralCode, teamName, members } = (req as any).validated.body;
      const registration = await createRegistration(req.user!.id, {
        eventId,
        type,
        referralCode,
        teamName,
        members,
      });
      res.status(201).json(registration);
    } catch (err) {
      next(err);
    }
  },
);

registrationsRouter.get(
  '/event/:eventId',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.FACULTY_COORDINATOR, ROLE.CLUB_COORDINATOR] as any),
  async (req, res, next) => {
    try {
      const registrations = await listRegistrationsForEvent(req.params.eventId);
      res.json(registrations);
    } catch (err) {
      next(err);
    }
  },
);

registrationsRouter.patch(
  '/:id/status',
  requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.FACULTY_COORDINATOR] as any),
  validateRequest(updateRegistrationStatusSchema),
  async (req, res, next) => {
    try {
      const { status } = (req as any).validated.body;
      const updated = await updateRegistrationStatus(req.params.id, status);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

