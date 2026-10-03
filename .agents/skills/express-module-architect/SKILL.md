---
name: express-module-architect
description: >-
  Design Express features as business modules (module first, layer second).
  Use when adding routes, controllers, services, modules, workers, listeners,
  or deciding where Guesthouse API code belongs.
---

# Express module architect

Design features as **business modules**. A module owns HTTP entry points, DTOs, use cases, domain rules, persistence access, and module-specific errors.

Never begin with "another controller/service/model file." Identify the capability first.

## Live layout (`apps/api/src`)

```
app.ts, server.ts, worker-main.ts
config/  middleware/  common/
modules/{feature}/   # routes, controller, service, schema, index
models/              # shared Mongoose models
lib/  listeners/  workers/  routes/  seeds/
```

`apps/worker` starts the same BullMQ processors — not a second domain.

## Compatibility

When **editing an existing module**, keep `{feature}.routes.ts`, `{feature}.controller.ts`, `{feature}.service.ts`, `{feature}.schema.ts`. Extract a use-case function inside the module rather than growing a fat service with Stripe+email+queue in one method.

When **creating a new module** (or a substantial new use case the user wants layered):

```
modules/{capability}/
  api/            # *.controller.ts, *.routes.ts, *.dto.ts, *.mapper.ts
  application/    # login-user.ts, create-booking.ts, …
  domain/         # types, errors, policy — no Express, avoid infra
  infrastructure/ # *.repository.ts, adapters
```

## Layer rules

| Layer       | Does                                                 | Must not                      |
| ----------- | ---------------------------------------------------- | ----------------------------- |
| Controller  | Parse HTTP, `wrapController`, one use case, map HTTP | Workflows, Mongoose, Stripe   |
| Application | Orchestrate domain + repos + ports                   | Import `req`/`res`            |
| Domain      | Invariants, policies                                 | Express, Mongoose, Stripe SDK |
| Repository  | Queries, hide Mongoose                               | Business workflows            |

The same application use case may be invoked from REST, BullMQ, Socket.IO, cron, or CLI.

## HTTP today

```
routes → requireAuth / role → wrapController → service/use-case → Mongoose
```

Use `wrapController` from `common/utils/controller-wrapper.ts`. Response helpers: `created`, `ok`, `okPaginated`, `okMessage`, `noContent`. Throw `HttpError`.

Mount new routers in `app.ts` under `/api/v1`. Webhooks: `/api/v1/webhooks` with `express.raw` **before** `express.json()`.

Side effects: `emit` via `lib/events.ts`; listeners in `listeners/`. Do not email/socket from services.

Existing modules: `auth`, `booking`, `room`, `roomType`, `guest`, `payment`, `property`, `notification`, `housekeeping`, `inventory`, `frontDesk`, and others already under `modules/`. Do not invent `availability/` until those rules leave `room`/`booking`.

Scaffolds and tests: [references/reference.md](references/reference.md).
