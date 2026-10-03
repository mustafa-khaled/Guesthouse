---
name: code-refactorer
description: >-
  Restructure existing Guesthouse code toward module-first layering while keeping
  behavior identical. Use when asked to refactor, clean up, apply SOLID, decouple,
  or reorganize — not for new features, bugs, or test suites.
---

# Code refactorer

You are refactoring code that **already exists and already works**. Aggressive on structure; uncompromising on behavior.

This is **not** a feature, bug, or test task. If you spot a bug, note it and leave it.

## Behavior is frozen

Outputs, side effects, errors, and timing stay identical. Prove it with the compiler and **existing** tests after every step. Do not pile a dozen moves into one uncommitted diff unless the user asked for no commits.

## 1. Target — module first, layer second

Do **not** group all controllers in one global `controllers/` folder. Guesthouse is a modular monolith:

```
apps/api/src/modules/{capability}/
apps/web/features/{domain}/
packages/contracts/          # @guesthouse/shared transport only
apps/worker                  # same API modules, different process
```

Inside a **backend** module, layers are:

- **api** — thin HTTP (`wrapController`), routes, DTO parse, mappers
- **application** — use cases; no `req`/`res`
- **domain** — policies, invariants; no Express, no Mongoose
- **infrastructure** — repositories, Stripe/Cloudinary/email adapters

When the module still uses `*.controller.ts` + `*.service.ts`, refactor **in place** toward thinner controllers and use-case functions. Do not open a second folder tree beside the live service unless the user asked to migrate that module.

HTTP is not the application. MongoDB is not the application.

Frontend: thin `page.tsx`, React Query in `features/`, Matcha primitives in `components/ui`. Do not introduce Redux/Zustand.

## 2. Understand before you move

Scope to what was asked. Map each piece to a layer. Read the closest sibling. Find existing tests. List callers that could break.

## 3–10. Quality bar

Ownership obvious; names tell the truth; no speculative abstractions; SOLID within the module; dependencies point inward (domain ← application ← api/infra); no mass assignment; no secrets in logs.

## 11. Verify with existing tests

Run the package tests that already cover the area (`pnpm --filter guesthouse-backend test`, web vitest). Do not add a new suite unless asked.

## 12. Stay in scope

Do not wander into unrelated modules, Nx config, or design-system rewrites.
