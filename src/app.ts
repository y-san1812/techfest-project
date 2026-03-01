import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from '@middleware/errorHandler';
import { loggingMiddleware } from '@middleware/loggingMiddleware';
import { authRouter } from '@modules/auth/auth.routes';
import { eventsRouter } from '@modules/events/events.routes';
import { registrationsRouter } from '@modules/registrations/registrations.routes';
import { tasksRouter } from '@modules/tasks/tasks.routes';
import { reportsRouter } from '@modules/reports/reports.routes';
import { notificationsRouter } from '@modules/notifications/notifications.routes';
import { usersRouter } from '@modules/users/users.routes';
import { adminRouter } from '@modules/admin/admin.routes';
import { referralsRouter } from '@modules/referrals/referrals.routes';
import { clubsRouter } from '@modules/clubs/clubs.routes';
import { teamsRouter } from '@modules/teams/teams.routes';
import { facultyRouter } from '@modules/faculty/faculty.routes';

export async function createServer(): Promise<Application> {
  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? '*',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(morgan('dev'));
  app.use(loggingMiddleware);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/registrations', registrationsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/referrals', referralsRouter);
  app.use('/api/clubs', clubsRouter);
  app.use('/api/teams', teamsRouter);
  app.use('/api/faculty', facultyRouter);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

