# Build Plan — Homestay Platform MVP

*Based on PRD.md, ARCHITECTURE.md, and SECURITY.md (July 2026)*

---

## ⚠️ Phase 0 — Decisions to Lock Before Coding (Days 1–2)

These three inconsistencies across the docs will block work downstream if left unresolved:

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| D1 | **Product name** | PRD says *Stayos.com*, Architecture says */kiphaus* | Pick one; it affects repo name, domain, `NEXT_PUBLIC_APP_URL`, branding, and SEO metadata |
| D2 | **Who owns the database?** | Architecture says backend is external, yet the frontend repo has `lib/db.ts` + `DATABASE_URL` | If backend is truly external → remove direct DB access from frontend; all data flows through `/services` API clients. Frontend keeps only Firebase config |
| D3 | **Auth ↔ RLS bridge** | Security doc assumes Supabase-style `auth.uid()` RLS, but auth is Firebase | Either (a) backend verifies Firebase ID tokens and enforces authorization in the API layer, or (b) mint Supabase JWTs from Firebase custom claims. **(a) is simpler** given an external backend |

**Also confirm with the backend team:**
- API contract format (REST/GraphQL), base URL, and staging environment availability
- Who hosts uploaded images/documents (S3? Supabase Storage? Firebase Storage?)
- Payment gateway choice for subscriptions (Razorpay is the obvious fit for India)

**Deliverable:** A one-page `DECISIONS.md` + agreed API contract (even a draft OpenAPI spec or shared Postman collection).

---

## 🧱 Phase 1 — Foundations & Design System (Week 1)

Everything else builds on this layer.

1. **Repo & tooling setup**
   - Next.js (App Router) + TypeScript, ESLint/Prettier, folder structure per Architecture doc
   - Vercel project with preview deployments; env var scaffolding (`.env.example`)
2. **Neumorphism design system**
   - `globals.css` design tokens: color palette, shadow layers (raised/inset), radii, typography
   - `neumorphism.css` utility classes
   - Core primitives in `/components/ui`: Button, Card, Input, Select, Badge, Modal, Skeleton loader, Toast
   - A `/styleguide` dev-only page to visually QA every primitive (light backgrounds are critical for neumorphism — lock this early)
3. **Layout shell**
   - Header, Footer, responsive nav in `/components/layout`
   - Root `layout.tsx` with fonts, providers, metadata defaults

**Deliverable:** Deployed skeleton site with the full design system visible on `/styleguide`.

**Exit criteria:** Design tokens approved; primitives look right on mobile (majority of Indian traffic will be mobile).

---

## 🔍 Phase 2 — Public Guest Experience (Weeks 2–3)

The revenue story depends on hosts seeing guest traffic, so guest-facing pages come first.

1. **Landing page** — hero + search bar, featured verified stays, trust propositions, "List your property" CTA
2. **Search results** — city/date/guest filters, property cards with transparent pricing + Trust Badges, empty state ("No properties found in [City]…"), skeleton loaders
3. **Property details page** — image gallery (with blur-up placeholders + branded fallback image), amenities, host info, verification badges, price breakdown (no hidden fees)
4. **Trust Badge components** — the 5 badge levels (Identity, Property, Video, On-Site, Top Rated Host) as a reusable system with tooltips explaining each level
5. **Static pages** — About, Contact, Blog shell, Terms, Privacy, Cookies (`(legal)` and `(public)` route groups)
6. **SEO groundwork** — SSR metadata, OpenGraph tags, sitemap, structured data (LodgingBusiness schema) — this is *why* Next.js was chosen, so do it now, not later

**API dependency:** Needs `GET /properties` (search) and `GET /properties/:id` from backend. If the backend isn't ready, build against a **mock service layer** in `/services` with fixture data behind an interface — swap to real endpoints later without touching components.

**Deliverable:** A guest can search, browse, and view properties end-to-end (on mock or real data).

---

## 🔐 Phase 3 — Authentication (Week 4)

1. **Firebase setup** — phone OTP (primary) + Google OAuth (secondary)
2. **Auth pages** — `(auth)` group: login, signup, verify (OTP), forget, reset
   - OTP error handling per Security doc: "code incorrect or expired" message, never clear the phone input
3. **`useAuth` hook + session handling** — Firebase ID token attached to all `/services` API calls
4. **Route guards & role gating**
   - Unauthenticated: browse only; "Book via WhatsApp" prompts login
   - Guest role: WhatsApp contact, favorites, own profile
   - Host role: host routes; guests hitting `/host/dashboard` → redirect to "List your property" onboarding
5. **Gate the WhatsApp CTA** — reveal host contact / deep-link only post-login (per Security doc)

**Deliverable:** Full auth flows working on staging with role-based route protection.

