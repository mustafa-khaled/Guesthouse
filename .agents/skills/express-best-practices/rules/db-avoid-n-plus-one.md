# Avoid N+1 Queries

N+1 happens when you fetch a list, then query related data per item in a loop.

## Good

```typescript
// Populate in single query
const bookings = await Booking.find({ propertyId })
  .populate('guestId', 'firstName lastName email')
  .populate('roomTypeId', 'name')
  .lean();

// Batch fetch related IDs
const guestIds = bookings.map((b) => b.guestId);
const guests = await Guest.find({ _id: { $in: guestIds } }).lean();
const guestMap = new Map(guests.map((g) => [g._id.toString(), g]));

// Aggregation for reports
const revenue = await Payment.aggregate([
  { $match: { status: 'completed', createdAt: { $gte: startDate } } },
  { $group: { _id: '$propertyId', total: { $sum: '$amount' } } },
]);
```

## Bad

```typescript
const bookings = await Booking.find({ propertyId }).lean();
const result = [];
for (const booking of bookings) {
  const guest = await Guest.findById(booking.guestId); // N+1
  const room = await Room.findById(booking.roomId); // N+1
  result.push({ ...booking, guest, room });
}
```

## Rules

- Use `.populate()` for single-level relations on list endpoints
- For complex joins, use `$lookup` aggregation
- Collect IDs first, then `find({ _id: { $in: ids } })` with a Map for O(1) lookup
- Limit populate depth — avoid nested populate chains deeper than 2 levels
- Profile slow list endpoints with `.explain()` during development
