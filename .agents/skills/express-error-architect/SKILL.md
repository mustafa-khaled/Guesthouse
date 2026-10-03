---
name: express-error-architect
description: >-
  Centralize Express error mapping from domain errors to HTTP. Use when adding
  error types, changing errorHandler, or fixing controller catch blocks.
---

# Express error architect

Prefer typed errors (`HttpError` today; NotFound, Validation, Authentication, Authorization, Conflict, RateLimit, ExternalService as you add them).

One mapper (`errorHandler`) converts to status, safe message, `requestId`.

Prohibit:

```ts
try { ... } catch (error) {
  res.status(500).json({ error });
}
```

in controllers. `wrapController` forwards rejections.

Do not leak `error` internals in production. Sentry stays in the global handler.
