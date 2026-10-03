---
name: data-contracts
description: >-
  Keep API DTOs, Zod, and UI models separate. Use when mapping responses,
  forms, search params, or @guesthouse/shared types on the web app.
---

# Data contracts

TypeScript types are not runtime validation. Validate at boundaries that can lie: malformed API payloads, URL params, storage, third-party widgets.

`packages/contracts` (`@guesthouse/shared`) is the HTTP contract. Import types (and `hasMinimumRole`) via `@/types`. Do not import OpenAPI generators into client components.

Pipeline: API JSON → normalize in the query `queryFn` → UI model. Do not reshape payloads in random screens.

When the API shape matches the UI, do not invent a parallel type. When it diverges, map once next to the query factory.

Forms: Zod + `zodResolver`; prefer shared schemas when the same fields hit the API.

See `dto-contract-architect` for backend-side rules. See `react-query` for factory wiring.
