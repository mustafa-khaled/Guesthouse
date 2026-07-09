---
name: serene-stays-hotel
description: Serene Stays luxury hotel landing page patterns. Use when building or extending hotel pages, booking UI, spa sections, wellness packages, or marketing content for this project.
---

# Serene Stays Hotel — Agent Instructions

Project-specific UI/UX patterns for the premium hotel booking site.

## Brand voice

- Calm, warm, editorial, trustworthy — never urgent or discount-driven
- Sensory copy: light, texture, rhythm, stillness
- CTAs: "Check availability", "Reserve your ritual", "Explore packages" — not "Book now!"

## Page structure (landing)

Build sections in this order:

1. **Navbar** — logo, Suites, Spa, Packages, Experiences, Book your stay CTA
2. **Hero** — headline, subcopy, stat row, booking panel (Stay | Spa | Packages tabs)
3. **Experience paths** — Rest & Restore, Celebrate, Reconnect, Renew
4. **Wellness packages** — Essential, Signature (highlighted), Transform tiers
5. **Spa** — treatment cards with duration and sensory descriptions
6. **Guest stories** — short quotes with names
7. **Trust strip** — cancellation, best rate, 24/7 concierge
8. **FAQ** — booking, spa, packages
9. **Footer** — contact, links, concierge

## Booking panel pattern

- Segmented control: Stay | Spa | Packages
- Fields: check-in date, guests (Stay); treatment + time (Spa); package tier (Packages)
- Helper text below fields (e.g. flexible cancellation)
- Single primary CTA per panel state
- Mobile: stack fields, sticky bottom bar optional on inner pages

## Component file conventions

```
src/components/ui/          → reusable Matcha primitives
src/components/sections/    → one file per landing section
src/lib/content.ts          → static copy and data
src/app/page.tsx            → compose sections only, no inline styles
```

## Code standards

- Next.js App Router, TypeScript, Tailwind CSS v4
- Server components by default; `"use client"` only for interactive booking panel, FAQ accordion, mobile nav
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Images: use placeholder gradients or unsplash URLs with meaningful alt text
- Accessibility: 44px+ touch targets, visible focus, proper heading hierarchy

## When extending

- New pages must reuse Matcha tokens from `globals.css` — never hardcode hex outside token file
- New sections follow existing spacing rhythm and divider pattern
- Read `typeui-fundamentals` before shipping any UI change
