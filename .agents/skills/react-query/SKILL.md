---
name: react-query
description: >-
  Guesthouse TanStack Query pattern: queryOptions/mutationOptions in
  features/{domain}. Use when writing useQuery, useMutation, keys, or invalidation.
---

# React Query

Canonical location: `apps/web/features/{domain}/queries.ts` and `mutations.ts`.

Pages/screens call `useQuery(adminQueries.properties())` — not raw `fetch`.

```ts
export const adminQueries = {
  properties: () =>
    queryOptions({
      queryKey: ['admin', 'properties'] as const,
      queryFn: () => clientFetch<Property[]>('/api/admin/properties'),
    }),
};
```

Keys include every variable that changes the result.

Prefer renaming hook results to domain nouns (`properties`, `isCreating`) so screens do not leak `data` / `mutate`.

After mutations, invalidate the matching keys. Socket events already invalidate some keys via `SocketProvider` — do not duplicate that cache in `useState`.

`clientFetch` from `@/lib/api/client` only. See `data-contracts` when API JSON differs from UI models.
