# Feature Modules

Each domain lives in `backend/src/modules/{feature}/` with a consistent file set.

## Required files

```
modules/{feature}/
├── {feature}.routes.ts      # Router + middleware wiring
├── {feature}.controller.ts  # wrapController handlers
├── {feature}.service.ts     # Business logic (singleton export)
├── {feature}.schema.ts      # Zod validation schemas
└── index.ts                 # Barrel exports
```

## Good

```typescript
// modules/booking/index.ts
export { default as bookingRouter } from './booking.routes';
export { bookingService } from './booking.service';
export { bookingController } from './booking.controller';
export * from './booking.schema';
```

```typescript
// app.ts — mount under /api/v1
import { bookingRouter } from './modules/booking';
app.use('/api/v1', bookingRouter);
```

## Bad

- Business logic in `routes/admin.routes.ts` or inline route handlers
- Controller calling Mongoose directly (skip the service)
- Module without `index.ts` barrel — forces deep imports
- New feature mounted at `/auth` or `/admin` instead of `/api/v1`

## Rules

- One feature = one folder under `modules/`
- Shared Mongoose models go in `models/` — not inside the module
- Cross-cutting legacy routes stay in `routes/` but new work uses `modules/`
- Export router as default from `*.routes.ts`; named exports from `index.ts`
