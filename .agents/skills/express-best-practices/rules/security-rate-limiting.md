# Rate Limiting

Rate limiters in `common/middleware/rate-limit.middleware.ts`. Redis-backed with in-memory fallback.

## Currently wired

| Limiter         | Where            | Limits     |
| --------------- | ---------------- | ---------- |
| `authLimiter`   | `/auth` routes   | 5 / 15 min |
| `apiLimiter`    | `/api/v1`        | 60 / min   |
| `uploadLimiter` | `/api/v1/upload` | 50 / hour  |

## Available but check wiring

| Limiter          | Intended use                    |
| ---------------- | ------------------------------- |
| `generalLimiter` | Broad protection (100 / 15 min) |
| `strictLimiter`  | Sensitive ops (10 / hour)       |
| `webhookLimiter` | Webhook endpoints               |

## Good

```typescript
// app.ts
app.use('/api/v1', apiLimiter);
app.use('/api/v1/upload', uploadLimiter, uploadRouter);

// auth.routes.ts
router.post('/login', authLimiter, authController.login);
```

## Bad

```typescript
// No rate limit on auth endpoints
router.post('/login', authController.login);

// Rate limit after routes (too late — limiter must be before handlers)
app.use('/api/v1', propertyRouter);
app.use('/api/v1', apiLimiter); // wrong order

// Custom in-memory limiter ignoring Redis store pattern
const hits = new Map(); // use createRateLimiter instead
```

## Rules

- Apply `apiLimiter` once on `/api/v1` prefix, before feature routers
- Auth endpoints (`/auth/login`, `/auth/register`) must use `authLimiter`
- Upload routes get `uploadLimiter` in addition to `apiLimiter`
- When adding sensitive endpoints (password reset, export), consider `strictLimiter`
- Redis unavailable → falls back to in-memory (single-instance only) — log warns automatically
