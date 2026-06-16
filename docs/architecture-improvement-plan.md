# Natours — Architecture Improvement Plan

## Priority Tiers

| Tier | When | Rationale |
|------|------|-----------|
| **P0 — Foundation** | Now | Without these, the project is fragile in production |
| **P1 — Operational** | Next | Required for team productivity and operational confidence |
| **P2 — Architectural** | Soon | Improves maintainability, performance, and debuggability |
| **P3 — Polish** | Later | Nice-to-have enhancements |

---

## P0 — Foundation (Critical)

### 1. Add Testing Framework

**Problem**: Zero tests — no framework, no files, no scripts. Every refactor or feature addition risks regressions with no safety net.

**Plan**:
- Add `vitest` to `backend/package.json` (fast, TS-native, matches modern stack)
- Create `backend/vitest.config.ts`
- Add test scripts to `backend/package.json`:
  ```json
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
  ```
- Create test structure:
  ```
  backend/src/
  ├── modules/booking/__tests__/
  │   ├── booking.service.test.ts     # Unit: service logic with mocked models
  │   ├── booking.controller.test.ts  # Unit: request/response handling
  │   └── booking.routes.test.ts      # Integration: supertest + real/DB
  ├── middleware/__tests__/
  │   ├── requireAuth.test.ts
  │   └── errorHandler.test.ts
  ├── common/
  │   └── enums/__tests__/
  │       └── bookingStatus.enum.test.ts  # State machine transitions
  ```
- Coverage targets: 80%+ for services, 90%+ for enums/guards
- Add `supertest` + `mongodb-memory-server` for integration tests
- Add `@vitest/coverage-v8` for coverage reporting

**Files to create/modify**:
- `backend/package.json` — add deps + scripts
- `backend/vitest.config.ts` — new
- `backend/src/**/__tests__/*.test.ts` — new per module
- Root `package.json` — add `test` script to run all workspace tests

---

### 2. Add Structured Logging

**Problem**: `console.error` in `errorHandler.ts` and ad-hoc `console.log` throughout — no log levels, no structured output, no request correlation.

**Plan**:
- Add `pino` + `pino-http` to `backend/package.json`
- Create `backend/src/lib/logger.ts`:
  ```ts
  import pino from 'pino'
  export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
  })
  ```
- Add `pinoHttp` middleware in `app.ts` after CORS, before routes
- Replace `console.error` in `errorHandler.ts` with `req.log.error(err)`
- Add request ID via `pino-http` (auto-generates `req.id`)
- Add `LOG_LEVEL` to `.env` template

**Files to modify**:
- `backend/src/lib/logger.ts` — new
- `backend/src/app.ts` — add `pinoHttp()` middleware
- `backend/src/middleware/errorHandler.ts` — replace `console.error`
- `backend/.env` — add `LOG_LEVEL=info`
- `backend/package.json` — add deps

---

### 3. Add Security Middleware

**Problem**: Missing Helmet (security headers), request sanitization (XSS), mongo injection protection.

**Plan**:
- Add `helmet`, `express-mongo-sanitize` to `backend/package.json`
- In `app.ts`, add middleware in this order:
  ```ts
  import helmet from 'helmet'
  import mongoSanitize from 'express-mongo-sanitize'

  app.use(helmet())                          // Security headers
  app.use(mongoSanitize())                   // $ and . from req.body/params/query
  ```
- Add `hpp` (HTTP parameter pollution protection) for query params
- Enable CSP in Helmet config to allow frontend URL + Stripe

**Files to modify**:
- `backend/src/app.ts` — add middleware imports + usage
- `backend/package.json` — add deps

---

### 4. Add API Versioning

**Problem**: Routes mounted at `/api` with no version prefix. OpenAPI spec references `/api/v1/...` but actual routes are `/api/...`. Inconsistent.

**Plan**:
- Mount all module routers at `/api/v1` instead of `/api`:
  ```ts
  app.use('/api/v1', propertyRouter)
  app.use('/api/v1', bookingRouter)
  // ... all other modules
  ```
- Update frontend BFF proxy routes (`frontend/app/api/**/route.ts`) to point to `/api/v1/...`
- Update OpenAPI spec to match (it already uses `/api/v1/...` — verify alignment)
- Keep `/auth`, `/user`, `/admin` as-is (or move under `/api/v1/auth` for consistency)

**Files to modify**:
- `backend/src/app.ts` — all `app.use('/api', ...)` → `app.use('/api/v1', ...)`
- `frontend/lib/constants.ts` or `frontend/lib/api.ts` — update `BACKEND_URL` path
- Frontend API route handlers — update proxy paths

