---
trigger: glob
globs: 'apps/api/**/*.ts, apps/worker/**/*.ts'
description: Read env only through validated config; fail at startup
---

# Config validation

Never read `process.env.X` in random files.

Use `apps/api/src/config/env.ts` (Zod). Add new variables to the schema **and** `apps/api/.env.example`.

Fail during startup, not after traffic arrives. Production-required secrets belong in the schema `superRefine`.
