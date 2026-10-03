---
name: production-readiness
description: >-
  Graceful shutdown, health probes, timeouts, and process hygiene. Use when
  changing server bootstrap, Docker, workers, or /health endpoints.
---

# Production readiness

Check: SIGTERM/SIGINT, Mongo/Redis/BullMQ/HTTP shutdown, keep-alive, trust proxy, timeouts, body limits, structured logs, uncaught error policy.

Health (keep this split):

- `/health/live` — process alive (do not depend on every upstream)
- `/health/ready` — can accept traffic (Mongo)
- `/health` — fuller status

`server.ts` already shuts down HTTP, sockets, workers (if started), queues, Redis, Mongo. `worker-main.ts` shuts down workers only.

Container: non-root user in Dockerfiles. Do not run liveness against Stripe or SMTP.