---

### 5. Add Environment Validation

**Problem**: Missing env vars cause runtime failures mid-request instead of failing fast at startup.

**Plan**:
- Create `backend/src/config/env.ts`:
  ```ts
  import { z } from 'zod'
  const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    // ... all required vars
  })
  export const env = envSchema.parse(process.env)
  ```
- Run validation at the top of `server.ts` before any other import
- Replace all `process.env.X` references across the backend with `env.X`

**Files to modify**:
- `backend/src/config/env.ts` — new
- `backend/src/server.ts` — validate before app startup
- All files using `process.env` — refactor to use `env` object
- `backend/.env` — add `LOG_LEVEL`, `REDIS_URL`, `STRIPE_WEBHOOK_SECRET` etc.

---

### 10. Add Graceful Shutdown

**Problem**: `SIGTERM`/`SIGINT` kills the process immediately, potentially dropping in-flight requests and corrupting connections.

**Plan**:
- Update `backend/src/server.ts`:
  ```ts
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...')
    server.close(async () => {
      await mongoose.disconnect()
      await redis.quit()
      await emailQueue.close()
      logger.info('All connections closed')
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000)
  })
  ```

**Files to modify**:
- `backend/src/server.ts` — add shutdown handlers

---

## P1 — Operational (Next)

### 6. Add Docker Setup

**Problem**: No containerization. Onboarding, CI, and production deployment require manual setup.

**Plan**:
- Create `backend/Dockerfile` (multi-stage, pnpm-based)
- Create `frontend/Dockerfile`
- Create `docker-compose.yml` at repo root with services:
  - `mongodb` (mongo:7)
  - `redis` (redis:7-alpine)
  - `backend` — depends on mongodb, redis
  - `frontend` — depends on backend
- Create `.dockerignore` files
- Update `backend/.env` to use service names for Docker context

**Files to create**:
- `docker-compose.yml` — new
- `backend/Dockerfile` — new
- `frontend/Dockerfile` — new

---

### 7. Add CI/CD Pipeline

**Problem**: No automated checks on push/PR. No deployment automation.

**Plan**:
- Create `.github/workflows/ci.yml` with 3 jobs:
  1. **shared** — build + typecheck `@guesthouse/shared`
  2. **backend** — typecheck + test + build (needs shared)
  3. **frontend** — typecheck + lint + build (needs shared)
- Use `pnpm/action-setup` + `actions/setup-node` v4 with caching

**Files to create**:
- `.github/workflows/ci.yml` — new

---

### 8. Add Redis Caching

**Problem**: Every API request hits MongoDB directly. Frequently accessed data has no cache.

**Plan**:
- Add `ioredis` to `backend/package.json`
- Create `backend/src/lib/redis.ts` — Redis client
- Create `backend/src/lib/cache.ts` — `getOrSet(key, fetcher, ttl)` + `invalidate(pattern)`
- Cache targets with TTLs:
  - Property lookups: 5 min
  - Rate plans by room type: 10 min
  - Price rules: 10 min
  - Inventory availability search: 2 min
  - Room types list: 5 min
- Invalidate cache on writes
- Add `REDIS_URL` to `.env`

**Files to create/modify**:
- `backend/src/lib/redis.ts` — new
- `backend/src/lib/cache.ts` — new
- `backend/package.json` — add deps
- `backend/src/modules/property/property.service.ts` — add caching
- `backend/src/modules/ratePlan/ratePlan.service.ts` — add caching
- `backend/src/modules/inventory/inventory.service.ts` — add caching

---

### 9. Add Job Queue for Async Tasks

**Problem**: Email sending happens synchronously. No retry, delay, or failure handling.

**Plan**:
- Add `bullmq` to `backend/package.json` (requires Redis)
- Create `backend/src/lib/queue.ts` — email + notification queues
- Create `backend/src/workers/email.worker.ts` — process email jobs with retries
- Refactor `auth.service.ts` and `notification.service.ts` from direct email calls to queue-based
- Add Stripe webhook processing as a queue job

**Files to create/modify**:
- `backend/src/lib/queue.ts` — new
- `backend/src/workers/email.worker.ts` — new
- `backend/src/server.ts` — start workers after DB connection
- `backend/package.json` — add deps
- `backend/src/lib/email.ts` — refactor to queue-based sending

---

### 21. Add Webhook Signing Verification

**Problem**: Stripe webhooks are unverified — any POST to the webhook endpoint could be spoofed.

