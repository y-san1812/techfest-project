import { Router } from 'express';

import { ROLE } from '@config/roles';
import { prisma } from '@core/prisma';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';

export const referralsRouter = Router();

referralsRouter.use(authenticateJwt);

referralsRouter.get('/me', requireRoles([ROLE.CAMPUS_AMBASSADOR] as any), async (req, res, next) => {
  try {
    const referral = await prisma.referral.findFirst({
      where: { ownerId: req.user!.id },
    });

    if (!referral) {
      return res.status(404).json({ message: 'Referral code not found' });
    }

    const [total, byEvent] = await Promise.all([
      prisma.registration.count({ where: { referralId: referral.id } }),
      prisma.registration.groupBy({
        by: ['eventId'],
        where: { referralId: referral.id },
        _count: { _all: true },
      }),
    ]);

    const eventIds = byEvent.map((e) => e.eventId);
    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: { id: true, title: true },
    });
    const eventTitleById = new Map(events.map((e) => [e.id, e.title]));

    res.json({
      code: referral.code,
      totalRegistrations: total,
      eventBreakdown: byEvent.map((e) => ({
        eventId: e.eventId,
        eventTitle: eventTitleById.get(e.eventId) ?? 'Unknown',
        registrations: e._count._all,
      })),
    });
  } catch (err) {
    next(err);
  }
});

