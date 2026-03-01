import type { NextFunction, Request, Response } from 'express';

import { ROLE, type RoleValue } from '@config/roles';
import type { AuthUser } from '@core/types/auth';
import { getAuthUserFromDb } from '@core/getAuthUser';
import { verifyJwt } from '@utils/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export function authenticateJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  let userId: string | null = null;
  try {
    const payload = verifyJwt(token);
    userId = payload.sub;
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  void (async () => {
    const authUser = await getAuthUserFromDb(userId!);
    if (!authUser) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
    req.user = authUser as AuthUser;
    next();
  })().catch(() => {
    res.status(500).json({ message: 'Internal server error' });
  });
}

export function requireRoles(allowedRoles: RoleValue[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    return next();
  };
}

export const requireSuperAdmin = requireRoles([ROLE.SUPER_ADMIN]);

