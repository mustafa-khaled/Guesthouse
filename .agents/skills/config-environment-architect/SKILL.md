---
name: config-environment-architect
description: >-
  Validate environment with Zod at boot. Use when adding env vars, secrets, or
  config to apps/api.
---

# Config environment architect

`process.env` → validated config → application. Never read env in random files.

Schema lives in `apps/api/src/config/env.ts`. Add the field, production `superRefine` if required, and `apps/api/.env.example`.

Booleans: do not use `z.coerce.boolean()` (non-empty `"false"` becomes true). Use an explicit preprocess (see `RUN_WORKERS`).

Fail at startup. JWT secrets already require length ≥ 32.
