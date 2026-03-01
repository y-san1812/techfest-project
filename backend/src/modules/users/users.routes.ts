import { Router } from 'express';

import { authenticateJwt } from '@middleware/authMiddleware';

export const usersRouter = Router();

usersRouter.use(authenticateJwt);

usersRouter.get('/me', async (req, res) => {
  res.json(req.user);
});

