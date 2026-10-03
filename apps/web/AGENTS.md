<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Serene Stays — Agent Guide

Next.js App Router in `apps/web` (`guesthouse-frontend`). Tailwind v4, TypeUI Matcha.

## Skills

Start with `nextjs-feature-builder` for new screens. Read `guesthouse-frontend-architecture` before structural work.

| Skill                              | Purpose                        |
| ---------------------------------- | ------------------------------ |
| `guesthouse-frontend-architecture` | Route groups, BFF, features/   |
| `react-state-architect`            | State ownership before codegen |
| `react-component-api`              | Intentional props              |
| `react-query`                      | queryOptions / mutationOptions |
| `data-contracts`                   | DTO vs UI model                |
| `component-refactor-auditor`       | Existing UI refactors only     |
| `frontend-testing-strategy`        | What to test                   |
| `typeui-fundamentals`              | A11y, spacing, typography      |
| `typeui-design-system`             | Matcha tokens                  |
| `serene-stays-hotel`               | Marketing / booking tone       |

Design system metadata: `.typeui-design-system.json` (slug: `matcha`)

## Layout (no `src/` prefix)

```
apps/web/
├── app/                 # (main) (admin) (staff), BFF api/
├── features/            # queries.ts, mutations.ts, components
├── components/ui|sections|shared
├── lib/api/             # client, server, proxy
├── providers/
└── types/               # re-exports from @guesthouse/shared
```

Path alias `@/*` → `apps/web/`.

## Commands

`pnpm dev` (port 3001), `build`, `lint`, `typecheck`, `test`, `test:e2e`.

## Non-negotiables

- Monolithic app — personas via route groups, not extra Next apps
- Client: `clientFetch()` only; never `BACKEND_URL` in the browser
- React Query in `features/{domain}/`
- Matcha tokens; 4px radius, 8px grid, 48px touch targets
- Server Components by default
