---
trigger: always_on
description: Prefer typed, consistent TypeScript over weak types and shortcuts
alwaysApply: true
---

# Typed code quality

- Use existing domain types, API response types, and component prop types before introducing new shapes.
- Avoid `any`; prefer precise types, generics, discriminated unions, or `unknown` with narrowing.
- Type exported functions, shared contracts, and public component props clearly. Let TypeScript infer obvious locals.
- Do not silence type or lint errors unless the exception is narrow, documented, and there is no cleaner typed fix.
- Follow nearby patterns for naming, folders, errors, and state.
- Keep fixes small and behavior-preserving.
