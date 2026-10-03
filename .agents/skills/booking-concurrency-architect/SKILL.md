---
name: booking-concurrency-architect
description: >-
  Prevent double-booking and unsafe payment/booking races. Use when changing
  availability, overlapping dates, check-in inventory, or booking create/cancel.
---

# Booking concurrency architect

The worst production bug is two guests booking the same room for overlapping dates.

Check availability → time passes → create booking **races**.

Ask:

- Can another request mutate this resource between read and write?
- Does correctness rely only on an application-level `if`?
- Can Mongo enforce part of the invariant (unique, partial filter, transaction)?
- Is a transaction required?
- Can this operation run twice safely (idempotency)?

Prefer atomic writes, unique constraints where they match the invariant, optimistic concurrency (`version` / `updatedAt` match), and idempotency keys for payments.

Do not leave "if available then insert" without a database-backed guarantee.

See also `transaction-boundary-architect` and `stripe-payment-architect`.
