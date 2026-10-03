---
name: stripe-payment-architect
description: >-
  Treat Stripe webhooks as authoritative payment signals. Use when adding
  Checkout, PaymentIntents, refunds, webhook handlers, or booking payment state.
---

# Stripe payment architect

Never trust payment state from the frontend.

The Stripe webhook is the authoritative asynchronous signal. Verify signatures (`STRIPE_WEBHOOK_SECRET`). Mount webhook routes with raw body **before** `express.json()`.

Webhook handlers must be idempotent. Persist Stripe event IDs when duplication would double-apply side effects. Return quickly; slow work goes to BullMQ.

Do not log secrets or full sensitive payment payloads.

Model **states**, not boolean soup:

- pending → processing → paid
- pending → failed
- paid → refunded

Not `isPaid` + `isProcessing` + `isFailed` + `isRefunded` independently.

Application use cases — not controllers — advance booking/payment state after a verified event.
