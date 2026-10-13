# Design system direction

BRIGHTHOMES will feel architectural, premium, and professional: charcoal or near-black foundations; warm white surfaces; stone/concrete neutrals; and a restrained bronze or gold accent.

It will use a display serif with a modern sans-serif, generous spacing, editorial layouts, strong imagery, and subtle motion that honours reduced-motion preferences.

## Mobile app (Phase 2C/2D redesign)

- **Type:** Cormorant Garamond (500, 500 italic, 600) for editorial headings and numerals, with lining figures for statistics; Inter (400/500/600) for body text, labels, buttons and navigation. Buttons and eyebrow labels are uppercase Inter with wide tracking.
- **Colour:** semantic tokens in `mobile/src/theme/palette.ts` for light (warm ivory, charcoal, stone) and dark (near-black, warm off-white, stone-grey) schemes, with one bronze accent. All text tokens meet WCAG AA (4.5:1) on every background token; `accent` is reserved for rules, icons and large type.
- **Form:** square corners, hairline rules, numbered editorial lists, full-bleed photography under gradient scrims, minimal cards (photo plus text, no borders or shadows), and an always-dark band for the track record.
- **Status:** always written out beside a small square marker; colour is never the only signal. Temporary content carries an "Illustrative" tag and makes no price, location, availability or completion claim.
- **Motion:** image cross-fades, a one-time fade-up on hero copy, press feedback and a settle on save. All of it is disabled when the device asks to reduce motion.

The website keeps its Phase 2B type (Instrument Serif + Manrope) until its own redesign.

The product must avoid generic SaaS styling and generic property-marketplace styling.
