---
name: external-service-boundary
description: >-
  Hide Stripe, Cloudinary, email, Redis, and third-party SDKs behind adapters.
  Use when adding payments, media upload, mail, cache, or queue producers.
---

# External service boundary

Do not scatter SDK imports through application services.

Use ports:

- `PaymentGateway`
- `MediaStorage`
- `EmailSender`
- cache / queue abstractions already in `lib/`

Then `StripePaymentGateway implements PaymentGateway` rather than `import Stripe` in twenty use cases.

Existing code uses `lib/stripe`, `lib/queue`, events for email. New work should call those modules (or a thin adapter) from application code, not from controllers.

This keeps tests from hitting the network.
