---
trigger: glob
globs: 'apps/web/**/*.ts, apps/web/**/*.tsx'
description: No speculative memo; fix waterfalls and extra client JS first
---

# Frontend performance

Do not default to `useCallback`, `useMemo`, or `memo`. Add them when a profiler or a real list/column identity problem requires it.

Fix unnecessary `'use client'`, client waterfalls, and duplicated fetches (React Query cache) before wrapping functions.

Prefer Server Components for static marketing content.
