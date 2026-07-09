# Async Error Handling

Express does not catch async errors automatically. Use `wrapController` or explicit `next(error)`.

## Good

```typescript
// wrapController catches HttpError, ZodError, and passes others to next()
create: wrapController(
  { body: createBookingSchema.shape.body },
  async ({ res, data }) => {
    const booking = await bookingService.create(data.body);
    return created(res, booking);
  }
),

// Legacy class controller — must use next(error)
async list(req, res, next) {
  try {
    const result = await bookingService.list();
    return ok(res, result);
  } catch (error) {
    next(error);
  }
}
```

## Bad

```typescript
// Swallowed error — client gets hung request or empty response
async list(req, res) {
  try {
    const result = await bookingService.list();
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Error" }); // bypasses errorHandler, no requestId
  }
}

// Unhandled promise rejection
router.get("/bookings", async (req, res) => {
  const data = await bookingService.list(); // if this throws, no handler catches it
  res.json(data);
});
```

## Rules

- New code: always `wrapController` — it handles the try/catch
- Legacy code being edited: add `next(error)` in catch blocks
- Never return inline `res.status(500)` — throw `HttpError` or call `next(error)`
- Services throw `HttpError` for business failures; let unexpected errors propagate
