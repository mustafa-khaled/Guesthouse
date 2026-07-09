# Mongoose Queries

Services query models directly. Follow these patterns for performance and safety.

## Good

```typescript
// Lean for read-only API responses
const booking = await Booking.findById(id).lean();
if (!booking) throw new HttpError(404, 'Booking not found');

// Select only needed fields
const users = await User.find({ role: 'admin' }).select('name email role').lean();

// Indexed filter fields (ensure indexes via ensure-indexes script)
const bookings = await Booking.find({ propertyId, status: 'confirmed' })
  .sort({ checkIn: 1 })
  .skip(skip)
  .limit(limit)
  .lean();
```

## Bad

```typescript
// Returning full Mongoose document with internal fields
const user = await User.findById(id);
return user; // may include password hash if select not applied

// Unbounded query
const all = await Booking.find({}); // no limit on list endpoints

// find + loop update (use bulkWrite or updateMany)
for (const room of rooms) {
  await Room.updateOne({ _id: room._id }, { status: 'clean' });
}
```

## Rules

- Use `.lean()` for read endpoints that return JSON — skips Mongoose document overhead
- Always paginate list queries (`skip` + `limit` + `countDocuments`)
- Filter on indexed fields — run `pnpm ensure-indexes` after schema index changes
- Use `.select("-passwordHash")` or model-level `toJSON` transform to strip secrets
- Prefer `updateMany` / `bulkWrite` over loops for batch updates
