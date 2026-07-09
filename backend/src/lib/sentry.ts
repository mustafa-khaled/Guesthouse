import * as Sentry from '@sentry/node';
import { env } from '../config/env';
import { logger } from './logger';

let sentryInitialized = false;

export function initSentry(): void {
  if (!env.SENTRY_DSN || sentryInitialized) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
  sentryInitialized = true;
  logger.info('Sentry initialized');
}

export function captureException(error: unknown): void {
  if (!env.SENTRY_DSN || !sentryInitialized) return;
  Sentry.captureException(error);
}

export { Sentry };
