# Kiphaus — Feature Plan

Verified Stays. Direct Bookings. Better Earnings.

India's marketplace for homestays, villas, farm stays, and heritage homes — direct host-to-guest bookings, zero commission, four-level verification, WhatsApp-native communication.

## 1. Snapshot

| | Airbnb | Booking.com | MakeMyTrip | **Kiphaus** |
|---|---|---|---|---|
| India-focused | ❌ | ❌ | ✅ | ✅ |
| Direct host communication | Limited | Limited | Limited | ✅ (WhatsApp-native) |
| Zero-commission model | ❌ | ❌ | ❌ | ✅ (subscription-based) |
| Multi-level verification | ⚠️ | ⚠️ | ⚠️ | ✅ (4 levels) |
| Host-first economics | ❌ | ❌ | ❌ | ✅ |

Revenue model: hosts pay a flat annual subscription (Basic ₹1,999 / Premium ₹4,999), not a per-booking cut. Guest never pays a platform fee. This is the core structural difference from every row above it, and it drives most of the feature list below — verification and trust have to do the work that OTA lock-in and review-gating normally do.

## 2. Roles

- **Guest** — searches, contacts hosts, books, reviews.
- **Host** — lists properties, manages availability/pricing, responds to inquiries, subscribes.
- **Admin/Ops** — runs verification queues, moderates listings, tracks city-launch targets.
- **Field Verification Agent** (Phase 1+) — executes on-site inspections, feeds Level 4 verification.
- **Support Agent** (Phase 2+) — host help center, dispute handling.

## 3. Feature Map

### 3.1 Discovery & Search (Guest)

- Search by city/location, date range, guest count.
- Filters: property type (homestay / villa / farm stay / heritage home), price range, verification level, amenities, host responsiveness, instant-WhatsApp vs request-only.
- List view + map view toggle.
- Sort: relevance, price, rating, "most verified first."
- Wishlist / save property (requires guest account).
- SEO destination landing pages — prioritize by real listing density: Goa, Mumbai, Delhi NCR/Gurugram, Hyderabad first (highest existing Airbnb concentration in India), then Jaipur, Manali, Rishikesh, Udaipur, Coorg as Phase 3 lands.

### 3.2 Property Listing Page

- Photo gallery + embedded video walkthrough (the Level 3 verification asset, reused as a trust-building feature, not just a compliance artifact).
- Description, amenities, house rules, cancellation policy.
- **Price shown as one all-in number from the first view** — nightly rate + any cleaning fee + taxes, no reveal-at-checkout step. This is a direct fix for the "₹4,000 becomes ₹6,000–7,000" complaint in the problem statement and should be treated as a non-negotiable pattern, not a nice-to-have.
- Availability calendar (host-managed).
- Trust badge row, rendered with the same visual weight as the price — not a small icon strip at the bottom.
- Host profile card: name/photo, response rate & average response time, "Top Rated Host" / "Super Responsive Host" badges, other listings by the same host.
- Location: approximate pin pre-booking, exact address released after confirmation (standard safety pattern).
- Reviews: rating breakdown (cleanliness, accuracy, communication, value, location) + host replies.
- Similar/nearby stays.
- Primary CTA: **WhatsApp booking button** — deep link opens a pre-filled inquiry message to the host's number. Secondary CTA: in-platform "Request to Book" form for guests without WhatsApp or who want a paper trail.

### 3.3 Booking / Inquiry Flow

- Guest submits dates, guest count, message.
- Two paths:
  - **WhatsApp handoff (MVP default)** — inquiry opens a WhatsApp thread with the host directly; Kiphaus logs that an inquiry happened but the negotiation and confirmation happen host-to-guest.
  - **In-platform Request-to-Book (Phase 2+)** — for hosts who want calendar holds enforced by the platform rather than manual WhatsApp back-and-forth.
