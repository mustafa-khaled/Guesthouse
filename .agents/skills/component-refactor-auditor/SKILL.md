---
name: component-refactor-auditor
description: >-
  Audit/refactor existing Guesthouse React UI. Use only when the user asks to
  audit or refactor existing components. Preserve behavior.
---

# Component refactor auditor

Do not drive-by rewrite legacy screens while building a new feature.

Review only the scoped files. Preserve behavior, visual Matcha usage, and API contracts.

Checklist:

1. **State** — `react-state-architect`
2. **Props** — `react-component-api`
3. **Async UI** — loading/empty/error/mutation
4. **A11y** — `frontend-accessibility` rule + `typeui-fundamentals`

No new Zustand. Keep `AuthProvider` / `SocketProvider`. Smallest safe change. `'use client'` stays at the smallest boundary.
