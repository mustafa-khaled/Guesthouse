# Deployment Guide

## Pre-deploy checklist

- [ ] All secrets stored in GitHub Environments (never committed)
- [ ] `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are unique per environment (≥ 32 chars)
- [ ] `MONGO_ROOT_PASSWORD` changed from any default
- [ ] `FRONTEND_URL` and `CORS_ORIGINS` match the public HTTPS URL
- [ ] `NEXT_PUBLIC_*` build args set for frontend Docker image
- [ ] Stripe webhook registered: `https://<domain>/api/v1/webhooks/stripe`
- [ ] Google OAuth redirect URI: `https://<domain>/auth/google/callback`
- [ ] Cloudinary API keys configured with `guesthouse/` folder prefix
- [ ] CI pipeline green on target commit
- [ ] Post-deploy smoke test passed

## Deployment options

This project ships portable Docker images via GitHub Container Registry (GHCR). Deploy to any host that runs Docker Compose.

### 1. Build and publish images (CI/CD)

On merge to `main`, CI runs tests and CD publishes:

- `ghcr.io/<org>/<repo>/guesthouse-backend:<sha>`
- `ghcr.io/<org>/<repo>/guesthouse-frontend:<sha>`

Configure GitHub repository variables for frontend build-time env:

| Variable                             | Example                   |
| ------------------------------------ | ------------------------- |
| `NEXT_PUBLIC_API_URL`                | `https://api.example.com` |
| `NEXT_PUBLIC_SOCKET_URL`             | `https://api.example.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...`             |

### 2. Server preparation

On your VPS/VM:

```bash
git clone <repo-url> guesthouse
cd guesthouse
cp .env.example .env
```

Fill `.env` with production values (see [ENVIRONMENT.md](ENVIRONMENT.md)).

Place TLS certificates in `infra/nginx/certs/` or terminate TLS at an external load balancer.

### 3. Start production stack

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
pnpm --filter backend ensure-indexes
bash scripts/smoke-test.sh https://your-domain.com
```

### 4. GitHub Actions deploy

Configure environment secrets:

| Secret           | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| `DEPLOY_HOST`    | Server hostname                                    |
| `DEPLOY_USER`    | SSH user                                           |
| `DEPLOY_SSH_KEY` | Private SSH key                                    |
| `DEPLOY_PATH`    | App directory on server                            |
| `DEPLOY_URL`     | Public URL for smoke tests                         |
| `GHCR_TOKEN`     | GitHub PAT with `read:packages` for pulling images |

### GHCR authentication on deploy server

Before the first deploy, authenticate the server to pull images:

```bash
echo "<GITHUB_PAT>" | docker login ghcr.io -u <github-username> --password-stdin
```

The Deploy workflow also logs in automatically using the `GHCR_TOKEN` secret.

### TLS certificates

Place certificates in `infra/nginx/certs/`:

- `fullchain.pem` — certificate chain
- `privkey.pem` — private key

Nginx redirects HTTP to HTTPS and sets HSTS. For local/staging without certs, use self-signed:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infra/nginx/certs/privkey.pem \
  -out infra/nginx/certs/fullchain.pem \
  -subj "/CN=localhost"
```

Trigger **Deploy** workflow manually and select `staging` or `production`.

## Stripe webhooks

1. Create webhook in Stripe Dashboard
2. Endpoint: `https://<domain>/api/v1/webhooks/stripe`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Google OAuth

Authorized redirect URI:

```
https://<api-domain>/auth/google/callback
```

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in backend env.

## Cloudinary

1. Create a Cloudinary account
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Uploads are stored under `guesthouse/{properties|room-types|guests|general}`
4. Optional: set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` for optimized Next.js images

## Rollback

```bash
export IMAGE_TAG=<previous-sha>
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
bash scripts/smoke-test.sh https://your-domain.com
```

The deploy workflow attempts automatic rollback using `.deploy/last-good-tag` on failure.
