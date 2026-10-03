---
name: react-state-architect
description: >-
  Design React state before generating Guesthouse UI. Use when creating
  components, forms, filters, booking flows, or interactive admin/staff screens.
---

# React State Architect

Design the state model before writing code. Choose the smallest mechanism that matches ownership.

1. List values that look stateful.
2. Drop anything derived from props, query data, form values, or URL params.
3. Classify: remote, form, URL, local UI, coordinated local, shared client.
4. Pick the mechanism below. Then implement.

### Remote → TanStack Query

`useQuery` / `useMutation` via `features/{domain}/queries.ts` and `mutations.ts`. Do not copy query `data` into `useState`. Do not invent parallel `isLoading` state.

Editable drafts: React Hook Form initialized from query data, not `useEffect` sync.

### Forms → React Hook Form + Zod

When there is validation, submit, or multi-field lifecycle. `zodResolver`. No `useState` per input.

### URL → search params

Filters, sort, pagination, shareable tabs. Do not dual-store URL in `useState`.

### Local UI → useState

`isOpen`, `isExpanded`, ephemeral hover. Independent hooks are fine.

### Coordinated local → useReducer

Named transitions; prefer `status: 'idle' | 'loading' | 'success' | 'error'` over contradictory booleans.

### Shared client → existing providers

`AuthProvider`, `SocketProvider`. Do not add Zustand/Redux. Context only for genuine subtree UI state — not for server data.

### Derived → calculate in render

Filtered lists, labels, totals.

Colocate state with the consumer. Pages stay Server Components; `'use client'` on the interactive subtree.

Do not automatically refactor existing components; use `component-refactor-auditor` when asked.
