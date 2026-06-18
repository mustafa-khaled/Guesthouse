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

| Token | CSS variable | Hex | Usage |
|---|---|---|---|
| Surface | `--matcha-surface` | `#F6F2E8` | Page and content backgrounds |
| Section Surface | `--matcha-section` | `#DBF2D0` | Spa/wellness highlight sections |
| Brand | `--matcha-brand` | `#314535` | Primary actions, nav, brand anchors |
| Brand Medium | `--matcha-brand-medium` | `#AEC2A4` | Card fills, quiet accents, borders |
| Heading | `--matcha-heading` | `#2B3A2E` | Display and section headings |
| Body | `--matcha-body` | `#4A5547` | Paragraphs, labels, UI copy |
| Border | `--matcha-border` | `#C8D4BC` | Dividers, card borders |
| Shadow | `--matcha-shadow` | `rgba(43, 58, 46, 0.08)` | Card elevation |

## Typography

- **Headings / display:** Noto Serif, medium weight (500), measured not bold
- **Body / UI:** Noto Sans, regular (400) and medium (500) for emphasis
- **Scale:** 14 / 16 / 18 / 24 / 32 / 40 / 48px
- **Line height:** 1.6–1.7 for body; 1.2–1.3 for headings
- **Labels:** uppercase tracking-wide at 12–13px for section eyebrows

## Spacing and shape

- **Grid:** 8px baseline (8, 16, 24, 32, 48, 64, 80, 96)
- **Section padding:** 64px mobile, 96px desktop vertical; 24px horizontal mobile, 32px desktop
- **Border radius:** 4px on cards, inputs, buttons (crisp, not pill)
- **Shadows:** light only — `0 1px 3px var(--matcha-shadow), 0 4px 12px var(--matcha-shadow)`
- **Sections:** same surface color; separate with 1px dividers, not alternating backgrounds

## Components

### Buttons

- Primary: brand background, white text, 4px radius, min-height 48px, gentle raise on hover
- Secondary: transparent with brand border, brand text
- Ghost: brand text only, underline on hover
- Focus: 2px brand outline offset 2px

### Cards

- White or brand-medium tint background
- 1px border `--matcha-border`
- 4px radius, light shadow
- Padding 24px (32px on desktop feature cards)

### Inputs

- White background, 1px border, 4px radius
- Min height 48px for touch
- Focus ring: 2px brand

### Navigation

- Sticky top, surface background with subtle bottom border
- Links: body color, brand on hover/active
- CTA button in nav uses primary button style

## Anti-patterns

- No pill buttons, no heavy gradients, no gold accents
- No dark mode toggle — Matcha is warm light only
- No alternating section background colors except intentional `--matcha-section` blocks
- Do not use Geist or system fonts — use Noto Serif + Noto Sans only

## Implementation in this repo

- Tokens live in `src/app/globals.css` as CSS custom properties
- Shared primitives in `src/components/ui/`
- Page sections in `src/components/sections/`
- Use Tailwind `@theme inline` to map tokens to utility classes
