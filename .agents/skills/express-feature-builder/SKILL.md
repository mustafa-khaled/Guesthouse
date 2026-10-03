---
name: express-feature-builder
description: >-
  Orchestrate implementing an Express API capability for Guesthouse. Use when
  the user asks to implement, add, or scaffold a backend feature, endpoint,
  module, or use case (availability, booking, payments, staff, etc.).
---

# Express feature builder

Follow this order. Read the named skill when that step applies. Do not inline those documents here.

1. **Module** — `express-module-architect`. Identify bounded context. Existing module → match its files. New module → layered folders.
2. **API contract** — `api-design` + `dto-contract-architect`.
3. **DTO validation** — Zod at the HTTP boundary (`wrapController`).
4. **Authorization** — `authorization-policy-architect` + `express-security`.
5. **Use case** — application function independent of Express.
6. **Domain invariants** — domain types/policies; no `req`/`res`.
7. **Concurrency** — `booking-concurrency-architect` when inventory/dates/payments race.
8. **Queries** — `mongoose-query-performance`.
9. **Indexes** — `mongodb-index-architect` from real query shapes.
10. **Controller** — `express-controller-discipline`.
11. **Errors** — `express-error-architect`.
12. **Logs/metrics** — `observability-architect`.
13. **Security** — `express-security`, mass-assignment rule.
14. **Tests** — `backend-testing-strategy`.
15. **Performance** — query/index skills again.

Typed quality, no mass assignment, and secret-free logs always apply.

If the user asked to refactor existing code without changing behavior, stop and use `code-refactorer`.
