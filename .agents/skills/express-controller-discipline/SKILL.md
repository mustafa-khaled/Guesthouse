---
name: express-controller-discipline
description: >-
  Keep Express controllers boring. Use when writing or reviewing controllers,
  route handlers, wrapController, or HTTP status mapping in apps/api.
---

# Express controller discipline

Controllers remain thin.

**Allowed:** extract params/query/body, DTO parse (`wrapController`), `req.user` / auth context, call one application/service method, choose status, serialize with `created` / `ok` / `okPaginated`.

**Forbidden:** Mongoose, Stripe, Cloudinary, BullMQ, business math, multi-step workflows, inventing authorization (`if (user.role === 'admin')` for a resource rule).

```ts
export const bookingController = {
  create: wrapController({ body: createBookingSchema.shape.body }, async ({ res, data, user }) => {
    const booking = await bookingService.create(data.body, user?.id);
    return created(res, booking, 'Booking created successfully');
  }),
};
```

Use `wrap()` only when there is no body/params/query to validate.
