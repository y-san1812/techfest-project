import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { prisma } from '@core/prisma';
import {
  createAnnouncementForRole,
  listUserNotifications,
  markNotificationRead,
} from './notifications.service';

export const notificationsRouter = Router();

notificationsRouter.use(authenticateJwt);

notificationsRouter.get('/', async (req, res, next) => {
  try {
    const notifications = await listUserNotifications(req.user!.id);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

notificationsRouter.patch('/:id/read', async (req, res, next) => {
  try {
    await markNotificationRead(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

notificationsRouter.post('/announce', requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN] as any), async (req, res, next) => {
  try {
    const { role, title, body } = req.body as { role: string; title: string; body: string };
    if (!role || !title || !body) {
      return res.status(400).json({ message: 'role, title and body are required' });
    }
    await createAnnouncementForRole(role, title, body);
    res.status(201).json({ message: 'Announcement created' });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.get('/me/activity', async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

