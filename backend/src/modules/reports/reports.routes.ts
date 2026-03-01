import { Router } from 'express';

import { ROLE } from '@config/roles';
import { authenticateJwt, requireRoles } from '@middleware/authMiddleware';
import { exportRegistrationsCsv, getDashboardSummary } from './reports.service';

export const reportsRouter = Router();

reportsRouter.use(authenticateJwt, requireRoles([ROLE.SUPER_ADMIN, ROLE.ADMIN] as any));

reportsRouter.get('/summary', async (_req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

reportsRouter.get('/registrations/export', async (_req, res, next) => {
  try {
    const csv = await exportRegistrationsCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment('registrations.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

