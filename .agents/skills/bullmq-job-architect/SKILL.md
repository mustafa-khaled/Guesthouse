---
name: bullmq-job-architect
description: >-
  Design idempotent BullMQ jobs for email, reminders, cleanup, and scheduled
  booking work. Use when adding queues, workers, or delayed jobs.
---

# BullMQ job architect

Use queues for confirmation email, reminders, Cloudinary cleanup, invoices, notifications, slow integrations, scheduled booking tasks.

- Jobs must be **idempotent** and small.
- Exponential backoff on retryable failures. Do not retry permanent business errors.
- Explicit job names. Retention for completed/failed jobs.
- Stable business IDs in payloads. Do not stuff huge objects into Redis.

`apps/worker` runs the same processors as `apps/api/src/workers`. Set `RUN_WORKERS=false` on the API when the worker process is up.

Production Redis for queues should use `maxmemory-policy=noeviction`. Current compose uses `allkeys-lru` — do not silently change it here; call it out if you touch Redis config.

Multiple workers are for concurrency/HA, not new services.
