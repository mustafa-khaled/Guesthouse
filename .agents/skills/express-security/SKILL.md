---
name: express-security
description: >-
  Express security for auth, uploads, cookies, payments, public and admin APIs,
  and webhooks. Use when touching those surfaces in apps/api.
---

# Express security

Validate all untrusted input. Keep Helmet, CORS allowlists, mongoSanitize, hpp, body limits.

Stronger rate limits: login, password reset, OTP, refresh, signup.

Authenticate first; authorize the resource after. Never expose internal DB errors or stack traces in production.

Prevent NoSQL injection and user-controlled regex. No mass assignment (see rule).

Never log credentials or payment secrets.

Middleware order is documented in `express-module-architect` references and `app.ts`. Do not mount webhooks after `express.json()`.
