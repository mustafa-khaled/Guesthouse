---
trigger: glob
globs: 'apps/web/**/*.ts, apps/web/**/*.tsx'
description: Feature modules own queries; pages stay thin; no new top-level queries/
---

# Feature boundaries

- Domain data lives in `apps/web/features/{domain}/` (`queries.ts`, `mutations.ts`, optional `components/`).
- Pages in `app/(main|admin|staff)/` stay thin.
- Cross-feature imports go through that feature's public files — do not reach into another feature's internals.
- Do not add new files under top-level `queries/` or `mutations/` (legacy re-exports only).
- Shared UI: `components/ui` (Matcha), `components/sections` (marketing), `components/shared` (cross-persona).