**Plan**:
- Add `STRIPE_WEBHOOK_SECRET` to `.env`
- Verify signature: `stripe.webhooks.constructEvent(body, signature, webhookSecret)`
- Ensure raw body is available (skip `express.json()` for webhook route)

**Files to modify**:
- `backend/.env` — add `STRIPE_WEBHOOK_SECRET`
- `backend/src/modules/payment/payment.service.ts` — add verification

---

## P2 — Architectural (Soon)

### 11. Refactor Controller Boilerplate

**Problem**: Every controller method repeats try/catch + `safeParse` + `HttpError instanceof` (~15 lines per endpoint, ~1500 lines total).

**Plan**:
- Create `backend/src/common/utils/controller-wrapper.ts`:
  ```ts
  function wrapController<T extends SchemaMap, R>(
    schemas: T,
    handler: (parsed: Parsed<T>, req: Request, res: Response) => Promise<R>
  ): RequestHandler
  ```
- Handles validation + HttpError catch + next(error)
- Refactor all 18 controllers (~100 endpoints) → ~3 lines each

**Files to create/modify**:
- `backend/src/common/utils/controller-wrapper.ts` — new
- All `*.controller.ts` files (18 modules) — refactor

---

### 12. Add Event System for Cross-Module Communication

**Problem**: Cross-module concerns are tightly coupled (booking → email, booking → inventory, booking → guest stats).

**Plan**:
- Add `eventemitter2` to `backend/package.json`
- Create `backend/src/lib/events.ts` — typed event bus:
  ```
  booking:created → email confirmation + inventory update
  booking:confirmed → SMS/email notification
  booking:cancelled → refund + release inventory
  booking:checked-out → guest stats + housekeeping task
  payment:received → folio update + receipt
  ```
- `bookingService` emits events instead of importing services directly

**Files to create/modify**:
- `backend/src/lib/events.ts` — new
- `backend/src/listeners/` — new directory for decoupled handlers
- `backend/src/server.ts` — register listeners at startup

---

### 13. Add Deep Health Checks

**Problem**: Current `/health` only returns a timestamp. No DB/Redis/service connectivity check.

**Plan**:
- `GET /health` — basic uptime + timestamp
- `GET /health/ready` — checks MongoDB + Redis connectivity, returns 200/503
- `GET /health/live` — simple liveness probe

**Files to modify**:
- `backend/src/app.ts` — replace inline `/health`

---

### 14. Add Audit Log

**Problem**: The `audit` Mongoose plugin exists but there's no queryable audit trail.

**Plan**:
- Create `backend/src/models/auditLog.model.ts` — TTL index (90 days)
- Create `backend/src/lib/audit.ts` — `audit(action, resource, resourceId, req)`
- Call in key service methods (auth, booking, payment, user management)
- Expose `GET /api/v1/admin/audit-logs` (admin only)

**Files to create/modify**:
- `backend/src/models/auditLog.model.ts` — new
- `backend/src/lib/audit.ts` — new

---

## P3 — Polish (Later)

### 15. Add WebSockets for Real-Time Features

**Problem**: Front desk, housekeeping, and dashboard need real-time updates but only support polling.

**Plan**:
- Add `socket.io` (backend) + `socket.io-client` (frontend)
- Auth via JWT on connection handshake
- Namespaces: `front-desk`, `housekeeping`, `manager`
- Emit events from the event system
- Frontend `useSocket` hook with auto-reconnect

**Files to create/modify**:
- `backend/src/lib/socket.ts` — new
- `backend/src/server.ts` — init socket
- `frontend/hooks/useSocket.ts` — new
- `frontend/package.json` + `backend/package.json`

---

### 16. Update OpenAPI Spec to Match Current API

**Problem**: OpenAPI spec is based on the old Natours `tour` schema. The actual API is a hotel/guesthouse system with 120+ endpoints across 18 modules. The spec is **stale and misleading**.

**Plan**:
- **Step 1 — Rewrite schemas**: Replace `tourSchema` with current domain schemas:
  - Remove old `tourSchema`, `reviewSchema` (old format)
  - Add: `propertySchema`, `roomTypeSchema`, `roomSchema`, `ratePlanSchema`, `priceRuleSchema`, `inventorySchema`, `guestSchema`, `bookingSchema` (full), `addOnSchema`, `promotionSchema`, `paymentSchema`, `folioSchema`, `housekeepingTaskSchema`, `reviewSchema` (new), `userSchema`
  - Create shared Zod schemas in `packages/shared/src/schemas/` mirroring backend schemas
