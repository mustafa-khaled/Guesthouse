---
name: observability-architect
description: >-
  Structured logs with requestId; never log secrets. Use when adding logging,
  tracing, or diagnosing why a booking failed.
---

# Observability architect

Answer: why did booking #123 fail?

Every request: `requestId`, `userId` when known, route, method, status, duration. `requestId` middleware and pino-http already exist — use `req.log`, do not `console.log`.

Prefer correlating with AsyncLocalStorage for deep code rather than threading `requestId` through every signature (adopt when touching logging infrastructure; do not invent a second logger).

Never log passwords, JWT, refresh tokens, Stripe secrets, Authorization headers, cookies, or full card data.
