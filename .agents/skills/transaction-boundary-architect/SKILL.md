---
name: transaction-boundary-architect
description: >-
  Use Mongo transactions only for dependent multi-doc writes. Use when booking
  + inventory, check-in status pairs, or other atomic multi-collection updates.
---

# Transaction boundary architect

Use `withTransaction` from `lib/transaction.ts` when multiple dependent writes must commit or roll back together.

Do **not** wrap every write. Keep transactions short.

Never call Stripe, email, Cloudinary, or other slow networks inside an open session unless there is an explicit, documented exception.

Emit domain events **after** commit.

Wrong: transaction → Stripe → wait → email.

Right: persist pending state → Stripe (idempotent) → webhook/use case advances state → queue email.
