---
trigger: glob
globs: 'apps/api/**/*.ts'
description: Keep Express controllers thin; no workflows in HTTP handlers
---

# Thin controllers

Allowed: params/query/body extraction, DTO parse via `wrapController`, auth context, one application/service call, HTTP status, response helpers (`created`, `ok`, `okPaginated`).

Forbidden in controllers: Mongoose queries, Stripe, Cloudinary, BullMQ orchestration, business calculations, multi-step workflows, authorization policy invention.

Use `wrapController` from `common/utils/controller-wrapper.ts`. No per-handler try/catch.
