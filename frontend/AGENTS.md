<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Serene Stays — Agent Guide

Premium hotel booking site built with **Next.js App Router**, **Tailwind CSS v4**, and **TypeUI Matcha**.

## Skills (read before any work)

| Skill                     | Path                                                                | Purpose                                              |
| ------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| **Frontend Architecture** | `frontend/.agents/skills/guesthouse-frontend-architecture/SKILL.md` | Monolithic structure, BFF, React Query, route groups |
| TypeUI Fundamentals       | `.agents/skills/typeui-fundamentals/`                               | Accessibility, spacing, typography, UX guardrails    |
| Matcha Design System      | `.agents/skills/typeui-design-system/SKILL.md`                      | Colors, tokens, components                           |
| Serene Stays Hotel        | `.agents/skills/serene-stays-hotel/SKILL.md`                        | Page structure, copy tone, booking patterns          |

Design system metadata: `.typeui-design-system.json` (slug: `matcha`)

**Read `guesthouse-frontend-architecture` before any structural change** (routes, API, providers, middleware, features).

## Project structure

```
app/                    → routes, layout, globals.css (no src/ prefix)
features/               → domain modules: queries, mutations, components
components/ui/          → Matcha primitives (Button, Card, Container, Section)
components/sections/  → landing page sections
components/shared/      → cross-persona reusable components
lib/api/                → client, server, proxy (BFF layer)
providers/              → AuthProvider, SocketProvider
queries/ + mutations/   → legacy re-exports from features/ (do not add new files here)
```

## Commands

- `pnpm dev` — start dev server (port 3001)
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript check
- `pnpm test` — Vitest unit tests
- `pnpm test:e2e` — Playwright

## UI rules

- Use Matcha CSS tokens from `globals.css` — do not hardcode colors elsewhere
- Noto Serif for headings, Noto Sans for body
- 4px radius, 8px spacing grid, 48px min touch targets
- Server components by default; client only for interactivity

## Architecture rules

- **Monolithic** — one Next.js app for guest, admin, and staff (never split into micro-frontends)
- **BFF proxy** — client code calls `/api/*` via `clientFetch()`, never `BACKEND_URL` directly
- **React Query** — all async data via `queryOptions`/`mutationOptions` in `features/{domain}/`
- **Route groups** — `(main)` guest, `(admin)` admin, `(staff)` staff
