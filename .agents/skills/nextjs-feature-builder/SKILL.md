---
name: nextjs-feature-builder
description: >-
  Orchestrate a new Next.js feature for Guesthouse (apps/web). Use when the user
  asks to build, scaffold, or add a screen, route, or domain module.
---

# Next.js feature builder

When the user asks to build a feature, follow this order. Read each specialist skill when that step applies.

1. **Architecture** — `guesthouse-frontend-architecture`. Route group, thin page, `features/{domain}/`.
2. **Feature boundaries** — `.agents/rules/frontend-feature-boundaries.md`.
3. **Server/client** — `.agents/rules/frontend-server-client.md`.
4. **State** — `react-state-architect`.
5. **Component API** — `react-component-api`.
6. **React Query** — `react-query` when fetching or mutating.
7. **Forms** — still `react-state-architect` (RHF + Zod). Align schemas with `data-contracts` / `@guesthouse/shared` when the API owns the shape.
8. **Matcha** — `typeui-fundamentals`, `typeui-design-system`. Guest marketing: `serene-stays-hotel`.
9. **Async UI** — `.agents/rules/frontend-async-ui.md`.
10. **Accessibility** — `.agents/rules/frontend-accessibility.md`.
11. **Tests** — `frontend-testing-strategy`. Only for non-trivial logic or when asked.

Typed quality and security boundaries always apply.

If the user asked to refactor existing UI, stop and use `component-refactor-auditor`.
