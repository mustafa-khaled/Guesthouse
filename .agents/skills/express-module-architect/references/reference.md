# Guesthouse Backend — Reference

## Middleware order (app.ts)

```
helmet → cors → compression → mongoSanitize → hpp → requestId → pinoHttp
→ /api/v1/webhooks (raw body) → express.json → cookieParser
→ health routes → /api/v1/docs → legacy routes (/auth, /user, /admin)
→ apiLimiter on /api/v1 → feature routers → uploadLimiter on /api/v1/upload
→ notFoundHandler → errorHandler
```

## Module scaffold

### `{feature}.schema.ts`

```typescript
import { z } from 'zod';

export const createFeatureSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
});

export const getFeatureSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listFeaturesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});
```

### `{feature}.service.ts`

```typescript
import { Feature } from '../../models';
import { HttpError } from '../../common/errors/http.errors';

class FeatureService {
  async create(data: { name: string }, userId?: string) {
    const feature = await Feature.create({ ...data, createdBy: userId });
    return feature;
  }

  async findById(id: string) {
    const feature = await Feature.findById(id).lean();
    if (!feature) throw new HttpError(404, 'Feature not found');
    return feature;
  }

  async list(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Feature.find().skip(skip).limit(limit).lean(),
      Feature.countDocuments(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const featureService = new FeatureService();
```

### `{feature}.controller.ts`

```typescript
import { featureService } from './feature.service';
import { createFeatureSchema, getFeatureSchema, listFeaturesSchema } from './feature.schema';
import { wrapController, created, ok, okPaginated } from '../../common/utils/controller-wrapper';

export const featureController = {
  create: wrapController({ body: createFeatureSchema.shape.body }, async ({ res, data, user }) => {
    const feature = await featureService.create(data.body, user?.id);
    return created(res, feature, 'Feature created successfully');
  }),

  getById: wrapController({ params: getFeatureSchema.shape.params }, async ({ res, data }) => {
    const feature = await featureService.findById(data.params.id);
    return ok(res, feature);
  }),

  list: wrapController({ query: listFeaturesSchema.shape.query }, async ({ res, data }) => {
    const result = await featureService.list(data.query.page, data.query.limit);
    return okPaginated(res, result);
  }),
};
```

### `{feature}.routes.ts`

```typescript
import { Router } from 'express';
import { featureController } from './feature.controller';
import { requireAuth, requireFrontDesk } from '../../middleware';

const router = Router();

router.post('/features', requireAuth, requireFrontDesk, featureController.create);
router.get('/features', requireAuth, requireFrontDesk, featureController.list);
router.get('/features/:id', requireAuth, featureController.getById);

export default router;
```

### `index.ts`

```typescript
export { default as featureRouter } from './feature.routes';
export { featureService } from './feature.service';
export { featureController } from './feature.controller';
export * from './feature.schema';
```

### Mount in `app.ts`

```typescript
import { featureRouter } from './modules/feature';

app.use('/api/v1', featureRouter);
```

## Supertest integration test template

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Feature API', () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET =
      process.env.JWT_ACCESS_SECRET || 'test-access-secret-at-least-32-characters';
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-at-least-32-characters';
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/features');
    expect(res.status).toBe(401);
  });

  it('creates a feature with valid auth', async () => {
    const token = '...'; // obtain via auth helper or seed user
    const res = await request(app)
      .post('/api/v1/features')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Feature' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('name', 'Test Feature');
  });
});
```

Place tests in `modules/{feature}/__tests__/` or `__tests__/integration/`.

## Event emission pattern

```typescript
// In service, after successful write:
import { emit, EventType } from '../../lib/events';

emit(EventType.BOOKING_CREATED, {
  bookingId: booking.id,
  confirmationNumber: booking.confirmationNumber,
  propertyId: booking.propertyId,
  guestId: booking.guestId,
  guestEmail: guest.email,
  guestName: `${guest.firstName} ${guest.lastName}`,
  checkIn: booking.checkIn,
  checkOut: booking.checkOut,
  roomTypeId: booking.roomTypeId,
  totalAmount: booking.totalAmount,
  userId,
});
```

Register listener in `listeners/` — never send email/socket from the service directly.

## Transaction pattern

```typescript
import { withTransaction } from "../../lib/transaction";

await withTransaction(async (session) => {
  await Booking.create([bookingData], { session });
  await Inventory.updateOne({ ... }, { $inc: { available: -1 } }, { session });
});
```

Use for multi-document writes (booking creation, check-in, payment confirmation).

## HttpError usage in services

```typescript
import { HttpError } from '../../common/errors/http.errors';

if (!booking) throw new HttpError(404, 'Booking not found');
if (booking.status !== 'confirmed') throw new HttpError(400, 'Booking is not confirmed');
```

`wrapController` catches `HttpError` and returns `{ message }` with the correct status. Unhandled errors reach `errorHandler`.
