import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { validateRequest } from '@middleware/validateRequest';
import { deleteUser, listRoles, listUsers, createUserWithRoles, setUserRoles, listClubs, listEventsByClub, listTeamsByEvent } from './admin.service';
import { createUserSchema, deleteUserSchema, listUsersSchema, setUserRolesSchema } from './admin.validation';

export const adminRouter = Router();

adminRouter.use(authenticateJwt);

// Super Admin only: user + role management
adminRouter.use(requireRoles([ROLE.SUPER_ADMIN] as any));

adminRouter.get('/roles', async (_req, res, next) => {
  try {
    const roles = await listRoles();
    res.json(roles);
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users', validateRequest(listUsersSchema), async (req, res, next) => {
  try {
    const { q, role, take, skip } = (req as any).validated.query;
    const result = await listUsers({ q, role, take: take ?? 25, skip: skip ?? 0 });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/users', validateRequest(createUserSchema), async (req, res, next) => {
  try {
    const { name, email, password, roles } = (req as any).validated.body;
    const created = await createUserWithRoles({ name, email, password, roles });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/users/:id/roles', validateRequest(setUserRolesSchema), async (req, res, next) => {
  try {
    const { roles, clubId, eventId, teamId } = (req as any).validated.body;
    await setUserRoles(req.params.id, roles, { clubId, eventId, teamId });
    res.status(200).json({ message: 'Roles updated' });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/users/:id', validateRequest(deleteUserSchema), async (req, res, next) => {
  try {
    await deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/clubs', async (_req, res, next) => {
  try {
    const clubs = await listClubs();
    res.json(clubs);
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/clubs/:clubId/events', async (req, res, next) => {
  try {
    const events = await listEventsByClub(req.params.clubId);
    res.json(events);
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/events/:eventId/teams', async (req, res, next) => {
  try {
    const teams = await listTeamsByEvent(req.params.eventId);
    res.json(teams);
  } catch (err) {
    next(err);
  }
});

