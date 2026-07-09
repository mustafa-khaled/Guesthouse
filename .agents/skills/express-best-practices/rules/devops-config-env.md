# Environment Configuration

All env vars are validated at startup via Zod in `config/env.ts`. Never read `process.env` directly in application code.

## Good

```typescript
import { env } from '../config/env';

const port = env.PORT;
const mongoUri = env.MONGODB_URI;

if (env.NODE_ENV === 'production') {
  // production-only logic
}
```

```bash
# .env.example documents every variable
JWT_ACCESS_SECRET=
MONGODB_URI=mongodb://localhost:27017/guesthouse
REDIS_URL=redis://localhost:6379
```

## Bad

```typescript
const secret = process.env.JWT_ACCESS_SECRET || 'fallback-secret'; // bypasses validation
const port = process.env.PORT || 3000; // may be undefined string

// New env var used without adding to config/env.ts schema
const feature = process.env.ENABLE_FEATURE === 'true'; // not validated at boot
```

## Adding a new env var

1. Add to Zod schema in `config/env.ts` with type and default if optional
2. Add to `backend/.env.example` with comment
3. Add to `docs/ENVIRONMENT.md` if operationally significant
4. Import via `env.VAR_NAME` everywhere

## Rules

- App fails fast at startup if required env vars are missing — this is intentional
- Secrets never committed — `.env` is gitignored, `.env.example` has placeholders only
- `env.NODE_ENV` drives error detail exposure (stack traces in dev only)
- Test files may set `process.env` in `beforeAll` for JWT secrets — production code uses `env`
