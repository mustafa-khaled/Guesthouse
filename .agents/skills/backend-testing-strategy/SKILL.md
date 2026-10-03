---
name: backend-testing-strategy
description: >-
  Prioritize API/component tests with real Mongo for Guesthouse. Use when writing
  Vitest, Supertest, webhook, or worker tests in apps/api.
---

# Backend testing strategy

Priority: API/component tests → service/domain tests → few E2E.

| Kind                          | How                                         |
| ----------------------------- | ------------------------------------------- |
| Domain calculation            | unit                                        |
| Use case                      | service/component test                      |
| REST feature                  | Supertest against `app`                     |
| Index/query-sensitive Mongo   | real Mongo (memory server already in setup) |
| BullMQ                        | worker integration                          |
| Stripe webhook                | integration with signature fixtures         |
| Booking/payment critical path | E2E if asked                                |

Do not mock Mongoose until the test no longer resembles production.

Mock Stripe, SMTP, Cloudinary at the adapter boundary (`test-mock-external-services` patterns in existing tests).

Do not add a new test runner.
