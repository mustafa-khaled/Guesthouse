# JWT Authentication

Auth uses Bearer access tokens + httpOnly refresh cookies. Middleware in `middleware/requireAuth.ts`.

## Flow

1. Client sends `Authorization: Bearer <accessToken>`
2. `requireAuth` verifies JWT via `verifyAccessToken`
3. Loads user from DB, checks `tokenVersion` matches payload
4. Sets `req.user = { id, email, name, role, isEmailVerified }`

## Good

```typescript
// routes.ts
router.post('/bookings', requireAuth, bookingController.create);
router.get('/bookings', requireAuth, requireFrontDesk, bookingController.list);

// controller — user available after requireAuth
async ({ res, data, user }) => {
  const booking = await bookingService.create(data.body, user?.id);
};
```

## Bad

```typescript
// Trusting client-sent user ID without auth middleware
router.post('/bookings', bookingController.create);
// handler uses req.body.userId — spoofable

// Skipping token version check (requireAuth handles this — don't bypass)
const payload = jwt.decode(token); // no verification

// Storing tokens in response body for refresh — use httpOnly cookies
res.json({ accessToken, refreshToken }); // refresh should be cookie-only
```

## RBAC helpers (middleware/index.ts)

| Helper                | Roles                            |
| --------------------- | -------------------------------- |
| `requireManager`      | ADMIN                            |
| `requireFrontDesk`    | MODERATOR, ADMIN                 |
| `requireHousekeeping` | EDITOR, MODERATOR, ADMIN         |
| `requireStaff`        | VIEWER, EDITOR, MODERATOR, ADMIN |
| `requireGuest`        | USER, MODERATOR, ADMIN           |

Chain after `requireAuth`: `requireAuth → requireFrontDesk → handler`.

## Rules

- Every protected route must have `requireAuth` (or role helper that implies it)
- Role helpers use hierarchical check via `requiredRole` — pass minimum roles
- Auth routes use `authLimiter` — see security-rate-limiting rule
- Do not expose `tokenVersion` or password hash in API responses
