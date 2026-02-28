import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { validateRequest } from '@middleware/validateRequest';
import { listClubs, getClubById, createClub, updateClub, deleteClub } from './clubs.service';
import { createClubSchema, updateClubSchema } from './clubs.validation';

export const clubsRouter = Router();

clubsRouter.get('/', async (_req, res, next) => {
  try {
    const clubs = await listClubs();
    res.json(clubs);
  } catch (err) {
    next(err);
  }
});

clubsRouter.get('/:id', async (req, res, next) => {
  try {
    const club = await getClubById(req.params.id);
    res.json(club);
  } catch (err) {
    next(err);
  }
});

clubsRouter.use(authenticateJwt);
clubsRouter.use(requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN] as any));

clubsRouter.post('/', validateRequest(createClubSchema), async (req, res, next) => {
  try {
    const club = await createClub((req as any).validated.body);
    res.status(201).json(club);
  } catch (err) {
    next(err);
  }
});

clubsRouter.put(
  '/:id',
  validateRequest(updateClubSchema),
  async (req, res, next) => {
    try {
      const updated = await updateClub(req.params.id, (req as any).validated.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

clubsRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteClub(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
