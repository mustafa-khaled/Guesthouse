---
trigger: glob
globs: 'apps/web/**/*.tsx'
description: Accessibility is required even if the user did not mention it
---

# Accessibility

- Semantic HTML, visible labels, keyboard access, 48px minimum touch targets.
- Dialogs need focus management and an accessible name.
- Live regions for async status where users would otherwise miss errors.
- Do not weaken WCAG for Matcha aesthetics. Pair with `typeui-fundamentals`.
