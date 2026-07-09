# Guesthouse

Hotel booking and management platform built as a pnpm monorepo.

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
backend/           Express API
frontend/          Next.js app (BFF auth proxy)
packages/shared/   Shared Zod schemas and types
infra/nginx/       Production reverse proxy
scripts/           Operational scripts (smoke tests)
docs/              Deployment and operations guides
```

## Quick start (local development)

### Prerequisites

- Node.js 20+
- pnpm 9+
- MongoDB 7
- Redis 7 (optional — falls back to in-memory rate limiting)

### Setup

```bash
pnpm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp .env.example .env
```

Update secrets in `backend/.env` (JWT secrets must be at least 32 characters).

### Run

```bash
pnpm dev
```

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
