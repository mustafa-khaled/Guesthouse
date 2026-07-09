# Guesthouse Backend — Agent Guide

Express 4 + Mongoose 8 API for hotel booking and management. TypeScript, Zod validation, BullMQ workers, Socket.IO, Vitest.

## Skills (read before any work)

| Skill                    | Path                                                      | Purpose                                              |
| ------------------------ | --------------------------------------------------------- | ---------------------------------------------------- |
| **Backend Architecture** | `.agents/skills/guesthouse-backend-architecture/SKILL.md` | Module layout, wrapController, auth, events, testing |
| Express Best Practices   | `.agents/skills/express-best-practices/SKILL.md`          | Rules for validation, errors, security, DB, tests    |
| Code Refactorer          | `.agents/skills/code-refactorer/SKILL.md`                 | Behavior-preserving structural refactors             |

**Read `guesthouse-backend-architecture` before any structural change** (routes, controllers, services, middleware, models).

Read relevant `express-best-practices` rules when working in that area (see the index table in that skill).

Use `code-refactorer` when asked to refactor, decouple, or reorganize existing code — not for new features.

## Project structure

```
backend/src/
├── app.ts              → Express assembly
├── server.ts           → Bootstrap + graceful shutdown
├── modules/{feature}/  → routes, controller, service, schema, index
├── models/             → Mongoose models
├── middleware/         → requireAuth, requiredRole, errorHandler
├── lib/                → events, redis, queue, stripe, transaction
├── listeners/          → Event bus subscribers
├── workers/            → BullMQ background jobs
├── routes/             → Legacy admin, user, docs
└── config/             → env (Zod), db, cors
```

## Commands

- `pnpm dev` — start dev server (ts-node-dev)
- `pnpm build` — compile TypeScript
- `pnpm test` — Vitest unit + integration tests
- `pnpm test:watch` — Vitest watch mode
- `pnpm seed` — seed database
- `pnpm ensure-indexes` — sync Mongoose indexes after deploy

## Non-negotiables

- New handlers use `wrapController` from `common/utils/controller-wrapper.ts`
- Business logic in services — not routes or controllers
- Throw `HttpError` for expected failures; use `next(error)` in legacy handlers
- Mount new routes under `/api/v1` in `app.ts`
- Emit events via `lib/events.ts` for side effects (email, audit, sockets)
- Validate all input with Zod — never trust `req.body` directly
- Use response helpers: `created`, `ok`, `okPaginated` — consistent `{ message, data }` envelope

## Human documentation

- Operations runbook: `docs/OPERATIONS.md`
- Environment variables: `docs/ENVIRONMENT.md`
- Deployment: `docs/DEPLOYMENT.md`
