---
name: express-best-practices
description: >-
  Express + Mongoose best practices for the Guesthouse API. Covers module layout,
  Zod validation, error handling, security middleware, Mongoose queries,
  transactions, and Supertest testing. Use when adding routes, middleware, DB
  queries, auth, rate limiting, or backend tests.
---

# Express Best Practices

Project-specific rules for the Guesthouse Express backend. Read the relevant rule file before making changes in that area.

## When to read which rule

| Task                      | Rule                                                                |
| ------------------------- | ------------------------------------------------------------------- |
| New feature module        | [arch-feature-modules](rules/arch-feature-modules.md)               |
| Request validation        | [api-validation-zod](rules/api-validation-zod.md)                   |
| Response shape            | [api-response-envelope](rules/api-response-envelope.md)             |
| Async errors in handlers  | [error-async-handling](rules/error-async-handling.md)               |
| Global error mapping      | [error-global-handler](rules/error-global-handler.md)               |
| Security middleware order | [security-middleware-chain](rules/security-middleware-chain.md)     |
| JWT auth                  | [security-auth-jwt](rules/security-auth-jwt.md)                     |
| Rate limiting             | [security-rate-limiting](rules/security-rate-limiting.md)           |
| Mongoose queries          | [db-mongoose-queries](rules/db-mongoose-queries.md)                 |
| N+1 prevention            | [db-avoid-n-plus-one](rules/db-avoid-n-plus-one.md)                 |
| Multi-doc writes          | [db-transactions](rules/db-transactions.md)                         |
| HTTP integration tests    | [test-supertest-integration](rules/test-supertest-integration.md)   |
| Mocking Stripe/email/etc. | [test-mock-external-services](rules/test-mock-external-services.md) |
| Graceful shutdown         | [devops-graceful-shutdown](rules/devops-graceful-shutdown.md)       |
| Environment config        | [devops-config-env](rules/devops-config-env.md)                     |

## Quick rules (always apply)

1. New handlers use `wrapController` — see `guesthouse-backend-architecture`
2. Business logic in services, not routes or controllers
3. Throw `HttpError` for expected failures; let `errorHandler` handle the rest
4. Emit events for side effects; do not call email/socket from services
5. Mount new routes under `/api/v1` in `app.ts`

## Architecture skill

For full module layout and scaffolds, read [guesthouse-backend-architecture](../guesthouse-backend-architecture/SKILL.md) first.
