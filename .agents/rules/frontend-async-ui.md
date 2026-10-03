---
trigger: glob
globs: 'apps/web/**/*.ts, apps/web/**/*.tsx'
description: Loading, empty, error, mutation, and not-found states
---

# Async UI states

Every data surface needs loading, empty, error, and (for writes) mutation pending/failure. Authenticated resource pages need not-found.

Use React Query status — do not invent a parallel `isLoading` `useState` for the same request.

Do not add repo-wide `loading.tsx` / `error.tsx` unless the user asked; optional route-level files only for **new** routes that need them.
