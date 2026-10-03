---
trigger: glob
globs: 'apps/api/**/*.ts, packages/contracts/**/*.ts, apps/web/**/*.{ts,tsx}'
description: Transport DTOs are Zod contracts; never expose Mongoose documents as API
---

# DTO boundaries

External transport contracts are DTOs. `packages/contracts` (`@guesthouse/shared`) is transport shared by web and API. It does **not** contain Mongoose models, repositories, secrets, or persistence-only types.

Do not use `Partial<Booking>`, `Pick<BookingDocument, ...>`, or `BookingDocument` as request/response types.

Map: request DTO → application input → persistence → response DTO.

Prefer separate `Create*Request`, `Update*Request`, `*Response`, `*QueryParams` when shapes differ.

Validate untrusted input with Zod before application code. Mongoose validation is a persistence safeguard, not the API boundary.
