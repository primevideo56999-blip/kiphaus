# UI/UX Polish, Motion, Widgets & Cleanup — Design

**Date:** 2026-07-17
**Status:** Approved for planning

## Context

Kiphaus's guest, host, auth, and public/legal surfaces are all built against the
"Portal" design system in `DESIGN.md` (pill radius scale, coral `#e8562b`
accent, Perfectly Nineties serif headlines, glow-ring elevation). A prior
session flagged the live site as visually close to Airbnb (segmented pill
search bar, heart/star/price property card, rounded-full nav) and noted that
fixing it would require reshaping components, not just retinting — see
[[kiphaus-design-airbnb-similarity]] in project memory.

This session's user decision: **keep the current Portal shape as-is.** This
spec does not touch the structural DNA the prior session flagged — search
bar, property card skeleton, pill button radius, nav shape all stay. Scope
here is polish, motion, two real widgets currently stubbed as placeholders,
and file cleanup.

Confirmed during exploration (2026-07-17):

- `motion` (Framer Motion's current package name) is already a dependency —
  no new animation library needed.
- Property detail page (`app/(guest)/rooms/[id]/page.tsx`) has two literal
  placeholder boxes: `Calendar Widget Placeholder` (line 133) and
  `Map View Placeholder` (line 238).
- `Property` type (`types/index.ts`) has no `lat`/`lng` fields; no maps API
  key exists anywhere in the repo.
- 6 test files remain in the tree (rest were deleted in an earlier session):
  `app/(guest)/rooms/[id]/page.test.tsx`, `app/(guest)/s/page.test.tsx`,
  `components/ui/button.test.tsx`, `lib/mock-data.test.ts`,
  `lib/utils.test.ts`, `lib/whatsapp.test.ts`.
- All untracked (`??`) components from the prior session
  (`account-nav.tsx`, `trip-card.tsx`, `whatsapp-thread-row.tsx`,
  `write-review-modal.tsx`) are wired into pages — nothing orphaned.
- `components/{features,layout,shared,ui}/.gitkeep` files are stale now that
  those directories are populated.

## Decisions Locked This Session

1. **Design shape unchanged.** No rebuild of search bar, property card,
   nav capsule, or the pill/coral/serif token set. Improvements are additive:
   motion, spacing/interaction polish, empty/loading states, real widgets.
2. **Map widget = real interactive map**, not a static placeholder. Add
   `lat`/`lng` to `Property` and `mock-data.ts`, use `react-leaflet` +
   `leaflet` against free OpenStreetMap tiles (no API key required).
3. **Calendar widget = real date-range picker**, reusing the existing
   `Calendar` (react-day-picker) component already used in `search-bar.tsx`,
   wired to the property detail page's pricing display.
4. **Test files are being removed, not migrated.** This pass does not
   reintroduce automated tests. Verification going forward is manual
   (dev server + browser) via the project's `verify` skill, run at the end of
   each phase below.
5. **Cleanup scope = code/test artifacts only.** Stale prose docs
   (`docs/ARCHITECTURE.md`, `docs/PRD.md`, `docs/BUILD-PLAN.md` — see
   [[kiphaus-doc-drift]]) are out of scope for this pass; not touched here.

## Approach

Three shapes considered:

- **A. Flat task list** — every task queued, agents pull independently.
  Rejected: risks duplicate/divergent motion patterns before a shared
  convention exists.
- **B. Phased, dependency-ordered (chosen)** — cleanup, then a shared motion
  primitives kit and the two widgets, then parallel page sweeps by area, then
  a verification pass.
- **C. Component-kit-first only** — build the motion kit and stop. Rejected:
  doesn't cover "anything you can improve" across actual pages.

**B** is chosen because the motion primitives and the widgets are shared
dependencies — building them first means the page-sweep phase can run several
agents in parallel without them stepping on each other or reinventing the
same fade/stagger pattern differently per page.

## Phases

### Phase 0 — Cleanup

- Delete the 6 remaining test files listed above.
- Remove test tooling from `package.json`: `vitest`, `@testing-library/*`,
  `jsdom`, the `test`/`test:watch` scripts, and any `vitest.config.*` /
  test setup file.
- Delete stale `.gitkeep` files in populated `components/*` subdirectories.
- Runs alone, first — nothing else should race file/dependency deletion.

### Phase 1 — Widgets

- **Calendar**: replace the placeholder `<div>` in
  `app/(guest)/rooms/[id]/page.tsx` with the shared `Calendar` component in
  range mode, wired so selecting dates updates the visible price
  calculation on the page (mirrors the pattern already in `search-bar.tsx`).
- **Map**: add `lat: number` / `lng: number` to the `Property` type and to
  every property entry in `lib/mock-data.ts` (real coordinates for each
  mock city). Add `react-leaflet` + `leaflet` as dependencies. Replace the
  placeholder `<div>` with a Leaflet map centered on the property's
  coordinates, OSM tile layer, single marker styled to the brand palette
  (coral pin, no default Leaflet blue). Leaflet's CSS must be imported
  once globally; map container needs an explicit height (reuse the
  existing `h-[480px]` sizing already on the placeholder).
- Runs alone, after cleanup — touches the shared `Property` type that later
  phases' components may read.

### Phase 2 — Motion primitives kit

- New `components/motion/` (or equivalent) module built on `motion`:
  fade/slide-up entrance, scroll-triggered reveal, list-stagger container,
  hover-lift, and shared transition/easing constants so every page pulls
  from the same values instead of inventing timings.
- All primitives respect `prefers-reduced-motion` (PRODUCT.md's WCAG 2.1 AA
  requirement) — reduced-motion users get instant/no-op transitions, not a
  smaller version of the animation.
- Runs alone, after widgets — page-sweep agents in Phase 3 depend on this
  kit's API and shouldn't start before it's stable.

### Phase 3 — Page sweeps (parallel by area)

Each area gets: motion primitives applied (page-load entrance, scroll
reveals below the fold, list stagger on card grids), hover/press
micro-interactions on interactive elements, empty-state and loading-state
polish (extend the `loading.tsx` pattern already present on 2 routes to
routes that lack it), and general spacing/interaction rough-edge fixes. No
structural/shape changes.

- **3a — Guest**: landing (`app/page.tsx`), search (`/s`), property detail
  (`/rooms/[id]`, `/rooms/[id]/book`), account, messages, trips, wishlists
- **3b — Host**: dashboard, onboarding, properties (list/new/edit),
  subscription, verification
- **3c — Auth**: login, signup, verify, forgot-password, reset-password
- **3d — Public/Legal + shared chrome**: about, blog + `[slug]`, contact,
  cookies, policy, terms, `site-header`, `site-footer`, `logo`

These four run in parallel — they don't share files with each other, only
with the Phase 2 kit.

### Phase 4 — Verification

Dev server + manual click-through of each area's golden path (search →
property detail → book; host onboarding → dashboard; auth login/signup)
using the `verify` skill. Check `prefers-reduced-motion` behavior and that
`typecheck`/`lint`/`build` still pass after test tooling removal.

