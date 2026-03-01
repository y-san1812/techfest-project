import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: ApiError, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors,
    });
  }

  const statusCode = err.statusCode ?? 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  // eslint-disable-next-line no-console
  console.error('API Error:', err);

  return res.status(statusCode).json({
    message,
    details: err.details,
  });
}