- Booking status states: `Inquiry sent → Host responded → Confirmed → Completed → Reviewed` (or `Cancelled` / `Expired` if the host doesn't respond in X hours — this window feeds the "Super Responsive Host" badge).
- Cancellation policy shown per-listing (flexible / moderate / firm), host-defined.
- Post-confirmation: automated check-in instructions reminder, pre-arrival nudge.

### 3.4 Guest Account

- Profile, optional lighter-weight ID verification (mobile OTP is enough; full Aadhaar/PAN is a host-only requirement).
- Saved/wishlisted stays, inquiry & booking history, reviews written.
- Message thread log — read-only mirror of WhatsApp conversations for reference.

### 3.5 Reviews & Trust Signals

- Post-stay review prompt, gated to guests with a completed booking (prevents fake reviews — directly answers the "trust issues" problem statement).
- Rating breakdown by category (cleanliness, accuracy, communication, value, location) + free-text.
- Host can respond publicly to a review.
- Host response-rate/time tracked automatically from inquiry timestamp to first reply, feeding the responsiveness badge.

### 3.6 Verification Framework (the core differentiator — build this before polishing anything else)

| Level | What it checks | Mechanism |
|---|---|---|
| 1 — Identity | Host is a real, contactable person | Aadhaar/PAN verification, mobile OTP, email auth |
| 2 — Property | Host actually has rights to the property | Ownership docs / utility bill / rental agreement upload → admin review queue |
| 3 — Video | Property matches its listing | Guided video walkthrough, reviewed against a checklist |
| 4 — Physical | On-the-ground confirmation | Field-agent site visit, inspection report, unlocks "Premium Verified" badge |

- Host-facing verification status tracker: what's done, what's pending, what failed and why, with an appeal/resubmit path.
- Badges issued per level, displayed as a set: Identity Verified · Property Verified · Video Verified · On-Site Verified · Top Rated Host · Super Responsive Host.
- Re-verification cadence (proposed: annual, tied to subscription renewal so it's one habit for the host, not two).

### 3.7 Host Onboarding & Listing Management

- Registration (individual or business), with a local-language-friendly onboarding path and a lightweight GST guidance step (both explicitly named as host pain points).
- Listing wizard: property type → photos → amenities/house rules → pricing & availability → kick off verification.
- Multi-listing support gated to Premium plan; Basic plan is single-property.
- Pricing tools: weekday/weekend/seasonal rates, availability calendar.

### 3.8 Host Dashboard

- Inquiry/booking inbox — mirrors the WhatsApp thread so nothing lives only in a personal phone.
- Analytics: listing views, inquiry-to-booking conversion, earnings summary (informational; Kiphaus does not process the stay payment itself).
- Verification status widget.
- Subscription management: current plan, renewal date, upgrade/downgrade.
- Help/support access.

### 3.9 Monetization (host-facing)

- **Basic — ₹1,999/yr**: single listing, WhatsApp integration, basic visibility.
- **Premium — ₹4,999/yr**: multiple listings, featured placement, enhanced analytics, premium verification badge.
- Phase 2+ add-on revenue: Featured Listing boosts, Professional Photography packages, Property Management service referrals, Cleaning/Maintenance marketplace, Experiences/tours, destination/hospitality ad partnerships.
- Subscription billing needs a payment gateway (UPI-first, e.g. Razorpay) — this is the one place Kiphaus does handle money, separate from the "zero commission on stays" promise. Keep that boundary explicit in the UI copy so it doesn't read as a contradiction.

### 3.10 Messaging & Notifications

- WhatsApp Business API as the primary channel: templated messages for inquiry, confirmation, pre-arrival reminder, post-stay review request.
- In-platform read-only thread mirror for record-keeping and dispute resolution.
- Email for receipts and verification-status changes; SMS for OTP; push notifications deferred until/if a companion app ships.

### 3.11 Admin / Ops Panel

- Verification review queues: identity, property docs, video, physical-inspection scheduling and field-agent assignment.
- Listing moderation: fake-listing and duplicate detection, photo quality gate.
- Subscription/billing oversight, dispute and complaint handling.
- City-launch dashboards tracking GTM targets (properties live vs. phase target, guest/host funnel conversion).

### 3.12 Growth Surfaces

- Referral program (host-gets-host, guest-gets-guest).
- SEO destination/city landing pages.
- Content hub aligned with the stated Instagram/YouTube/influencer acquisition strategy.

## 4. Roadmap, phased to the stated GTM

| Phase | Scope | Property target | Unlocks |
|---|---|---|---|
| 0 — MVP | Pre-launch build | — | Listings, city search, WhatsApp booking button, host registration, Level 1-2 verification, partial trust badges, basic host dashboard |
| 1 — Gurgaon | Single-city launch | 100 | Full Level 1-4 verification incl. physical inspection ops, reviews, host analytics v1, admin ops panel v1, subscription billing live |
| 2 — Delhi NCR | Regional expansion | 500 | In-platform Request-to-Book, Featured Listings, referral program, host help center |
| 3 — Tourist destinations | Jaipur, Goa, Manali, Rishikesh, Udaipur, Coorg | — | SEO destination pages, professional photography add-on, experiences marketplace, multi-language onboarding |
| 4 — Pan-India | National scale | 10,000+ | Property management service, cleaning/maintenance marketplace, ad partnerships, AI pricing recommendations, occupancy forecasting, smart host dashboard |

## 5. Data model sketch

`User` (role: guest / host / admin / field_agent) · `Property` · `VerificationRecord` (level, status, docs, reviewer, timestamps) · `Booking/Inquiry` (status enum from 3.3) · `Review` · `Subscription` (plan, status, renewal_date) · `MessageThread` (WhatsApp mirror) · `Payment` (subscription billing only, not stay payments).

## 6. Tech stack alignment

Repo already runs Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui. The brief calls for Node / PostgreSQL / Firebase Auth / WhatsApp Business API — Next.js's own server layer (Route Handlers, Server Actions) can serve as that "Node backend" rather than standing up a separate service, unless there's a reason to split them out. Firebase Auth matches the brief; NextAuth is the more Next.js-native alternative if that's preferred instead.

## 7. Open decisions (resolve before build starts)

- **Payment/escrow scope** — does Kiphaus ever touch stay-payment money (e.g. a protected deposit), or is guest→host payment 100% off-platform with Kiphaus only billing subscriptions? This changes compliance/PCI scope materially.
- **Auth provider** — Firebase (per brief) vs. NextAuth.
- **Admin panel placement** — **[RESOLVED]** Will be built as a separate application/subdomain. Skipped in this repository.
- **i18n timing** — which regional languages, and at what phase (host "local language onboarding" is named as a day-one need, but full i18n is scoped here to Phase 3).
- **WhatsApp integration path** — Meta Cloud API directly vs. a BSP (Gupshup, Interakt, etc.) — affects Phase 0 cost and lead time.

## 8. Airbnb reference audit (live check, 2026-07-12)

Pulled Airbnb's current homepage, a Gurugram listing page, and Gurugram search results to check this plan against what's actually shipped today, not a remembered version.

**Confirms already in this plan:**
- Airbnb just rolled out "one price for your trip, all fees included" as a headline product change (interstitial modal on search, "Prices include all fees" badge on every card and listing). Transparent all-in pricing is no longer a Kiphaus differentiator over Airbnb specifically — it's now table stakes across the category. Kiphaus's edge is that it never needed the fix: no algorithmic fee layer to begin with.
- Approximate map pin pre-booking, exact address withheld until confirmed — matches 3.2 as written.
- Review category breakdown, host response-rate/time badge, Superhost-style tiering — matches 3.5/3.6 pattern.
- Listing page structure (gallery → quick facts → sticky price/booking card → description → amenities → calendar → reviews → map → host card → house rules/cancellation/safety → nearby listings) is a validated skeleton for 3.2's build order.

**Gap to fold in:**
- Airbnb's review breakdown has 6 categories, not 5: cleanliness, accuracy, **check-in**, communication, location, value. 3.5 should add check-in as its own rated category (it maps directly to whether a WhatsApp-coordinated check-in actually went smoothly, which is exactly the kind of friction Kiphaus needs visible).

**Risk to flag, not just a difference:**
- Airbnb shows a persistent inline warning on the host card: *"To help protect your payment, always use Airbnb to send money and communicate with hosts."* That's Airbnb actively fighting off-platform contact — because off-platform deals are where scams, no-shows, and unrefundable payments happen with no dispute trail. Kiphaus's WhatsApp-first model is the opposite of that by design (3.3/3.10), which is the whole zero-commission pitch — but it inherits the exact fraud/dispute exposure Airbnb is guarding against. Worth deciding explicitly (not by default) whether Kiphaus needs any of: an in-platform inquiry log as evidence-of-record (already scoped in 3.10), a guest-side "never pay a host before verifying X" trust-education moment on the booking screen, or a lightweight dispute-mediation path in the admin panel (3.11) for host-guest conflicts that happened entirely over WhatsApp.