---

## 💬 Phase 4 — WhatsApp Booking Flow (Week 4–5, overlaps Phase 3)

Small but *the* core conversion feature.

1. "Book via WhatsApp" button → `wa.me` deep link with pre-filled message (property ID, dates, guest count)
2. Click tracking (this is a primary success metric — instrument it from day one)
3. Fallback UX if host has no WhatsApp number on the listing

**Deliverable:** Logged-in guest taps "Book via WhatsApp" and lands in a pre-filled WhatsApp chat with the host.

---

## 🏠 Phase 5 — Host Onboarding & Verification (Weeks 5–7)

The most complex flow; hosts have low-moderate tech comfort, so keep every step simple.

1. **Host landing page** — Zero Commission pitch, plan comparison
2. **Registration** — phone OTP (reuses Phase 3), role upgrade to host
3. **Property onboarding wizard** — multi-step: details → photos (5MB limit, clear upload-error messaging) → pricing → WhatsApp number
   - Save-as-draft at every step (critical for this audience)
4. **Verification portal** — Aadhaar/PAN upload, utility bill upload, video walkthrough scheduling
   - Verification level tracker UI (Levels 0–4)
   - Unverified hosts: can save drafts, **Publish disabled** with prompt "Complete Level 1 Verification to make your property visible"
5. **Admin review surface (minimal)** — internal page for admins to approve/reject verification documents and suspend listings. Bare-bones is fine for MVP, but *someone* must be able to approve verifications or the trust ecosystem is dead on arrival

**API dependencies:** property CRUD, image upload, document upload, verification status endpoints.

**Deliverable:** A host can register, create a listing, submit verification docs, and get approved by an admin.

---

## 💳 Phase 6 — Subscriptions (Week 8)

1. **Plan selection UI** — Basic ₹1,999/yr vs Premium ₹4,999/yr comparison
2. **Payment integration** — Razorpay (or chosen gateway) checkout; webhooks handled by external backend (per RLS rule: subscriptions updated by system only)
3. **Subscription gating** — publish/premium features gated on active subscription status
4. **Status & renewal UI** — current plan, expiry date, renew CTA

**Deliverable:** Host pays, subscription activates, listing goes live.

---

## 📊 Phase 7 — Host Dashboard Lite (Week 9)

PRD marks full dashboard as V2, but hosts need a minimal home base at launch:

- My listings (edit, activate/deactivate)
- Verification status per property
- Subscription status
- Basic profile-visit counter (if backend supports it; otherwise stub)

**Deliverable:** Hosts self-serve listing management without support tickets.

---

## 🚀 Phase 8 — Hardening & Launch (Week 10)

1. **Error/edge-case sweep** against the Security doc checklist: API timeouts, slow connections (spinners/skeletons/blur-up everywhere), image fallbacks, form validation with field-level errors
2. **Performance** — Lighthouse pass, image optimization, Core Web Vitals (SEO ranking factor)
3. **Analytics** — funnel instrumentation for the PRD success metrics: WhatsApp clicks/property, visitor→contact conversion, verification-level attainment within first week
4. **Accessibility pass** — neumorphism is notoriously low-contrast; verify WCAG AA on text and interactive elements
5. **Security review** — env vars audited (no secrets client-side), Firebase rules, rate limiting on OTP requests (SMS cost abuse is real in India)
6. **Production deploy** — domain, Vercel production env, monitoring/error tracking (e.g., Sentry)

**Deliverable:** Production launch. 🎉

---

## Summary Timeline (~10 weeks, 1–2 frontend devs)

| Week | Phase |
|------|-------|
| 0 | Decisions (D1–D3) + API contract |
| 1 | Foundations & design system |
| 2–3 | Public guest experience |
| 4 | Auth + WhatsApp booking |
| 5–7 | Host onboarding & verification |
| 8 | Subscriptions & payments |
| 9 | Host dashboard lite |
| 10 | Hardening & launch |

## Top Risks

1. **External backend readiness** — biggest schedule risk. Mitigate with the mock service layer (Phase 2) so frontend never blocks.
2. **Verification ops** — badges are the product's trust promise; without a working admin approval flow + on-site process, verified inventory won't exist at launch. Start recruiting/verifying the first 100 hosts *during* the build, not after.
3. **OTP costs & abuse** — rate-limit Firebase phone auth early.
4. **Neumorphism accessibility** — low contrast can hurt usability for the 30–60 host demographic; test with real users early.
5. **WhatsApp dependency** — booking happens off-platform, so conversion tracking ends at the click. Consider a lightweight "did you book?" follow-up later.

## What Stays Out (per PRD)

In-app payments for guest bookings, native mobile apps, internal messaging — resist scope creep on all three.
