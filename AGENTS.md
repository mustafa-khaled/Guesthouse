# Guesthouse — Agent Guide

pnpm + Nx modular monolith for hotel booking. HTTP and MongoDB are adapters around business rules.

## Layout

| Path                  | Package               | Role                                              |
| --------------------- | --------------------- | ------------------------------------------------- |
| `apps/api/`           | `guesthouse-backend`  | Express API + Socket.IO                           |
| `apps/web/`           | `guesthouse-frontend` | Next.js 15 (guest, admin, staff)                  |
| `apps/worker/`        | `guesthouse-worker`   | BullMQ process (same modules, not a microservice) |
| `packages/contracts/` | `@guesthouse/shared`  | Zod transport contracts + OpenAPI                 |

## Which guide

| Work             | Guide                                                     |
| ---------------- | --------------------------------------------------------- |
| API / workers    | [apps/api/AGENTS.md](apps/api/AGENTS.md)                  |
| Web              | [apps/web/AGENTS.md](apps/web/AGENTS.md)                  |
| Shared contracts | Both guides — changes in `packages/contracts` affect both |

## Rules vs skills

- Always-on / glob rules: `.agents/rules/*.md` (Cursor pointers in `.cursor/rules/`)
- Load a skill when the task matches its `description`. Do not preload every skill.

**Orchestrators:** `express-feature-builder` (API), `nextjs-feature-builder` (web).

**Vendored design skills:** `unslop` (heydamir/unslop, CC BY 4.0) and `ui-ux-pro-max` (nextlevelbuilder/ui-ux-pro-max-skill, MIT) are third-party, copied verbatim into `.agents/skills/`. Project skills stay authoritative: `typeui-design-system` owns Matcha tokens and `serene-stays-hotel` owns brand voice, so use the vendored skills for audits, craft checklists, and reference searching — never to replace or contradict the project design system. `ui-ux-pro-max` needs `python3` for its search script.

When editing an existing API module, match `routes` / `controller` / `service` / `schema`. Do not add a parallel layered tree beside that service unless asked to refactor the module.

## Commands

- `pnpm dev` — contracts + API + web (`RUN_WORKERS=true` in-process)
- `pnpm dev:worker` — separate worker (`RUN_WORKERS=false` on the API)
- `pnpm build` / `pnpm typecheck` — pnpm filters (Nx aliases: `pnpm nx:build`, `pnpm nx:typecheck`)
- `pnpm test` — API tests
- `pnpm seed` — seed MongoDB

## Docker

- Dev: `docker-compose.yml` (API `RUN_WORKERS=false` + `worker` service)
- Prod overlay: `docker-compose.prod.yml`
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
