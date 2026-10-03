---
name: api-design
description: >-
  REST conventions for Guesthouse /api/v1: nouns, status codes, pagination,
  action endpoints. Use when adding or renaming HTTP routes.
---

# API design

Use resource nouns and HTTP verbs:

```
GET    /api/v1/bookings
GET    /api/v1/bookings/:bookingId
POST   /api/v1/bookings
PATCH  /api/v1/bookings/:bookingId
POST   /api/v1/bookings/:bookingId/cancel
```

Not `POST /getBookings` or `POST /cancelBooking`.

Domain actions (cancel, check-in) are clearer as explicit action routes than fake CRUD.

Pagination, filtering, sorting, and error envelopes stay consistent with existing helpers (`okPaginated`, `{ message, data }`).

Versioning: new work under `/api/v1`. Legacy `/auth`, `/user`, `/admin` stay until migrated — do not add new features there.

Idempotency: payment and booking creates should tolerate retries (keys / unique constraints).
