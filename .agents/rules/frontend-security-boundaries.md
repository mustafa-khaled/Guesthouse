---
trigger: glob
globs: 'apps/web/**/*.ts, apps/web/**/*.tsx'
description: No secrets on the client; UI is not authorization
---

# Frontend security boundaries

- Never put secrets in `NEXT_PUBLIC_*`.
- Client code uses `clientFetch()` → `/api/*`. Never call `BACKEND_URL` from the browser.
- httpOnly cookies only — no tokens in localStorage.
- Treat UI role checks as UX, not security. The API enforces authorization.
- Do not add `dangerouslySetInnerHTML` without a documented sanitization path.
- Prefer `import "server-only"` on server modules.
