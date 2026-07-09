# Database Transactions

Use `withTransaction` from `lib/transaction.ts` for multi-document writes that must succeed or fail together.

## When to use

- Booking creation (booking + inventory decrement + guest upsert)
- Check-in / check-out (booking status + room status)
- Payment confirmation (payment record + booking status update)
- Any operation touching 2+ collections atomically

## Good

```typescript
import { withTransaction } from '../../lib/transaction';

await withTransaction(async (session) => {
  const [booking] = await Booking.create([bookingData], { session });
  await Inventory.updateOne(
    { propertyId, roomTypeId, date: checkIn },
    { $inc: { available: -1 } },
    { session },
  );
  await Guest.findOneAndUpdate({ email: guestData.email }, guestData, { upsert: true, session });
});
```

## Bad

```typescript
// Sequential writes without transaction — partial failure leaves inconsistent state
const booking = await Booking.create(bookingData);
await Inventory.updateOne({ ... }, { $inc: { available: -1 } }); // fails here → overbooked

// Transaction for single-document write — unnecessary overhead
await withTransaction(async (session) => {
  await Booking.updateOne({ _id: id }, { status: "cancelled" }, { session });
});
```

## Rules

- Pass `{ session }` to every Mongoose call inside the transaction callback
- Keep transaction scope small — no external API calls (Stripe, email) inside
- Emit events **after** transaction commits successfully
- On failure, `withTransaction` rolls back automatically — throw `HttpError` for business validation before starting
