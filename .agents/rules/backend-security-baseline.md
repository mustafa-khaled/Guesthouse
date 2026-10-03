---
trigger: glob
globs: 'apps/api/**/*.ts'
description: Auth, validation, CORS, rate limits, and safe Mongo updates
---

# Security baseline

- Authenticate first; authorize the specific resource/action after.
- Never trust client authorization state or expose stack traces in production.
- Helmet, explicit CORS allowlists (`config/cors.ts`), body limits already in `app.ts` — do not weaken them.
- Stronger rate limits on login, signup, OTP, refresh, password reset.
- Prevent NoSQL operator injection; `mongoSanitize` stays global.
- Avoid arbitrary object spreading into Mongo updates.
- Avoid user-controlled regex without protection.
- Mount Stripe webhooks with `express.raw` **before** `express.json()`.
