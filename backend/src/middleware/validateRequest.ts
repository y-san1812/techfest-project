import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';

export function validateRequest(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const error = new Error('Validation error') as Error & { statusCode?: number; details?: unknown };
      error.statusCode = 400;
      error.details = result.error.flatten();
      throw error;
    }

    // Attach parsed data if needed
    (req as any).validated = result.data;
    return next();
  };
}

