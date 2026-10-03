---
name: frontend-testing-strategy
description: >-
  Decide what to test in apps/web. Use when writing Vitest or Playwright tests
  for components, hooks, or guest/admin/staff flows.
---

# Frontend testing strategy

Do not test everything. Do not add a new test runner.

| Kind                           | Test?                             | How                   |
| ------------------------------ | --------------------------------- | --------------------- |
| Pure transforms / RBAC helpers | Yes                               | Vitest unit           |
| Stateful hooks                 | When logic is meaningful or asked | unit                  |
| Shared interactive component   | When behavior-rich or asked       | component             |
| Forms                          | Non-trivial rules or asked        | component             |
| Critical booking path          | When asked                        | Playwright `test:e2e` |

Test behavior ("user sees error", "canSave is false"), not implementation ("useEffect ran").

When the user did not ask, add tests only for new non-trivial pure logic. Do not emit a `.test.tsx` per component.

Existing: `pnpm --filter guesthouse-frontend test` and `test:e2e`.
