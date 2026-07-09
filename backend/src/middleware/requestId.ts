import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export type RequestWithId = Request & { requestId?: string };

export function getRequestId(req: Request): string | undefined {
  return (req as RequestWithId).requestId;
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.header('x-request-id') || randomUUID();
  (req as RequestWithId).requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
