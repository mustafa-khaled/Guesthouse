# Supertest Integration Tests

HTTP tests import `app` from `app.ts` and use Supertest. Vitest runs them with MongoMemoryServer from `test/setup.ts`.

## Good

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Booking API', () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET =
      process.env.JWT_ACCESS_SECRET || 'test-access-secret-at-least-32-characters';
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-at-least-32-characters';
  });

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/v1/bookings');
    expect(res.status).toBe(401);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('checks liveness', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('alive');
  });
});
```

## Test per module checklist

```
- [ ] 401 without auth on protected routes
- [ ] 403 with wrong role (guest token on admin route)
- [ ] 400 on invalid body (validation)
- [ ] 404 on missing resource
- [ ] 201/200 happy path with seeded data
```

## Bad

```typescript
// Importing server.ts — starts real HTTP server, connects to prod DB
import "../server";

// No JWT secrets in beforeAll — auth tests fail unpredictably
it("creates booking", async () => {
  await request(app).post("/api/v1/bookings").send({ ... });
});

// Asserting exact error message strings that change frequently
expect(res.body.message).toBe("Exact internal error text from service");
```

## Rules

- Import `app` not `server` — app is the Express instance without listening
- Place tests in `modules/{feature}/__tests__/` or `__tests__/integration/`
- `test/setup.ts` provides MongoMemoryServer — collections cleared after each test
- Seed test users via direct model insert or shared test helper — do not depend on external DB
- Test RBAC: use tokens for different roles to verify 403 responses