- **Step 2 — Document all endpoints**: Register paths for all 18 modules:
  - Properties: CRUD + stats
  - Room Types, Rooms, Rate Plans, Price Rules
  - Inventory: search, hold, bulk-update, initialize
  - Guests: CRUD, link-user, guest-profile
  - Bookings: full lifecycle (create, update, cancel, confirm, check-in, check-out, assign-room)
  - Add-Ons, Promotions, Payments, Folio
  - Housekeeping: tasks, dashboard, assign, verify
  - Front Desk: arrivals, departures, in-house, room-rack, walk-in
  - Reviews, Reports, Dashboard, Notifications
  - Auth: register, login, logout, refresh, verify-email, OAuth, password reset
- **Step 3 — Add security scheme**: Register JWT Bearer auth component
- **Step 4 — Serve spec**: Add `swagger-ui-express` at `GET /api/v1/docs`
- **Step 5 — Automate**: Ensure `pnpm build:shared` always generates the latest spec

**Files to create/modify**:
- `packages/shared/src/openapi/index.ts` — complete rewrite
- `packages/shared/src/schemas/` — add new schemas (property, room, payment, guest, etc.)
- `backend/src/routes/docs.routes.ts` — new (Swagger UI)
- `backend/src/app.ts` — mount docs route
- `backend/package.json` — add `swagger-ui-express`

---

### 17. Add Rate Limiting to Public Endpoints

**Problem**: Rate limiting only covers auth endpoints. Public listing/search endpoints are unprotected.

**Plan**:
- Apply existing `rateLimiter` (100/15min) globally to `/api/v1`
- Create stricter limiters:
  - Auth: 5/15min (already exists)
  - Public search/availability: 30/1min
  - Review creation: 10/1min per user

**Files to modify**:
- `backend/src/app.ts` — add global rate limiter

---

### 18. Add Data Seeding Scripts

**Problem**: Empty dev database on setup — no demo data.

**Plan**:
- Create `backend/src/seed/seed.ts` — main orchestrator (idempotent)
- Sample data: properties, room types, rooms, users (admin/manager/front-desk/guest), bookings (varied statuses)
- Add `"seed": "ts-node-dev src/seed/seed.ts"` to `backend/package.json`

**Files to create**:
- `backend/src/seed/seed.ts` — new
- `backend/src/seed/data/*.ts` — new

---

### 19. Add Full-Text Search

**Problem**: Guests, bookings, properties lack search capability.

**Plan**:
- Add MongoDB text indexes on Guest (firstName, lastName, email, phone), Booking (confirmationNumber), Property (name, slug)
- Add `search` query param to list endpoints

**Files to modify**:
- `backend/src/models/guest.model.ts` — add text index
- `backend/src/modules/guest/guest.service.ts` — add search filter

---

### 20. Add Data Export for Reports

**Problem**: Report endpoints return JSON but can't export to CSV.

**Plan**:
- Add `json2csv` to `backend/package.json`
- Add `?format=csv` query param to report endpoints
- Set correct Content-Type + Content-Disposition headers

**Files to modify**:
- `backend/src/lib/export.ts` — new
- `backend/src/modules/reports/reports.controller.ts` — handle `format=csv`

---

### 22. Add Compression Middleware

**Problem**: JSON responses are not compressed.

**Plan**:
- Add `compression` to `backend/package.json`
- `app.use(compression())` in `app.ts`

**Files to modify**:
- `backend/src/app.ts` — add compression
- `backend/package.json` — add dep

---

### 23. Add Request ID Tracing

**Problem**: No correlation between logs from the same request across middleware/services.

**Plan**:
- `pino-http` auto-generates `req.id` (covered in P0-2)
- Include `req.id` in error responses in development

**Files to modify**:
- `backend/src/middleware/errorHandler.ts` — include requestId in response

---

## Execution Roadmap

```
Sprint 1 (P0 Foundation):    1, 2, 3, 4, 5, 10     Tests + Logging + Security + Versioning + Env + Shutdown
Sprint 2 (P1 Operational):   6, 7, 8, 9, 21         Docker + CI + Cache + Queue + Webhook Verify
Sprint 3 (P2 Architecture):  11, 12, 13, 14         Controller refactor + Events + Health + Audit
Sprint 4 (P3 Features):      15, 16, 17, 18         WebSockets + OpenAPI update + Rate Limiting + Seed
Sprint 5 (P3 Polish):        19, 20, 22, 23         Search + Export + Compression + Request ID
```

Each sprint is independent and can be reordered. Sprint 1 is the highest priority — without tests, logging, and security middleware, the project is fragile in production.
