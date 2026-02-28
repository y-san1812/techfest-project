import type { NextFunction, Request, Response } from 'express';

export function loggingMiddleware(req: Request, _res: Response, next: NextFunction) {
  // Here you could persist to ActivityLogs via Prisma if desired.
  // For now, keep it lightweight; morgan handles most logging.
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
}

