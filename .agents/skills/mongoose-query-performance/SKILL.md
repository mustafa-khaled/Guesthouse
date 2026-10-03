---
name: mongoose-query-performance
description: >-
  Keep Mongoose reads fast and bounded. Use when writing find/aggregate/populate,
  list endpoints, pagination, or debugging slow Mongo queries.
---

# Mongoose query performance

Check: projection, pagination, index support, sort, `lean()`, `populate()`, aggregation, N+1, unbounded queries.

- Never `find()` without expected cardinality.
- List endpoints: pagination, deterministic sort, max limit.
- Prefer cursor pagination for large/changing datasets.
- `.select()` only needed fields. `.lean()` for read-only JSON.
- Avoid uncontrolled populate chains.
- Never fetch thousands of rows and filter in JavaScript.

```ts
const bookings = await Booking.find({ propertyId, status: 'confirmed' })
  .select('checkIn checkOut status roomId')
  .sort({ checkIn: 1 })
  .skip(skip)
  .limit(limit)
  .lean();
```

Prefer `updateMany` / `bulkWrite` over per-document loops.