## Agent Orchestration

One specialized subagent per phase/area, general-purpose agent type with a
role brief:

| Phase | Agent(s) | Concurrency |
|---|---|---|
| 0 | cleanup agent | alone |
| 1 | widget-developer agent | alone |
| 2 | motion/animation-developer agent | alone |
| 3 | 4× frontend-developer agents (guest / host / auth / public+chrome) | parallel |
| 4 | verification (main thread, `verify` skill) | after 3 completes |

Gate order is strict: 0 → 1 → 2 → 3 (parallel) → 4. Each phase's diff is
reviewed before the next phase starts.

## Error Handling / Risk Notes

- Leaflet requires `window`/DOM at render time — map component must be
  client-only (`"use client"` + dynamic import with `ssr: false`) to avoid
  Next.js server-render crashes.
- Removing vitest/testing-library must not break `npm run build` or
  `npm run typecheck` — Phase 0 ends with a typecheck run before Phase 1
  starts.
- Motion primitives must not introduce layout shift (CLS) — entrance
  animations should animate opacity/transform only, never
  width/height/margin.

## Out of Scope

- Any change to search bar / property card / nav shape (explicit user
  decision this session).
- Stale doc content fixes (`ARCHITECTURE.md`, `PRD.md`, `BUILD-PLAN.md`).
- Reintroducing automated tests.
- Real geocoding/reverse-geocoding — mock coordinates are hand-picked per
  city, not looked up.
