# Guesthouse

Hotel booking and management platform built as a pnpm + Nx monorepo.

## Stack

| Layer          | Technology                                        |
| -------------- | ------------------------------------------------- |
| Frontend       | Next.js 15 (App Router), React 19, TanStack Query |
| Backend        | Express.js, Mongoose, Socket.io, BullMQ           |
| Database       | MongoDB 7                                         |
| Cache / Queues | Redis 7                                           |
| Media          | Cloudinary                                        |
| Payments       | Stripe                                            |
| Infra          | Docker Compose, Nginx, GitHub Actions             |

## Repository structure

```
apps/api/              Express API + Socket.IO
apps/web/              Next.js app (BFF auth proxy)
apps/worker/           BullMQ worker process (same modules as API)
packages/contracts/    Shared Zod transport contracts (`@guesthouse/shared`)
infra/nginx/           Production reverse proxy
scripts/               Operational scripts (smoke tests)
docs/                  Deployment and operations guides
```

`apps/worker` is process isolation, not a microservice.

## Quick start (local development)

### Prerequisites

- Node.js 20+
- pnpm 9+
- MongoDB 7
- Redis 7 (optional — falls back to in-memory rate limiting)

### Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp .env.example .env
```

Update secrets in `apps/api/.env` (JWT secrets must be at least 32 characters).

### Run

```bash
pnpm dev
```

Local `pnpm dev` runs workers inside the API process (`RUN_WORKERS=true` by default). Use `pnpm dev:worker` with `RUN_WORKERS=false` on the API when you want a separate worker process.

- Frontend: http://localhost:3001
- Backend API: http://localhost:5000
- API docs: http://localhost:5000/api/v1/docs

### Seed development data

```bash
pnpm seed
```

**Warning:** Seed creates default user accounts with known passwords. Never run seeds in production.

## Docker (full stack)

```bash
cp .env.example .env
# Set JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, MONGO_ROOT_PASSWORD

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

Compose runs the API with `RUN_WORKERS=false` and a separate `worker` service.

Production overlay with Nginx:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## CI/CD

| Workflow                       | Purpose                                               |
| ------------------------------ | ----------------------------------------------------- |
| `.github/workflows/ci.yml`     | Lint, typecheck, test, Docker build verify, E2E smoke |
| `.github/workflows/cd.yml`     | Push images to GHCR + Trivy scan                      |
| `.github/workflows/deploy.yml` | SSH deploy to staging/production                      |

Post-deploy smoke test:

```bash
bash scripts/smoke-test.sh https://your-domain.com
```

## Documentation

- [Deployment guide](docs/DEPLOYMENT.md)
- [Environment variables](docs/ENVIRONMENT.md)
- [Operations runbook](docs/OPERATIONS.md)

## Health endpoints

| Endpoint            | Use                       |
| ------------------- | ------------------------- |
| `GET /health/live`  | Liveness probe            |
| `GET /health/ready` | Readiness probe (MongoDB) |
| `GET /health`       | Full health status        |

## License

ISC
