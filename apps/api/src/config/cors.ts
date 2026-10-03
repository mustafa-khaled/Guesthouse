import { env } from './env';

export function parseCorsOrigins(
  corsOrigins?: string,
  frontendUrl: string = env.FRONTEND_URL,
): string[] {
  const fromList = corsOrigins
    ? corsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  const origins = fromList.length > 0 ? fromList : [frontendUrl];
  return [...new Set(origins)];
}

export function getCorsOrigins(): string[] {
  return parseCorsOrigins(env.CORS_ORIGINS, env.FRONTEND_URL);
}
