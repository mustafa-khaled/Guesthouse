---
name: dto-contract-architect
description: >-
  Separate transport DTOs from persistence. Use when adding Zod schemas, API
  request/response types, packages/contracts, or mapping Mongoose documents to JSON.
---

# DTO contract architect

External transport contracts are DTOs. Do not expose Mongoose models as API contracts.

`packages/contracts` (`@guesthouse/shared`) is shared by `apps/web` and `apps/api`. It must not contain Mongoose models, repositories, backend domain internals, secrets, or persistence-only types.

Prefer distinct:

- `CreateBookingRequest` / `UpdateBookingRequest`
- `BookingResponse` / `BookingListResponse`
- `BookingQueryParams`

Do not reuse `Partial<Booking>`, `Pick<BookingDocument, …>`, or `BookingDocument` as HTTP types.

Pipeline: request DTO → application input → domain/persistence → response DTO.

Zod validates at the API boundary (`wrapController`). Mongoose remains a save-time safeguard.

Frontend may import types and `hasMinimumRole` from `@guesthouse/shared`. Do not import OpenAPI generators or backend-only schemas into the browser bundle.

Local `*.schema.ts` in a module is for extra backend-only fields; prefer shared schemas when the contract is public.
