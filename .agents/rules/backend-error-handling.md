---
trigger: glob
globs: 'apps/api/**/*.ts'
description: Centralize HTTP error mapping; throw typed errors from services
---

# Error handling

Throw `HttpError` (or a domain error mapped to it) from application/services. Trust `middleware/errorHandler.ts`.

Do not wrap every controller in `try/catch` that returns `500 { error }`.

Keep response envelopes consistent: `{ message, data }` via `created` / `ok` / `okPaginated`. Include `requestId` on 500s (already in the handler).
