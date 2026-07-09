---
name: guesthouse-frontend-architecture
description: >-
  Monolithic Next.js 15 App Router architecture for the Guesthouse frontend.
  Covers route groups, BFF proxy, React Query, auth cookies, and file placement.
  Use when adding routes, API calls, features, providers, middleware, or any
  frontend code in guesthouse-frontend.
---

# Guesthouse Frontend Architecture

Single deployable Next.js app. Guest, admin, and staff UIs live together — never split into micro-frontends or separate apps at current scale.

## Read order

1. This file — architecture rules (always)
2. `typeui-fundamentals` + `typeui-design-system` — before UI work
3. `serene-stays-hotel` — before guest/marketing pages
4. [reference.md](reference.md) — when adding queries, auth, or new domains

## Directory layout (actual — no `src/` prefix)

```
frontend/
├── app/
│   ├── (main)/          # Guest + account — navbar/footer layout
│   ├── (admin)/         # Admin portal — sidebar layout
│   ├── (staff)/         # Staff portal — sidebar layout
│   ├── auth/            # OAuth callback/error
│   └── api/             # BFF proxies only
├── features/            # Domain modules (canonical location)
│   ├── booking/         # queries.ts, mutations.ts
│   ├── properties/      # queries.ts
│   ├── admin/           # queries.ts, mutations.ts
│   ├── staff/           # queries.ts, mutations.ts
│   └── reviews/         # mutations.ts
├── components/
│   ├── ui/              # Matcha primitives only
│   ├── sections/        # Marketing landing sections only
│   └── shared/          # Cross-persona components
├── providers/           # AuthProvider, SocketProvider
├── hooks/               # Cross-feature hooks only
├── lib/api/             # client, server, proxy, upload, errors
├── queries/             # Re-exports from features/ (legacy shim)
├── mutations/           # Re-exports from features/ (legacy shim)
└── types/               # Re-exports from @guesthouse/shared
```

Path alias: `@/*` → `frontend/` root.

## Architecture rules (non-negotiable)

### 1. Stay monolithic

- One Next.js app, one build, one Docker image
- Do NOT create separate guest/admin/staff apps or micro-frontends
- Separate personas via **route groups**, not separate deployables

### 2. BFF proxy — never bypass

- Client components: `clientFetch()` from `@/lib/api/client` → `/api/*`
- Server components: `backendFetchApi()` from `@/lib/api/server` → `BACKEND_URL`
- Never call `BACKEND_URL` from browser code
- Never store tokens in localStorage — httpOnly cookies only

### 3. Route group placement

| Persona | Route group | URL prefix                          | Min role                              |
| ------- | ----------- | ----------------------------------- | ------------------------------------- |
| Guest   | `(main)`    | `/`, `/search`, `/book`, `/account` | authenticated for `/account`, `/book` |
| Admin   | `(admin)`   | `/admin/*`                          | `admin`                               |
| Staff   | `(staff)`   | `/staff/*`                          | `editor`                              |

New protected routes: add prefix to `protectedPrefixes` and `matcher` in `middleware.ts`.

### 4. Data layer — React Query only

- Reads: `queryOptions()` in `features/{domain}/queries.ts`
- Writes: `mutationOptions()` in `features/{domain}/mutations.ts`
- Pages consume via `useQuery(adminQueries.properties())` — no raw `fetch` in pages
- Query keys: `['domain', 'entity', ...params]` (e.g. `['admin', 'properties']`)

### 5. State management

- Server/async data → TanStack React Query (global `queryClient`)
- Auth session → `AuthProvider` context (`useAuth`)
- Real-time → `SocketProvider` invalidates query keys — do not duplicate state
- Local UI → `useState` in the page/component
- No Redux, Zustand, or global stores

### 6. Component placement

| What                       | Where                                                |
| -------------------------- | ---------------------------------------------------- |
| Design system primitive    | `components/ui/`                                     |
| Landing marketing section  | `components/sections/`                               |
| Cross-persona reusable     | `components/shared/`                                 |
| Domain-specific (new work) | `features/{domain}/components/`                      |
| Page file                  | `app/(group)/.../page.tsx` — thin, composes features |

### 7. Shared package usage

- Import types and RBAC from `@guesthouse/shared` via `@/types` or direct import
- Do NOT import Zod schemas or OpenAPI from shared into frontend (types + `hasMinimumRole` only)

### 8. Server vs client components

- Default: Server Component (no `'use client'`)
- Add `'use client'` only for: hooks, event handlers, React Query, browser APIs
- SSR data fetching: homepage + property detail pattern via `lib/api/server.ts`

## Adding a new feature (checklist)

```
- [ ] Pick route group: (main) | (admin) | (staff)
- [ ] Add thin page in app/(group)/.../page.tsx
- [ ] Create features/{domain}/ with components + queries + mutations
- [ ] Use clientFetch via queryOptions/mutationOptions
- [ ] Add middleware protection if route is authenticated
- [ ] Reuse components/ui/ primitives — read typeui skills first
- [ ] Types from @/types or @guesthouse/shared
```

## Do NOT

- Split into micro-frontends or multiple Next.js apps
- Call backend URL directly from client components
- Put business logic in `app/api/` routes (proxy only)
- Add global state libraries
- Hardcode colors outside Matcha tokens
- Create `src/` directory — project uses flat `app/` at frontend root
- Add new query/mutation files to top-level `queries/` or `mutations/` — use `features/`

## Commands

- `pnpm dev` — port 3001
- `pnpm build` / `pnpm typecheck` / `pnpm lint`
- `pnpm test` — Vitest unit tests
- `pnpm test:e2e` — Playwright

## Additional resources

- Query/mutation templates, auth flow, API map: [reference.md](reference.md)
