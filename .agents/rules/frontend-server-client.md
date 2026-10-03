---
trigger: glob
globs: 'apps/web/**/*.ts, apps/web/**/*.tsx'
description: RSC default; smallest possible client subtree
---

# Server/client boundaries

Pages stay Server Components: metadata plus a thin import of a feature screen. Push `'use client'` to the smallest interactive subtree.

Do not add `'use client'` to a page because a descendant is interactive.

Do not pass server-only values into Client Components: cookies, `headers()`, secrets, class instances, or database handles.

TanStack Query, React Hook Form, and event handlers belong in Client Components. Prefer `import "server-only"` on new server modules (`lib/api/server.ts` pattern).
