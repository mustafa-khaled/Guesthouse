# API Validation with Zod

All user input must be validated before reaching services. Use `wrapController` — not the unused `validateRequest` middleware.

## Good

```typescript
// booking.schema.ts
export const createBookingSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
  }),
});

// booking.controller.ts
create: wrapController(
  { body: createBookingSchema.shape.body },
  async ({ res, data, user }) => {
    const booking = await bookingService.create(data.body, user?.id);
    return created(res, booking);
  }
),
```

Pass only the shape needed: `{ body: schema.shape.body }`, `{ params: schema.shape.params }`, `{ query: schema.shape.query }`.

## Bad

```typescript
// Manual safeParse in every handler — duplicates wrapController logic
async create(req, res, next) {
  const result = createBookingSchema.safeParse({ body: req.body });
  if (!result.success) return res.status(400).json({ message: "Invalid" });
  // ...
}

// No validation
router.post("/bookings", requireAuth, (req, res) => {
  bookingService.create(req.body); // trusts raw input
});

// Using validateBody middleware in routes when wrapController is available
router.post("/bookings", validateBody(createSchema), handler);
```

## Rules

- Schemas use top-level `body` / `params` / `query` keys
- Prefer `@guesthouse/shared` schemas when they exist; extend locally only when needed
- `wrapController` returns `400 { message, errors }` on Zod failure — do not reimplement
- Use `z.coerce.number()` for query params that arrive as strings
