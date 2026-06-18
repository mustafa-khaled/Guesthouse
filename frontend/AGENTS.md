<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Serene Stays — Agent Guide

Premium hotel booking site built with **Next.js App Router**, **Tailwind CSS v4**, and **TypeUI Matcha**.

## Skills (read before any UI work)

| Skill | Path | Purpose |
|---|---|---|
| TypeUI Fundamentals | `.agents/skills/typeui-fundamentals/` | Accessibility, spacing, typography, UX guardrails |
| Matcha Design System | `.agents/skills/typeui-design-system/SKILL.md` | Colors, tokens, components |
| Serene Stays Hotel | `.agents/skills/serene-stays-hotel/SKILL.md` | Page structure, copy tone, booking patterns |

Design system metadata: `.typeui-design-system.json` (slug: `matcha`)

## Project structure

```
src/app/                  → routes, layout, globals.css
src/components/ui/        → Matcha primitives (Button, Card, Container, Section)
src/components/sections/  → landing page sections
src/lib/content.ts        → static content and data
```

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## UI rules

- Use Matcha CSS tokens from `globals.css` — do not hardcode colors elsewhere
- Noto Serif for headings, Noto Sans for body
- 4px radius, 8px spacing grid, 48px min touch targets
- Server components by default; client only for interactivity
