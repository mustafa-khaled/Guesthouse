# Serene Stays — Brand Sheet

The short version. Everything here is already encoded in `app/globals.css`; treat that file as the
source of truth and this page as the reasoning.

## Position

A garden retreat for rest and renewal. Warm, quiet, editorial — a printed hotel monograph rather
than a booking funnel. Copy is unhurried and concrete; never luxury-vague, never salesy.

## Palette — "Refine Matcha"

Light only. No dark mode, no accent colour, no gradients.

| Token              | Hex       | Role                                    |
| ------------------ | --------- | --------------------------------------- |
| `--surface`        | `#F6F2E8` | Page background (oat)                   |
| `--surface-raised` | `#FCFAF4` | Cards, inputs, anything lifted (paper)  |
| `--brand`          | `#314535` | Primary actions, footer CTA (matcha)    |
| `--brand-deep`     | `#243428` | Hover / pressed brand                   |
| `--brand-soft`     | `#DBF2D0` | Quiet highlight blocks, selected states |
| `--ink`            | `#222E25` | Headings and primary copy (bark)        |
| `--ink-muted`      | `#55654D` | Secondary copy, labels (fern)           |
| `--line`           | `#C8D4BC` | Hairline dividers and borders           |
| `--line-strong`    | `#A9B99F` | Hover borders, stronger rules           |

Status colours (`--success`, `--warning`, `--danger`, `--info`) each ship with a `*-tint` partner
for badge backgrounds. Body copy on oat is `#222E25` (~12:1); muted copy is `#55654D` (~5.6:1);
primary buttons are paper on matcha (~9:1).

## Type

Self-hosted, latin subset, in `public/fonts/`.

- **Display — Newsreader** (400/500, italic available). Headings are measured, never bold.
  `--text-display` for the hero, `--text-title` for page titles, `--text-heading` for sections.
- **UI — Instrument Sans** (400/500/600). Body, labels, tables, buttons.
- **Numbers** use `.tabular` so prices and dates align in columns.

## Spacing, shape, depth

- 8px baseline: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96.
- Section rhythm: `py-20` mobile, `md:py-28` desktop.
- Radius is 4px everywhere (`--radius`). Nothing pill-shaped.
- Shadows are barely there: `--shadow-soft` for cards, `--shadow-lift` on hover only.
- Sections share one surface and are separated by hairlines, not alternating fills.

## Signature

**Chapter folios.** Sections are numbered 01–08 in large Newsreader numerals sitting on a hairline,
replacing the uppercase eyebrow that every hotel site uses. The number is `aria-hidden`; the real
heading carries the meaning. Guest-facing and portal screens use an em dash (`—`) in the same slot
so the language stays consistent without pretending a page has chapters.

**One orchestrated motion moment:** the hero image settles from a 1.04 scale over 900ms. Everything
else is 150–250ms ease-out. `prefers-reduced-motion` disables all of it, and no content waits on an
animation to become visible.

## Voice

Plain sentences, second person, no exclamation marks. Name the thing ("Garden spa", "Horizon Suite")
instead of describing its aura. Empty states tell the guest what will appear and when.

## Do not

- Cream + terracotta, near-black + acid accent, purple gradients.
- Identical rounded cards in a row; vary with hairlines, offsets, and image ratios.
- An ALL-CAPS eyebrow above every heading (use the folio).
- Colouring one word of every headline.
- Pill buttons, gold accents, glassmorphism, dark mode.
