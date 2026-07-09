# Environment Variables

## Backend (required)

| Variable             | Required | Default | Description                               |
| -------------------- | -------- | ------- | ----------------------------------------- |
| `MONGODB_URI`        | Yes      | —       | MongoDB connection string                 |
| `JWT_ACCESS_SECRET`  | Yes      | —       | Access token signing secret (≥ 32 chars)  |
| `JWT_REFRESH_SECRET` | Yes      | —       | Refresh token signing secret (≥ 32 chars) |

## Backend (optional)

| Variable                   | Default                 | Description                                                    |
| -------------------------- | ----------------------- | -------------------------------------------------------------- |
| `NODE_ENV`                 | `development`           | Runtime mode                                                   |
| `PORT`                     | `5000`                  | API port                                                       |
| `FRONTEND_URL`             | `http://localhost:3001` | Primary frontend URL                                           |
| `CORS_ORIGINS`             | —                       | Comma-separated allowed origins (falls back to `FRONTEND_URL`) |
| `APP_URL`                  | `http://localhost:5000` | Public API URL for emails/docs                                 |
| `REDIS_URL`                | —                       | Redis for rate limiting and BullMQ                             |
| `LOG_LEVEL`                | `info`                  | Pino log level                                                 |
| `SMTP_HOST`                | —                       | Email SMTP host                                                |
| `SMTP_PORT`                | `587`                   | SMTP port                                                      |
| `SMTP_USER`                | —                       | SMTP username                                                  |
| `SMTP_PASSWORD`            | —                       | SMTP password                                                  |
| `SMTP_EMAIL_FROM`          | —                       | From address                                                   |
| `STRIPE_SECRET_KEY`        | —                       | Stripe secret key                                              |
| `STRIPE_WEBHOOK_SECRET`    | —                       | Stripe webhook signing secret                                  |
| `GOOGLE_CLIENT_ID`         | —                       | Google OAuth client ID                                         |
| `GOOGLE_CLIENT_SECRET`     | —                       | Google OAuth client secret                                     |
| `GOOGLE_CALLBACK_URL`      | —                       | Google OAuth callback URL                                      |
| `CLOUDINARY_CLOUD_NAME`    | —                       | Cloudinary cloud name                                          |
| `CLOUDINARY_API_KEY`       | —                       | Cloudinary API key                                             |
| `CLOUDINARY_API_SECRET`    | —                       | Cloudinary API secret                                          |
| `AUDIT_LOG_RETENTION_DAYS` | `90`                    | Audit log TTL in days                                          |
| `SENTRY_DSN`               | —                       | Optional Sentry error tracking DSN                             |

## Frontend

| Variable                             | Build-time | Description                                              |
| ------------------------------------ | ---------- | -------------------------------------------------------- |
| `BACKEND_URL`                        | No         | Server-side proxy target (Docker: `http://backend:5000`) |
| `NEXT_PUBLIC_API_URL`                | **Yes**    | Client-side API URL                                      |
| `NEXT_PUBLIC_SOCKET_URL`             | **Yes**    | Socket.io client URL                                     |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Yes**    | Stripe publishable key                                   |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  | Yes        | Cloudinary image loader                                  |
| `SENTRY_DSN`                         | No         | Optional frontend error tracking                         |

> **Important:** `NEXT_PUBLIC_*` variables are inlined at `next build`. In Docker, pass them as build args in `frontend/Dockerfile`.

## Docker Compose

| Variable              | Required (prod) | Description                          |
| --------------------- | --------------- | ------------------------------------ |
| `MONGO_ROOT_USERNAME` | No              | MongoDB root user (default: `admin`) |
| `MONGO_ROOT_PASSWORD` | **Yes**         | MongoDB root password                |

## Per-environment examples

### Local development

```env
FRONTEND_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3001
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Docker development

```env
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Production

```env
FRONTEND_URL=https://app.example.com
CORS_ORIGINS=https://app.example.com,https://staging.example.com
APP_URL=https://api.example.com
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SOCKET_URL=https://api.example.com
GOOGLE_CALLBACK_URL=https://api.example.com/auth/google/callback
```

## GitHub Actions secrets

Store in GitHub Environment (`staging` / `production`):

- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `MONGO_ROOT_PASSWORD`
- `CLOUDINARY_*`, `STRIPE_*`, `SMTP_*`, `GOOGLE_*`
- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`, `DEPLOY_URL`

Store as repository variables (non-secret):

- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
