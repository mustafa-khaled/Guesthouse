# Guesthouse — Agent Guide

Monorepo for a hotel booking and management platform. pnpm workspace with shared Zod schemas.

## Which guide to read

| Work area                          | Guide                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Backend API (Express, Mongoose)    | [backend/AGENTS.md](backend/AGENTS.md)                                                                             |
| Frontend (Next.js 15, React Query) | [frontend/AGENTS.md](frontend/AGENTS.md)                                                                           |
| Shared schema changes              | Read **both** backend and frontend guides — schemas in `packages/shared` affect validation and types on both sides |

## Stack overview

| Package            | Tech                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `backend/`         | Express 4, Mongoose 8, Zod, BullMQ, Socket.IO, Stripe                   |
| `frontend/`        | Next.js 15 App Router, TanStack React Query, Tailwind v4, TypeUI Matcha |
| `packages/shared/` | Zod schemas, OpenAPI, shared types and RBAC helpers                     |

## Root commands

- `pnpm dev` — start shared + backend + frontend concurrently
- `pnpm build` — build all packages
- `pnpm typecheck` — TypeScript check all packages
- `pnpm test` — run backend tests
- `pnpm seed` — seed database

## Skills location

Project skills live in `.agents/skills/`:

- `guesthouse-backend-architecture` — backend module layout and patterns
- `express-best-practices` — Express security, validation, DB, testing rules
- `guesthouse-frontend-architecture` — in `frontend/.agents/skills/`
- `typeui-fundamentals`, `typeui-design-system`, `serene-stays-hotel` — frontend UI
- `code-refactorer` — behavior-preserving refactors

## Docker

- Development: `docker-compose.yml`
- Production: `docker-compose.prod.yml`
- See `docs/DEPLOYMENT.md` for deploy steps
