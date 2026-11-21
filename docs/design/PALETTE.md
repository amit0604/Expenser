# Expenser Palette — “Evergreen Fortune”

Expenser should feel calm, private, and prosperous — not like a neon trading app
or a generic blue bank portal. The palette combines deep forest tones (stability,
privacy, long-term thinking), emerald (growth and thriving), champagne gold
(wealth and achievement), and warm ivory/sage (calm, human, trustworthy).

## Tokens

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#07140F` | App background, auth-page background |
| `surface` | `#0C1F17` | Cards, panels, sidebar |
| `surface-raised` | `#11291F` | Inputs, hovered rows, elevated cards |
| `line` | `#1E3A2D` | Borders and dividers |
| `line-strong` | `#2A4D3A` | Focus rings, stronger separators |
| `ivory` | `#F4F0E6` | Primary text on dark surfaces |
| `sage` | `#A3B8AC` | Secondary text, labels, hints |
| `growth` | `#34D399` | Primary accent, positive values, charts |
| `growth-deep` | `#10B981` | Filled buttons, active states |
| `wealth` | `#D9B96A` | Champagne-gold accent, premium highlights |
| `wealth-soft` | `#F0DFAE` | Gold text on dark, subtle highlights |
| `warning` | `#E8B86D` | Warnings, pending states |
| `danger` | `#E07A5F` | Errors and destructive actions (warm terracotta) |

## Chart sequence

1. `#34D399` — growth emerald
2. `#D9B96A` — champagne gold
3. `#5EEAD4` — soft teal
4. `#E07A5F` — terracotta
5. `#A3B8AC` — sage
6. `#F0DFAE` — soft gold

## Rules

- Prefer ivory or sage for body copy; reserve gold for accents and highlights.
- Use gold sparingly. A little champagne reads as wealth; a lot reads as a casino.
- Filled primary buttons use dark canvas text on `growth`/`growth-deep`.
- Use warm terracotta for destructive states instead of a harsh primary red.
- Keep large surfaces deep and low-contrast; let emerald and gold carry emphasis.
- Target WCAG AA contrast for all text and interactive states.
- No external font or analytics requests; use the system sans stack and Georgia
  for restrained display serif moments.

## Tailwind theme

The tokens are exposed as Tailwind v4 theme variables in
`apps/web/src/index.css`, so components use `bg-canvas`, `bg-surface`,
`border-line`, `text-ivory`, `text-sage`, `text-growth`, `text-wealth`, and
friends instead of raw slate/emerald classes.
