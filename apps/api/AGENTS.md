# Guesthouse API — Agent Guide

Express 4 + Mongoose 8. TypeScript, Zod, BullMQ, Socket.IO, Vitest. Package: `guesthouse-backend` in `apps/api`.

HTTP is not the application. MongoDB is not the application.

## Skills

Start with `express-feature-builder` for new capabilities. Read `express-module-architect` before structural work.

| Skill                            | When                                      |
| -------------------------------- | ----------------------------------------- |
| `express-module-architect`       | New modules, layering, where code belongs |
| `express-controller-discipline`  | Controllers                               |
| `dto-contract-architect`         | Zod / `@guesthouse/shared`                |
| `mongoose-data-architect`        | Schema design, embed vs ref               |
| `mongoose-query-performance`     | Queries, pagination, lean                 |
| `mongodb-index-architect`        | Indexes                                   |
| `booking-concurrency-architect`  | Overlap, races, idempotency               |
| `authorization-policy-architect` | Resource policies                         |
| `transaction-boundary-architect` | Multi-doc writes                          |
| `stripe-payment-architect`       | Payments, webhooks                        |
| `bullmq-job-architect`           | Queues, workers                           |
| `socketio-realtime-architect`    | Socket handlers                           |
| `external-service-boundary`      | Stripe/Cloudinary/email adapters          |
| `config-environment-architect`   | Env schema                                |
| `observability-architect`        | Logs, requestId                           |
| `production-readiness`           | Shutdown, health                          |
| `backend-testing-strategy`       | Tests                                     |
| `api-design`                     | HTTP API shape                            |
| `express-security`               | Auth routes, uploads, webhooks            |
| `express-error-architect`        | Error types                               |
| `code-refactorer`                | Behavior-preserving restructure only      |

Existing-module compatibility: keep `{feature}.routes.ts`, `{feature}.controller.ts`, `{feature}.service.ts`, `{feature}.schema.ts` until that module is explicitly refactored.

## Layout

```
apps/api/src/
├── app.ts, server.ts, worker-main.ts
├── config/             # Zod env, db, cors
├── middleware/
├── common/
├── modules/{feature}/  # live pattern: routes, controller, service, schema
├── models/
├── lib/                # events, redis, queue, stripe
├── listeners/
├── workers/            # BullMQ processors (also started from apps/worker)
├── routes/             # legacy admin, user, docs
└── seeds/
```

## Commands

From `apps/api` or via `pnpm --filter guesthouse-backend`: `dev`, `worker:dev`, `build`, `test`, `seed`, `ensure-indexes`.

## Non-negotiables

- `wrapController` for new/edited handlers
- No Mongoose/Stripe/BullMQ in controllers
- Throw `HttpError`; trust `errorHandler`
- Mount new routes under `/api/v1`
- Side effects via `lib/events.ts`
- Env only through `config/env.ts`
- `RUN_WORKERS=false` when `apps/worker` is the consumer

Docs: `docs/OPERATIONS.md`, `docs/ENVIRONMENT.md`, `docs/DEPLOYMENT.md`.
