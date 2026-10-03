---
name: mongoose-data-architect
description: >-
  Design Mongo schemas from workload: embed vs reference, indexes, uniqueness,
  TTL. Use when adding or changing Mongoose models in apps/api/src/models.
---

# Mongoose data architect

Do not convert SQL tables 1:1 into collections.

Before creating or changing a schema:

1. Dominant reads
2. Dominant writes
3. Sort/filter fields
4. Cardinality
5. Whether related data changes independently
6. Embed vs reference
7. Indexes from those query patterns

**Embed** when the child is always loaded with the parent, has bounded size, and does not need independent queries/lifecycle.

**Reference** when the related entity is shared, large, independently mutated, or queried alone.

Models live in `apps/api/src/models/`. They own schema shape, indexes, basic field validation, and document behavior that truly belongs on the entity.

They must **not** own workflows such as create-booking-and-charge-Stripe-and-email.

Uniqueness → unique index. Session/ephemeral docs → consider TTL. Hot subset of docs → consider partial index.
