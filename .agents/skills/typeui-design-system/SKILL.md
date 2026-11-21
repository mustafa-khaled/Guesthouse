---
name: typeui-design-system
description: Matcha design system for Serene Stays hotel UI. Use for all visual tokens, components, spacing, typography, colors, and interaction patterns. Always pair with typeui-fundamentals.
license: MIT
metadata:
  author: typeui.sh
  slug: matcha
---

# Matcha Design System — Agent Instructions

Active design system for this project. Treat every token and component rule as binding.

## Load order

1. Read `typeui-fundamentals` skill files first (accessibility, spacing, typography, ui, ux).
2. Apply this Matcha design system for all concrete visual values.
3. Follow `serene-stays-hotel` skill for page structure and content tone.

## Color tokens

Semantic tokens live in `apps/web/app/globals.css`. Use the Tailwind utilities (`bg-surface`,
`text-ink`, `border-line`, `bg-brand`), never raw hex in components.

| Token          | CSS variable       | Hex       | Usage                                 |
| -------------- | ------------------ | --------- | ------------------------------------- |
| Surface        | `--surface`        | `#F6F6F6` | Page background (ash white)           |
| Surface raised | `--surface-raised` | `#FFFFFF` | Cards, inputs, lifted panels (paper)  |
| Brand          | `--brand`          | `#C49C74` | Primary actions, CTA (warm camel)     |
| Brand deep     | `--brand-deep`     | `#B0885E` | Hover / pressed brand                 |
| Brand soft     | `--brand-soft`     | `#F5EFE8` | Quiet highlight blocks, selected rows |
| Brand text     | `--brand-text`     | `#885B2D` | Accessible links and text accents     |
| Ink            | `--ink`            | `#252525` | Headings and primary copy (charcoal)  |
| Ink muted      | `--ink-muted`      | `#6E6862` | Secondary copy, labels (graphite)     |
| Line           | `--line`           | `#CCCCCC` | Hairlines, borders (silver)           |
| Line strong    | `--line-strong`    | `#C9BEB3` | Hover borders, rules (sandstone)      |

Status tokens: `--success`, `--warning`, `--danger`, `--info`, each with a `*-tint` background.
Primary buttons are `text-ink` on `bg-brand` (~6.1:1, WCAG AA compliant).

## Typography

- **Display:** Newsreader 400/500 (self-hosted, `public/fonts`). `--text-display` hero,
  `--text-title` page titles, `--text-heading` sections. Measured, never bold.
- **UI:** Instrument Sans 400/500/600. Body, labels, tables, buttons.
- **Scale:** 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56 / 88px via the clamp tokens.
- **Line height:** 1.6–1.7 body; 1.02–1.15 display/headings.
- **Labels:** sentence case. Numbers use `.tabular`.

## Spacing and shape

- **Grid:** 8px baseline (4, 8, 12, 16, 24, 32, 48, 64, 80, 96)
- **Section padding:** `py-20` mobile, `md:py-28` desktop; container gutters 20/32/40px
- **Border radius:** 4px on cards, inputs, buttons (crisp, not pill)
- **Shadows:** `--shadow-soft` only; `--shadow-lift` on hover, never at rest
- **Sections:** same surface, separated by 1px `--line` hairlines — not alternating backgrounds

## Signature elements

- **Chapter folios:** large Newsreader numerals (01–08) on a hairline replace uppercase eyebrows.
  Mark them `aria-hidden`; the heading carries the meaning. Portal screens use `—`.
- **Motion:** one orchestrated moment (hero image settles from 1.04 over 900ms). All UI transitions
  are 150–250ms `ease-out`. `prefers-reduced-motion` removes animation; nothing hides until it runs.

## Components

### Buttons

- Primary: `bg-brand text-surface-raised`, 4px radius, min-height 48px (`sm` 40px), hover `bg-brand-deep`
- Secondary: transparent, `border-line`, `text-ink`, hover brand border + text
- Ghost: brand text, `bg-brand-soft/60` on hover
- Focus: `focus-ring` utility (2px brand outline, 2px offset)

### Cards

- `bg-surface-raised`, 1px `--line`, 4px radius
- Prefer hairline section blocks over boxed cards; when a card is used, vary size and image ratio
- Padding 24px (32px on feature cards)

### Inputs

- `bg-surface-raised`, 1px `--line`, 4px radius
- Min height 48px for touch
- Focus ring: 2px brand; invalid: `aria-[invalid=true]:border-danger`

### Navigation

- Sticky top, `bg-surface/92` with backdrop blur and a bottom hairline
- Links: muted, brand on hover/active
- Nav CTA uses the primary button at `sm` size

## Anti-patterns

- No pill buttons, gradients, gold accents, glassmorphism
- No dark mode — warm light only
- No cream + terracotta, near-black + acid accent, or purple gradient palettes
- No uppercase eyebrow above every heading (use the folio)
- No colouring one word of every headline
- No identical rounded-card rows; no `text-white` / `text-ink` on brand
- Do not use Geist or system fonts — Newsreader + Instrument Sans only

## Implementation in this repo

- Tokens live in `apps/web/app/globals.css` (`:root` + `@theme inline`)
- Brand rationale and the do-not list: `apps/web/BRAND.md`
- Shared primitives in `apps/web/components/ui/`
- Marketing sections in `apps/web/components/sections/`
- Cross-persona shells in `apps/web/components/shared/`
