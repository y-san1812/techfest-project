import { Router } from 'express';

import { validateRequest } from '@middleware/validateRequest';
import { loginUser, registerUser } from './auth.service';
import { loginSchema, registerSchema } from './auth.validation';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = (req as any).validated.body;
    const result = await registerUser({ name, email, password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = (req as any).validated.body;
    const result = await loginUser({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

