---
name: guesthouse-backend-architecture
description: >-
  Express + Mongoose backend architecture for the Guesthouse API. Covers module
  layout, wrapController, auth/RBAC, response envelopes, events, and testing.
  Use when adding routes, controllers, services, middleware, models, listeners,
  workers, or any backend code in guesthouse-backend.
---

# Guesthouse Backend Architecture

Express 4 + Mongoose 8 API. Feature modules under `backend/src/modules/`. Read this file before any structural backend change.

## Read order

1. This file — architecture rules (always)
2. `express-best-practices` — when adding routes, validation, DB queries, security, or tests
3. `code-refactorer` — when restructuring existing code without changing behavior
4. [reference.md](reference.md) — module scaffolds, test templates, middleware order

## Directory layout

```
backend/src/
├── app.ts              # Express assembly (middleware + route mounting)
├── server.ts           # Bootstrap: DB, Redis, workers, Socket.IO, graceful shutdown
├── config/             # env (Zod), db, cors
├── middleware/         # requireAuth, requiredRole, errorHandler, requestId, upload
├── common/             # errors, enums, utils, mongoose plugins, rate limits
├── modules/<feature>/  # Feature modules (primary pattern)
├── models/             # Mongoose models (shared across modules)
├── routes/             # Legacy cross-cutting: admin, user, docs
├── lib/                # logger, redis, cache, queue, events, stripe, transaction
├── listeners/          # Event bus subscribers (email, audit, socket)
├── workers/            # BullMQ background workers
├── openapi/            # Swagger via @guesthouse/shared
└── seeds/              # DB seeding
```

## Module structure (canonical)

Each feature module in `modules/{feature}/`:

| File                      | Role                                                            |
| ------------------------- | --------------------------------------------------------------- |
| `{feature}.routes.ts`     | Express `Router` — wires middleware → controller handlers       |
| `{feature}.controller.ts` | HTTP layer via `wrapController` — validation + response shaping |
| `{feature}.service.ts`    | Business logic, Mongoose queries, cross-service calls           |
| `{feature}.schema.ts`     | Zod schemas (`body` / `params` / `query` shape)                 |
| `index.ts`                | Barrel exports                                                  |

Services are **singleton class instances** (`export const bookingService = new BookingService()`). No DI container. Services call Mongoose models directly.

## Request flow

```
routes.ts → requireAuth / requireFrontDesk → wrapController(schema, handler) → service → Mongoose
```

### Mandatory: `wrapController` for new/edited handlers

Use `wrapController` from `common/utils/controller-wrapper.ts` — not manual try/catch.

```typescript
export const bookingController = {
  create: wrapController({ body: createBookingSchema.shape.body }, async ({ res, data, user }) => {
    const booking = await bookingService.create(data.body, user?.id);
    return created(res, booking, 'Booking created successfully');
  }),
};
```

Use `wrap()` (no schema) only when no body/params/query validation is needed.

### Response helpers

| Helper                         | Shape                                     |
| ------------------------------ | ----------------------------------------- |
| `created(res, data, message?)` | `201 { message, data }`                   |
| `ok(res, data, message?)`      | `200 { data }` or `200 { message, data }` |
| `okPaginated(res, result)`     | `200` paginated result object             |
| `okMessage(res, message)`      | `200 { message }`                         |
| `noContent(res)`               | `204` empty                               |

Throw `HttpError` from services for business errors — `wrapController` and `errorHandler` map them to status codes.

## Auth & RBAC

Middleware chain on protected routes:

1. `requireAuth` — JWT Bearer, DB user lookup, token version check
2. Role helper — `requireManager`, `requireFrontDesk`, `requireHousekeeping`, `requireStaff`, `requireGuest`

```typescript
router.get('/bookings', requireAuth, requireFrontDesk, bookingController.list);
```

`req.user` is set by `requireAuth` with `{ id, email, name, role, isEmailVerified }`.

## Route mounting

| Prefix             | Usage                                                              |
| ------------------ | ------------------------------------------------------------------ |
| `/api/v1/*`        | **New modules** — versioned API (booking, property, payment, etc.) |
| `/auth`            | Auth routes (legacy, non-versioned)                                |
| `/user`            | User profile routes (legacy)                                       |
| `/admin`           | Admin routes (legacy)                                              |
| `/api/v1/webhooks` | Stripe webhooks — raw body, mounted **before** `express.json()`    |
| `/health/*`        | Liveness, readiness, full health                                   |

Mount new feature routers in `app.ts` under `/api/v1`.

## Events vs direct calls

- **Services** own domain logic and persistence
- **Side effects** (email, audit log, socket broadcast) → emit via `lib/events.ts`

```typescript
import { emit, EventType } from "../../lib/events";

emit(EventType.BOOKING_CREATED, { bookingId, confirmationNumber, ... });
```

Listeners in `listeners/` subscribe at startup via `registerAllListeners()` in `server.ts`. Do not call email/socket code directly from services.

## Shared package

- Import Zod schemas from `@guesthouse/shared` when they exist
- Local `*.schema.ts` only for backend-specific validation (extra fields, internal filters)
- OpenAPI generation uses shared schemas — keep them in sync

## Validation schemas

Define schemas with `body` / `params` / `query` top-level keys:

```typescript
export const createBookingSchema = z.object({
  body: z.object({ propertyId: z.string().min(1), ... }),
});
```

Pass shapes to `wrapController`: `{ body: createBookingSchema.shape.body }`.

Do **not** use `validateRequest` middleware in routes — `wrapController` handles validation.

## Testing

- Runner: Vitest + Supertest
- Setup: `test/setup.ts` — MongoMemoryServer, collection cleanup after each test
- Integration tests: import `app` from `app.ts`, hit HTTP endpoints

See [reference.md](reference.md) for copy-paste module and test templates.

## Adding a new module (checklist)

```
- [ ] Create modules/{feature}/ with routes, controller, service, schema, index
- [ ] Use wrapController for all handlers
- [ ] Wire auth/RBAC middleware in routes.ts
- [ ] Mount router in app.ts under /api/v1
- [ ] Add Mongoose model in models/ if new entity
- [ ] Emit events for side effects; add listener if needed
- [ ] Add Supertest integration test
- [ ] Export from index.ts barrel
```

## Do NOT

- Add NestJS decorators or DI patterns — this is plain Express
- Use manual try/catch in controllers when `wrapController` applies
- Return inconsistent response shapes (`{ message }` vs `{ data }` vs `{ error }` ad hoc)
- Call Stripe/email/socket directly from services — use events or `lib/` clients
- Mount webhooks after `express.json()` — breaks Stripe signature verification
- Put business logic in `routes/` files — use services
- Skip validation on user input

## Commands

- `pnpm dev` — ts-node-dev on port from `env.PORT`
- `pnpm test` — Vitest
- `pnpm seed` — seed database
- `pnpm ensure-indexes` — sync Mongoose indexes after deploy

## Additional resources

- Module scaffolds, middleware order, test templates: [reference.md](reference.md)
- Operations runbook: `docs/OPERATIONS.md`
- Environment variables: `docs/ENVIRONMENT.md`
