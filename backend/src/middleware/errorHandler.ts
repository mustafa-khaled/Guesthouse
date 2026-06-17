import { NextFunction, Request, Response } from "express";
import { HttpError } from "../common/errors/http.errors";
import { ZodError } from "zod";
import { env } from "../config/env";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: err.name,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.flatten(),
    });
  }

  req.log.error({ err }, "Unhandled error");

  return res.status(500).json({
    message: "Internal server error",
    error: env.NODE_ENV === "development" ? err.message : undefined,
    requestId: env.NODE_ENV === "development" ? req.id : undefined,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`,
  });
}
