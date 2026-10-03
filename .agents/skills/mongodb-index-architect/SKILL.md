---
name: mongodb-index-architect
description: >-
  Design Mongo indexes from real query shapes, not guesswork. Use when adding
  indexes, unique/TTL/partial indexes, or ensure-indexes.
---

# MongoDB index architect

Do not add an index because a field "looks searchable."

Inspect actual filters, sorts, ranges, projections, cardinality, and read/write ratio first.

Indexes speed reads and cost storage, memory, and write amplification.

Candidates to **verify against queries** (not copy blindly):

- bookings: `propertyId + status + checkIn`; `propertyId + roomId + checkIn/checkOut`; `guestId + createdAt`
- rooms: `propertyId + status`
- users: unique `email`
- sessions: TTL on `expiresAt`

Unique constraint → unique index. Temporary data → TTL. Frequently queried subset → partial.

After schema index changes, run `pnpm --filter guesthouse-backend ensure-indexes`.
