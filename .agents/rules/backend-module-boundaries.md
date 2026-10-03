---
trigger: glob
globs: 'apps/api/**/*.ts, apps/worker/**/*.ts'
description: Module-first Express layout; HTTP and Mongo are adapters
---

# Backend module boundaries

MODULE FIRST, LAYER SECOND.

Identify the business capability before creating files. Do not start with "another controller/service/model".

HTTP is not the application. MongoDB is not the application. Express and Mongoose are adapters around business rules.

## Existing modules

Match the current files: `{feature}.routes.ts`, `{feature}.controller.ts`, `{feature}.service.ts`, `{feature}.schema.ts` under `apps/api/src/modules/{feature}/`. Do not invent a parallel `application/` tree beside an existing service.

## New modules or new use cases

Prefer:

```
modules/{capability}/
  api/           # controller, routes, dto, mapper
  application/   # use cases independent of Express
  domain/        # types, errors, policies — no Express, no Mongoose
  infrastructure/# repositories, adapters
```

Controllers parse HTTP and call one use case. Domain must not import Express. Repositories hide Mongoose.

Live modules include `auth`, `booking`, `room`, `guest`, `payment`, `property`, `notification`, `staff` flows via existing folders. Do not split `availability/` until those rules actually leave `room`/`booking`.
