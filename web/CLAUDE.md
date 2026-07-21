# CLAUDE.md

## Design Context

See `PRODUCT.md` and `DESIGN.md` at the project root before any design work.

- **Register:** product (app UI serves the product — guest booking flows, host dashboards, verification tracking — not a marketing site).
- **Brand:** Kiphaus, India's verified marketplace for homestays/villas/unique stays.
- **DESIGN.md is resolved** — "Sequence" style: near-white editorial canvas, TWK Lausanne/Inter sans, one violet accent (`#a565ff`), hairline borders, pill buttons. Synced into `app/globals.css` (colors, radii, shadows, type scale) 2026-07-21. This superseded an earlier navy/seafoam "institutional trust, anti-Airbnb" direction that this file used to describe — that direction is no longer current; don't reintroduce it without checking with the user first.
- **Known prior art to re-check:** [components/layout/header.tsx](components/layout/header.tsx) and [components/features/guest/listing-card.tsx](components/features/guest/listing-card.tsx) were flagged as an Airbnb-shaped clone (pill search, rounded-full nav, coral `#ff385c` accent) under the old direction. The coral accent is gone (retheme fixed that), but pill/rounded-full shape is no longer off-brand — Sequence's own component spec prescribes pill buttons/nav. Re-audit against DESIGN.md rather than assuming these still need a rebuild.
- Once components are audited against the current tokens, re-run `/impeccable document` in scan mode to confirm DESIGN.md still matches.
