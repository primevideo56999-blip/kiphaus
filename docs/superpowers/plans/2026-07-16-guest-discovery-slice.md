# Guest Discovery Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the guest-facing discovery path (landing → search → property detail) against `DESIGN.md`'s Portal system and `lib/mock-data.ts`, with the WhatsApp/wishlist CTA stub-gated behind a login modal.

**Architecture:** Next.js 16 App Router with Server Components for data-driven pages (`app/page.tsx`, `app/(guest)/s/page.tsx`, `app/(guest)/rooms/[id]/page.tsx`) and Client Components only where interactive (search bar, filters, gallery lightbox, gate modal). Shared presentational components live in `components/features/guest/` and `components/layout/`; shared types in `types/index.ts`; mock data and search/filter logic in `lib/mock-data.ts`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui components built on `@base-ui/react` (uses a `render` prop for composition, not Radix's `asChild`), Vitest + React Testing Library for unit tests, Playwright MCP for browser verification.

## Global Constraints

- Design tokens: `DESIGN.md`'s Portal system only (`--color-signal-blue` `#007aff` is the one chromatic accent; introduce no new colors). Buttons are 50px-radius pills; cards 22-30px radius; glow-ring elevation, never drop shadows.
- Base UI composition: use `render={<Element .../>}` on the primitive plus separate `children` for content (see `components/ui/dialog.tsx`'s `DialogClose` for the reference pattern) — this codebase does not use Radix `asChild`.
- WCAG 2.1 AA: keyboard navigation, visible focus rings via the `--ring` token, alt text on every image, badges carry text, not just color.
- Exact SECURITY.md copy for the empty-search-results state: "No properties found for those dates in [City]. Try adjusting your filters or exploring nearby destinations." (omit the "in [City]" clause when no city filter is set).
- No real `wa.me` navigation and no real auth this slice — the WhatsApp CTA and wishlist heart always open `WhatsAppGateModal` instead of navigating.
- Mobile-first: majority of Indian guest traffic is phone-based (PRODUCT.md).
- No new npm dependencies beyond the test tooling added in Task 1 — everything else needed is already installed.
- File naming: kebab-case, matching the existing `components/ui/native-select.tsx` convention.

---

### Task 1: Test infrastructure (Vitest + React Testing Library)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/utils.test.ts`

**Interfaces:**
- Produces: `npm run test` (single run), `npm run test:watch` (watch mode) — every later task's test step uses `npm run test -- <path>`.

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
```

- [ ] **Step 4: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest"
```

- [ ] **Step 5: Write a failing smoke test**

Create `lib/utils.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b")
  })
})
```

- [ ] **Step 6: Run the test suite**

Run: `npm run test`
Expected: PASS (1 test) — this proves the pipeline (jsdom, path alias, TS/JSX transform) works before any real component test depends on it.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts lib/utils.test.ts
git commit -m "test: add vitest + react testing library infrastructure"
```

---

### Task 2: Shared types module

**Files:**
- Modify: `types/index.ts` (currently an empty stub)

**Interfaces:**
- Produces: `VerificationLevel`, `PropertyType`, `HostBadge`, `CancellationPolicy`, `ReviewBreakdown`, `Review`, `Host`, `Property`, `SearchParams` types, and the `verificationLabel` lookup — every later task imports these from `@/types`.

- [ ] **Step 1: Write the module**

Replace the contents of `types/index.ts`:

```ts
export type VerificationLevel = 1 | 2 | 3 | 4

export type PropertyType = "Homestay" | "Villa" | "Farm Stay" | "Heritage Home"

export type HostBadge = "Top Rated Host" | "Super Responsive Host" | null

export type CancellationPolicy = "Flexible" | "Moderate" | "Firm"

export const verificationLabel: Record<VerificationLevel, string> = {
  1: "Identity Verified",
  2: "Property Verified",
  3: "Video Verified",
  4: "On-Site Verified",
}

export type ReviewBreakdown = {
  cleanliness: number
  accuracy: number
  checkIn: number
  communication: number
  location: number
  value: number
}

export type Review = {
  id: string
  author: string
  date: string
  rating: number
  text: string
  hostReply?: string
}

export type Host = {
  name: string
  photo?: string
  responseRate: number
  avgResponseTimeMinutes: number
  badge: HostBadge
  otherListingsCount: number
}

export type Property = {
  id: string
  slug: string
  title: string
  propertyType: PropertyType
  city: string
  region: string
  guests: number
  beds: number
  pricePerNight: number
  rating: number
  reviewCount: number
  verificationLevel: VerificationLevel
  hostName: string
  hostBadge: HostBadge
  image?: string
  images: string[]
  featured?: boolean
  description: string
  amenities: string[]
  houseRules: string[]
  cancellationPolicy: CancellationPolicy
  whatsappNumber: string
  reviewBreakdown: ReviewBreakdown
  reviews: Review[]
  host: Host
}

export type SearchParams = {
  city?: string
  type?: PropertyType
  guests?: number
  priceMin?: number
  priceMax?: number
  verification?: VerificationLevel
  sort?: "relevance" | "price-asc" | "price-desc" | "rating" | "verified"
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS (no errors) — `lib/mock-data.ts` still exports its own inline `Property`/`VerificationLevel` at this point, which is fine; Task 3 switches it over.

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "feat: add shared Property/Review/Host types"
```

---

### Task 3: Extend mock data with search + detail-page fields

**Files:**
- Modify: `lib/mock-data.ts`
- Test: `lib/mock-data.test.ts`

**Interfaces:**
- Consumes: `Property`, `PropertyType`, `VerificationLevel`, `CancellationPolicy`, `ReviewBreakdown`, `Review`, `Host`, `SearchParams` from `@/types` (Task 2).
- Produces: `properties` (default export), `featuredProperties`, `propertiesByRegion(region)`, `propertiesByCity(city)`, `propertyById(id)`, `searchProperties(params)`, `searchCities` — every later data-consuming task uses these.

- [ ] **Step 1: Write the failing tests**

Create `lib/mock-data.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { searchProperties, propertyById } from "@/lib/mock-data"

describe("searchProperties", () => {
  it("filters by city", () => {
    const results = searchProperties({ city: "Gurugram" })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((p) => p.city === "Gurugram")).toBe(true)
  })

  it("matches region when the city filter equals a region name (e.g. Goa)", () => {
    const results = searchProperties({ city: "Goa" })
    expect(results).toHaveLength(4)
    expect(results.every((p) => p.region === "Goa")).toBe(true)
  })

  it("filters by minimum verification level", () => {
    const results = searchProperties({ verification: 4 })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((p) => p.verificationLevel === 4)).toBe(true)
  })

  it("filters by price range", () => {
    const results = searchProperties({ priceMin: 4000, priceMax: 6000 })
    expect(results.every((p) => p.pricePerNight >= 4000 && p.pricePerNight <= 6000)).toBe(true)
  })

  it("sorts by price ascending", () => {
    const results = searchProperties({ sort: "price-asc" })
    for (let i = 1; i < results.length; i++) {
      expect(results[i].pricePerNight).toBeGreaterThanOrEqual(results[i - 1].pricePerNight)
    }
  })

  it("returns an empty array for a city with no listings yet", () => {
    expect(searchProperties({ city: "Mumbai" })).toEqual([])
  })
})

describe("propertyById", () => {
  it("finds an existing property with its enriched fields", () => {
    const property = propertyById("p1")
    expect(property?.slug).toBe("aravali-ridge-studio-gurugram")
    expect(property?.images).toEqual(["https://images.unsplash.com/photo-1760596413966-22e91dde4e4b"])
    expect(property?.reviews.length).toBeGreaterThan(0)
    expect(property?.host.name).toBe("Ritika")
  })

  it("returns undefined for an unknown id", () => {
    expect(propertyById("does-not-exist")).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test -- lib/mock-data.test.ts`
Expected: FAIL — `searchProperties` and `propertyById` are not exported yet.

- [ ] **Step 3: Rewrite `lib/mock-data.ts`**

Replace the entire file. This keeps the existing 15 property records verbatim (as `baseProperties`) and adds an enrichment pipeline plus search/lookup functions:

```ts
import type {
  CancellationPolicy,
  Host,
  HostBadge,
  Property,
  PropertyType,
  Review,
  ReviewBreakdown,
  SearchParams,
  VerificationLevel,
} from "@/types"

export type { SearchParams }

type BaseProperty = {
  id: string
  slug: string
  title: string
  propertyType: PropertyType
  city: string
  region: string
  guests: number
  beds: number
  pricePerNight: number
  rating: number
  reviewCount: number
  verificationLevel: VerificationLevel
  hostName: string
  hostBadge: HostBadge
  image?: string
  featured?: boolean
}

const baseProperties: BaseProperty[] = [
  {
    id: "p1",
    slug: "aravali-ridge-studio-gurugram",
    title: "Aravali Ridge Studio with Terrace",
    propertyType: "Homestay",
    city: "Gurugram",
    region: "Delhi NCR",
    guests: 3,
    beds: 1,
    pricePerNight: 4200,
    rating: 4.9,
    reviewCount: 34,
    verificationLevel: 4,
    hostName: "Ritika",
    hostBadge: "Top Rated Host",
    image: "https://images.unsplash.com/photo-1760596413966-22e91dde4e4b",
    featured: true,
  },
  {
    id: "p2",
    slug: "sector-56-family-flat-gurugram",
    title: "Sector 56 Family Flat, Near Golf Course Rd",
    propertyType: "Homestay",
    city: "Gurugram",
    region: "Delhi NCR",
    guests: 4,
    beds: 2,
    pricePerNight: 3600,
    rating: 4.7,
    reviewCount: 21,
    verificationLevel: 3,
    hostName: "Arjun",
    hostBadge: "Super Responsive Host",
  },
  {
    id: "p3",
    slug: "dlf-phase-3-loft-gurugram",
    title: "DLF Phase 3 Designer Loft",
    propertyType: "Homestay",
    city: "Gurugram",
    region: "Delhi NCR",
    guests: 2,
    beds: 1,
    pricePerNight: 5100,
    rating: 4.8,
    reviewCount: 12,
    verificationLevel: 2,
    hostName: "Neha",
    hostBadge: null,
  },
  {
    id: "p4",
    slug: "sohna-road-farmhouse-gurugram",
    title: "Sohna Road Weekend Farmhouse",
    propertyType: "Farm Stay",
    city: "Gurugram",
    region: "Delhi NCR",
    guests: 10,
    beds: 4,
    pricePerNight: 12800,
    rating: 5.0,
    reviewCount: 8,
    verificationLevel: 4,
    hostName: "Vikram",
    hostBadge: "Top Rated Host",
    image: "https://plus.unsplash.com/premium_photo-1755612257207-0355d6da1e02",
    featured: true,
  },
  {
    id: "p5",
    slug: "hauz-khas-heritage-haveli-delhi",
    title: "Hauz Khas Heritage Haveli Room",
    propertyType: "Heritage Home",
    city: "New Delhi",
    region: "Delhi NCR",
    guests: 3,
    beds: 1,
    pricePerNight: 5600,
    rating: 4.9,
    reviewCount: 45,
    verificationLevel: 4,
    hostName: "Imran",
    hostBadge: "Top Rated Host",
    image: "https://plus.unsplash.com/premium_photo-1697730376263-90da9f2a1238",
    featured: true,
  },
  {
    id: "p6",
    slug: "vasant-vihar-garden-flat-delhi",
    title: "Vasant Vihar Garden-Facing Flat",
    propertyType: "Homestay",
    city: "New Delhi",
    region: "Delhi NCR",
    guests: 4,
    beds: 2,
    pricePerNight: 4800,
    rating: 4.6,
    reviewCount: 19,
    verificationLevel: 3,
    hostName: "Priya",
    hostBadge: null,
  },
  {
    id: "p7",
    slug: "noida-sector-94-highrise-delhi",
    title: "Noida Sector 94 High-Rise 2BHK",
    propertyType: "Homestay",
    city: "Noida",
    region: "Delhi NCR",
    guests: 5,
    beds: 2,
    pricePerNight: 3900,
    rating: 4.7,
    reviewCount: 27,
    verificationLevel: 2,
    hostName: "Sameer",
    hostBadge: "Super Responsive Host",
  },
  {
    id: "p8",
    slug: "calangute-pool-villa-goa",
    title: "Calangute Private Pool Villa",
    propertyType: "Villa",
    city: "Calangute",
    region: "Goa",
    guests: 8,
    beds: 3,
    pricePerNight: 18500,
    rating: 4.9,
    reviewCount: 61,
    verificationLevel: 4,
    hostName: "Fernando",
    hostBadge: "Top Rated Host",
    image: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff",
    featured: true,
  },
  {
    id: "p9",
    slug: "assagao-jungle-villa-goa",
    title: "Assagao Jungle-View Villa",
    propertyType: "Villa",
    city: "Assagao",
    region: "Goa",
    guests: 6,
    beds: 3,
    pricePerNight: 15200,
    rating: 4.8,
    reviewCount: 38,
    verificationLevel: 4,
    hostName: "Meera",
    hostBadge: "Top Rated Host",
    image: "https://images.unsplash.com/photo-1688653802629-5360086bf632",
    featured: true,
  },
  {
    id: "p10",
    slug: "siolim-riverside-flat-goa",
    title: "Siolim Riverside Flat",
    propertyType: "Homestay",
    city: "Siolim",
    region: "Goa",
    guests: 3,
    beds: 1,
    pricePerNight: 6400,
    rating: 4.6,
    reviewCount: 14,
    verificationLevel: 3,
    hostName: "Clarissa",
    hostBadge: null,
  },
  {
    id: "p11",
    slug: "baga-beachfront-studio-goa",
    title: "Baga Beachfront Studio",
    propertyType: "Homestay",
    city: "Baga",
    region: "Goa",
    guests: 2,
    beds: 1,
    pricePerNight: 5800,
    rating: 4.5,
    reviewCount: 9,
    verificationLevel: 2,
    hostName: "Rohan",
    hostBadge: null,
  },
  {
    id: "p12",
    slug: "old-manali-riverside-homestay",
    title: "Old Manali Riverside Homestay",
    propertyType: "Homestay",
    city: "Manali",
    region: "Himachal Pradesh",
    guests: 4,
    beds: 2,
    pricePerNight: 3200,
    rating: 4.9,
    reviewCount: 52,
    verificationLevel: 4,
    hostName: "Deepika",
    hostBadge: "Top Rated Host",
    image: "https://plus.unsplash.com/premium_photo-1686090450346-f418fff5486e",
    featured: true,
  },
  {
    id: "p13",
    slug: "tapovan-ganga-view-rishikesh",
    title: "Tapovan Ganga-View Cottage",
    propertyType: "Homestay",
    city: "Rishikesh",
    region: "Uttarakhand",
    guests: 3,
    beds: 1,
    pricePerNight: 2800,
    rating: 4.8,
    reviewCount: 44,
    verificationLevel: 3,
    hostName: "Yogesh",
    hostBadge: "Super Responsive Host",
    image: "https://images.unsplash.com/photo-1542690969-5a2050285637",
    featured: true,
  },
  {
    id: "p14",
    slug: "lake-pichola-heritage-udaipur",
    title: "Lake Pichola Heritage Room",
    propertyType: "Heritage Home",
    city: "Udaipur",
    region: "Rajasthan",
    guests: 2,
    beds: 1,
    pricePerNight: 6900,
    rating: 5.0,
    reviewCount: 29,
    verificationLevel: 4,
    hostName: "Maharaj Singh",
    hostBadge: "Top Rated Host",
    image: "https://images.unsplash.com/photo-1682414180825-c0df1934387f",
    featured: true,
  },
  {
    id: "p15",
    slug: "coorg-coffee-estate-cottage",
    title: "Coorg Coffee Estate Cottage",
    propertyType: "Farm Stay",
    city: "Coorg",
    region: "Karnataka",
    guests: 5,
    beds: 2,
    pricePerNight: 4700,
    rating: 4.9,
    reviewCount: 33,
    verificationLevel: 4,
    hostName: "Ganesh",
    hostBadge: "Top Rated Host",
    image: "https://images.unsplash.com/photo-1721486236233-20484857dd38",
    featured: true,
  },
]

const DEFAULT_AMENITIES = [
  "Wi-Fi",
  "Air conditioning",
  "Kitchen",
  "Free parking",
  "Washing machine",
  "TV",
]

const DEFAULT_HOUSE_RULES = [
  "Check-in after 1:00 PM, check-out before 11:00 AM",
  "No smoking indoors",
  "No parties or events",
  "Pets on request only",
]

const CANCELLATION_POLICIES: CancellationPolicy[] = ["Flexible", "Moderate", "Firm"]

// ponytail: amenities/house rules/reviews are generated, not hand-authored —
// this is mock data standing in for the external backend (ARCHITECTURE.md).
// Swap for real per-property data once that backend exists.
function buildReviewBreakdown(rating: number): ReviewBreakdown {
  const base = Math.max(1, Math.min(5, rating))
  return {
    cleanliness: base,
    accuracy: Math.max(1, base - 0.1),
    checkIn: Math.max(1, base - 0.2),
    communication: base,
    location: Math.max(1, base - 0.1),
    value: Math.max(1, base - 0.2),
  }
}

const SAMPLE_REVIEW_AUTHORS = ["Ananya", "Rahul", "Sneha", "Vikas", "Pooja"]

function buildReviews(hostName: string, reviewCount: number): Review[] {
  const sampleCount = Math.min(3, Math.max(1, reviewCount))
  return Array.from({ length: sampleCount }, (_, i) => ({
    id: `r${i + 1}`,
    author: SAMPLE_REVIEW_AUTHORS[i % SAMPLE_REVIEW_AUTHORS.length],
    date: `2026-05-1${i}`,
    rating: 5,
    text: `${hostName} was a fantastic host — the stay matched the listing exactly and check-in was smooth.`,
    ...(i === 0 ? { hostReply: "Thank you so much for staying with us!" } : {}),
  }))
}

function buildHost(name: string, badge: HostBadge, index: number): Host {
  return {
    name,
    responseRate: badge === "Super Responsive Host" ? 98 : 85,
    avgResponseTimeMinutes: badge === "Super Responsive Host" ? 15 : 90,
    badge,
    otherListingsCount: index % 4,
  }
}

function enrich(base: BaseProperty, index: number): Property {
  return {
    ...base,
    images: base.image ? [base.image] : [],
    description: `${base.title} is a ${base.propertyType.toLowerCase()} in ${base.city}, ${base.region}, comfortably hosting up to ${base.guests} guests across ${base.beds} bed${base.beds > 1 ? "s" : ""}.`,
    amenities: DEFAULT_AMENITIES,
    houseRules: DEFAULT_HOUSE_RULES,
    cancellationPolicy: CANCELLATION_POLICIES[index % CANCELLATION_POLICIES.length],
    whatsappNumber: `+91 9${String(800000000 + index * 137).padStart(9, "0")}`,
    reviewBreakdown: buildReviewBreakdown(base.rating),
    reviews: buildReviews(base.hostName, base.reviewCount),
    host: buildHost(base.hostName, base.hostBadge, index),
  }
}

const properties: Property[] = baseProperties.map(enrich)

export function propertiesByRegion(region: string): Property[] {
  return properties.filter((property) => property.region === region)
}

export const featuredProperties: Property[] = properties.filter((property) => property.featured)

export function propertiesByCity(city: string): Property[] {
  return properties.filter((property) => property.city === city)
}

export function propertyById(id: string): Property | undefined {
  return properties.find((property) => property.id === id)
}

export function searchProperties(params: SearchParams): Property[] {
  let results = properties.filter((property) => {
    if (params.city && property.city !== params.city && property.region !== params.city) return false
    if (params.type && property.propertyType !== params.type) return false
    if (params.guests && property.guests < params.guests) return false
    if (params.priceMin != null && property.pricePerNight < params.priceMin) return false
    if (params.priceMax != null && property.pricePerNight > params.priceMax) return false
    if (params.verification && property.verificationLevel < params.verification) return false
    return true
  })

  switch (params.sort) {
    case "price-asc":
      results = [...results].sort((a, b) => a.pricePerNight - b.pricePerNight)
      break
    case "price-desc":
      results = [...results].sort((a, b) => b.pricePerNight - a.pricePerNight)
      break
    case "rating":
      results = [...results].sort((a, b) => b.rating - a.rating)
      break
    case "verified":
      results = [...results].sort((a, b) => b.verificationLevel - a.verificationLevel)
      break
    default:
      break
  }

  return results
}

export const searchCities = [
  "Gurugram",
  "New Delhi",
  "Noida",
  "Goa",
  "Jaipur",
  "Manali",
  "Rishikesh",
  "Udaipur",
  "Coorg",
  "Mumbai",
  "Hyderabad",
]

export default properties
```

Note: "Goa" in `searchCities` matches by `region`, not `city` — see the `matches region when the city filter equals a region name` test above. `Jaipur`, `Mumbai`, `Hyderabad` intentionally have zero listings yet (matches FEATURES.md's phased city rollout) and are a real, useful empty-state test case, not a bug.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test -- lib/mock-data.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/mock-data.ts lib/mock-data.test.ts
git commit -m "feat: extend mock data with detail-page fields and searchProperties"
```

---

### Task 4: WhatsApp link helper

**Files:**
- Create: `lib/whatsapp.ts`
- Test: `lib/whatsapp.test.ts`

**Interfaces:**
- Consumes: `Property` from `@/types` (Task 2).
- Produces: `buildWhatsAppMessage(property, params)`, `buildWhatsAppLink(property, params)` — consumed by `WhatsAppGateModal` usage sites in Tasks 7 and 15 (the link is built but never navigated to this slice, per the stub-gate decision).

- [ ] **Step 1: Write the failing tests**

Create `lib/whatsapp.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { buildWhatsAppLink, buildWhatsAppMessage } from "@/lib/whatsapp"
import { propertyById } from "@/lib/mock-data"

describe("buildWhatsAppMessage", () => {
  it("includes the property title and id", () => {
    const property = propertyById("p1")!
    const message = buildWhatsAppMessage(property, {})
    expect(message).toContain(property.title)
    expect(message).toContain(property.id)
  })

  it("includes check-in/check-out dates and guest count when provided", () => {
    const property = propertyById("p1")!
    const message = buildWhatsAppMessage(property, {
      checkin: "2026-08-01",
      checkout: "2026-08-03",
      guests: 2,
    })
    expect(message).toContain("2026-08-01")
    expect(message).toContain("2026-08-03")
    expect(message).toContain("Guests: 2")
  })
})

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with a digits-only phone number and url-encoded text", () => {
    const property = propertyById("p1")!
    const link = buildWhatsAppLink(property, { guests: 2 })
    expect(link).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
    expect(link).not.toContain(" ")
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- lib/whatsapp.test.ts`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 3: Implement**

Create `lib/whatsapp.ts`:

```ts
import type { Property } from "@/types"

export type WhatsAppMessageParams = {
  checkin?: string
  checkout?: string
  guests?: number
}

export function buildWhatsAppMessage(property: Property, params: WhatsAppMessageParams): string {
  const lines = [
    `Hi ${property.hostName}, I'm interested in "${property.title}" (Kiphaus ID: ${property.id}).`,
  ]
  if (params.checkin && params.checkout) {
    lines.push(`Dates: ${params.checkin} to ${params.checkout}.`)
  }
  if (params.guests) {
    lines.push(`Guests: ${params.guests}.`)
  }
  lines.push("Is it available? Could you share more details?")
  return lines.join(" ")
}

export function buildWhatsAppLink(property: Property, params: WhatsAppMessageParams = {}): string {
  const phone = property.whatsappNumber.replace(/[^\d]/g, "")
  const text = encodeURIComponent(buildWhatsAppMessage(property, params))
  return `https://wa.me/${phone}?text=${text}`
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -- lib/whatsapp.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/whatsapp.ts lib/whatsapp.test.ts
git commit -m "feat: add WhatsApp deep-link builder"
```

---

### Task 5: `TrustBadgeRow` component

**Files:**
- Create: `components/features/guest/trust-badge-row.tsx`
- Test: `components/features/guest/trust-badge-row.test.tsx`

**Interfaces:**
- Consumes: `verificationLabel`, `VerificationLevel`, `HostBadge` from `@/types`.
- Produces: `TrustBadgeRow({ verificationLevel, hostBadge, className? })` — consumed by `PropertyCard` (Task 7) and the property detail page (Task 15).

- [ ] **Step 1: Write the failing tests**

Create `components/features/guest/trust-badge-row.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { TrustBadgeRow } from "@/components/features/guest/trust-badge-row"

describe("TrustBadgeRow", () => {
  it("renders the verification label for the given level", () => {
    render(<TrustBadgeRow verificationLevel={3} hostBadge={null} />)
    expect(screen.getByText("Video Verified")).toBeInTheDocument()
  })

  it("renders the host badge when provided", () => {
    render(<TrustBadgeRow verificationLevel={4} hostBadge="Top Rated Host" />)
    expect(screen.getByText("On-Site Verified")).toBeInTheDocument()
    expect(screen.getByText("Top Rated Host")).toBeInTheDocument()
  })

  it("omits a host badge element when null", () => {
    render(<TrustBadgeRow verificationLevel={1} hostBadge={null} />)
    expect(screen.queryByText("Top Rated Host")).not.toBeInTheDocument()
    expect(screen.queryByText("Super Responsive Host")).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- components/features/guest/trust-badge-row.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

Create `components/features/guest/trust-badge-row.tsx`:

```tsx
import { verificationLabel, type HostBadge, type VerificationLevel } from "@/types"
import { cn } from "@/lib/utils"

export function TrustBadgeRow({
  verificationLevel,
  hostBadge,
  className,
}: {
  verificationLevel: VerificationLevel
  hostBadge: HostBadge
  className?: string
}) {
  const badges = [verificationLabel[verificationLevel], ...(hostBadge ? [hostBadge] : [])]

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {badges.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
        >
          {label}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -- components/features/guest/trust-badge-row.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Invoke `/frontend-design` on this file**

Scope it to `components/features/guest/trust-badge-row.tsx` against `DESIGN.md`'s badge spec (50px pill radius, `--color-signal-blue`-tinted background for verified states). Apply any visual corrections it suggests, then re-run the Step 4 test to confirm nothing broke.

- [ ] **Step 6: Commit**

```bash
git add components/features/guest/trust-badge-row.tsx components/features/guest/trust-badge-row.test.tsx
git commit -m "feat: add TrustBadgeRow component"
```

---

### Task 6: `WhatsAppGateModal` component

**Files:**
- Create: `components/features/guest/whatsapp-gate-modal.tsx`
- Test: `components/features/guest/whatsapp-gate-modal.test.tsx`

**Interfaces:**
- Consumes: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` from `@/components/ui/dialog`; `Button` from `@/components/ui/button`.
- Produces: `WhatsAppGateModal({ variant: "contact" | "save", triggerRender: ReactElement, children: ReactNode })` — consumed by `PropertyCard` (Task 7) and the property detail page (Task 15). `triggerRender` must be a *childless, styled* element (e.g. `<Button variant="ghost" size="icon" />`); `children` is the visual content rendered inside it — this mirrors the `render` prop pattern already used by `DialogClose` in `components/ui/dialog.tsx`, not Radix `asChild`.

- [ ] **Step 1: Write the failing tests**

Create `components/features/guest/whatsapp-gate-modal.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WhatsAppGateModal } from "@/components/features/guest/whatsapp-gate-modal"
import { Button } from "@/components/ui/button"

describe("WhatsAppGateModal", () => {
  it("shows the contact-host copy for the contact variant", async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppGateModal variant="contact" triggerRender={<Button />}>
        Book via WhatsApp
      </WhatsAppGateModal>
    )
    await user.click(screen.getByRole("button", { name: "Book via WhatsApp" }))
    expect(await screen.findByText("Log in to contact this host")).toBeInTheDocument()
  })

  it("shows the save-stays copy for the save variant", async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppGateModal variant="save" triggerRender={<Button />}>
        Save
      </WhatsAppGateModal>
    )
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByText("Log in to save stays")).toBeInTheDocument()
  })

  it("links the login button to /login", async () => {
    const user = userEvent.setup()
    render(
      <WhatsAppGateModal variant="contact" triggerRender={<Button />}>
        Book via WhatsApp
      </WhatsAppGateModal>
    )
    await user.click(screen.getByRole("button", { name: "Book via WhatsApp" }))
    expect(await screen.findByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login")
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- components/features/guest/whatsapp-gate-modal.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

Create `components/features/guest/whatsapp-gate-modal.tsx`:

```tsx
"use client"

import Link from "next/link"
import type { ReactElement, ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type GateVariant = "contact" | "save"

const COPY: Record<GateVariant, { title: string; description: string }> = {
  contact: {
    title: "Log in to contact this host",
    description: "Create a free Kiphaus account to message hosts directly on WhatsApp.",
  },
  save: {
    title: "Log in to save stays",
    description: "Create a free Kiphaus account to save stays to your wishlist.",
  },
}

export function WhatsAppGateModal({
  variant,
  triggerRender,
  children,
}: {
  variant: GateVariant
  triggerRender: ReactElement
  children: ReactNode
}) {
  const copy = COPY[variant]

  return (
    <Dialog>
      <DialogTrigger render={triggerRender}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button render={<Link href="/login" />}>Log in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -- components/features/guest/whatsapp-gate-modal.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add components/features/guest/whatsapp-gate-modal.tsx components/features/guest/whatsapp-gate-modal.test.tsx
git commit -m "feat: add WhatsAppGateModal stub-gate component"
```

---

### Task 7: `PropertyCard` component

**Files:**
- Create: `components/features/guest/property-card.tsx`
- Test: `components/features/guest/property-card.test.tsx`

**Interfaces:**
- Consumes: `Property` from `@/types`; `TrustBadgeRow` (Task 5); `WhatsAppGateModal` (Task 6); `Button` from `@/components/ui/button`; `Image` from `next/image`; `Link` from `next/link`; `Heart` from `lucide-react`.
- Produces: `PropertyCard({ property })` — consumed by the landing page (Task 10), search results page (Task 12), and property detail page's "similar stays" rail (Task 15).

- [ ] **Step 1: Write the failing tests**

Create `components/features/guest/property-card.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PropertyCard } from "@/components/features/guest/property-card"
import { propertyById } from "@/lib/mock-data"

describe("PropertyCard", () => {
  const property = propertyById("p1")!

  it("renders title, formatted price, and rating", () => {
    render(<PropertyCard property={property} />)
    expect(screen.getByText(property.title)).toBeInTheDocument()
    expect(screen.getByText("₹4,200", { exact: false })).toBeInTheDocument()
    expect(screen.getByText(`★ ${property.rating.toFixed(1)} (${property.reviewCount})`)).toBeInTheDocument()
  })

  it("links to the property detail page", () => {
    render(<PropertyCard property={property} />)
    const links = screen.getAllByRole("link")
    expect(links[0]).toHaveAttribute("href", `/rooms/${property.id}`)
  })

  it("opens the save-stays gate modal from the wishlist heart", async () => {
    render(<PropertyCard property={property} />)
    const { default: userEvent } = await import("@testing-library/user-event")
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: `Save ${property.title} to wishlist` }))
    expect(await screen.findByText("Log in to save stays")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- components/features/guest/property-card.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

Create `components/features/guest/property-card.tsx`:

```tsx
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import type { Property } from "@/types"
import { TrustBadgeRow } from "./trust-badge-row"
import { WhatsAppGateModal } from "./whatsapp-gate-modal"
import { Button } from "@/components/ui/button"

export function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card">
      <Link href={`/rooms/${property.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-3xl bg-muted">
          {property.images[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No photo yet
            </div>
          )}
        </div>
      </Link>
      <WhatsAppGateModal
        variant="save"
        triggerRender={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Save ${property.title} to wishlist`}
            className="absolute right-3 top-3 rounded-full bg-card/80 backdrop-blur"
          />
        }
      >
        <Heart className="size-4" />
      </WhatsAppGateModal>
      <div className="space-y-2 p-4">
        <Link href={`/rooms/${property.id}`}>
          <h3 className="text-sm font-medium">{property.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          {property.city}, {property.region}
        </p>
        <TrustBadgeRow verificationLevel={property.verificationLevel} hostBadge={property.hostBadge} />
        <div className="flex items-baseline justify-between pt-1">
          <span className="font-semibold">
            ₹{property.pricePerNight.toLocaleString("en-IN")}{" "}
            <span className="text-sm font-normal text-muted-foreground">/ night</span>
          </span>
          <span className="text-sm text-muted-foreground">
            ★ {property.rating.toFixed(1)} ({property.reviewCount})
          </span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -- components/features/guest/property-card.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Invoke `/frontend-design` on this file**

Scope it to `components/features/guest/property-card.tsx` against `DESIGN.md`'s card spec (22-30px radius, glow-ring elevation instead of a drop shadow). Apply corrections, re-run Step 4.

- [ ] **Step 6: Commit**

```bash
git add components/features/guest/property-card.tsx components/features/guest/property-card.test.tsx
git commit -m "feat: add PropertyCard component"
```

---

### Task 8: `SiteHeader` + `SiteFooter`

**Files:**
- Create: `components/layout/site-header.tsx`
- Create: `components/layout/site-footer.tsx`
- Test: `components/layout/site-header.test.tsx`
- Test: `components/layout/site-footer.test.tsx`

**Interfaces:**
- Consumes: `searchCities` from `@/lib/mock-data`; `Button` from `@/components/ui/button`; `Menu`/`X` from `lucide-react`.
- Produces: `SiteHeader()`, `SiteFooter()` — consumed by every page (Tasks 10, 12, 15).

Note: `components/shared/logo.tsx`'s `LogoMark` is a leftover green (`#6BDA0A`) SVG unrelated to Portal's signal-blue palette — do not use it here. `SiteHeader` uses a plain signal-blue monogram instead.

- [ ] **Step 1: Write the failing tests**

Create `components/layout/site-header.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SiteHeader } from "@/components/layout/site-header"

describe("SiteHeader", () => {
  it("renders the brand and the search-stays nav link", () => {
    render(<SiteHeader />)
    expect(screen.getByText("Kiphaus")).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "Search stays" })[0]).toHaveAttribute("href", "/s")
  })

  it("toggles the mobile menu open and closed", async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Close menu" }))
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument()
  })
})
```

Create `components/layout/site-footer.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SiteFooter } from "@/components/layout/site-footer"
import { searchCities } from "@/lib/mock-data"

describe("SiteFooter", () => {
  it("renders the brand line and a legal link", () => {
    render(<SiteFooter />)
    expect(screen.getByText("Kiphaus")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
  })

  it("renders a search link for every city", () => {
    render(<SiteFooter />)
    expect(screen.getByRole("link", { name: searchCities[0] })).toHaveAttribute(
      "href",
      `/s?city=${encodeURIComponent(searchCities[0])}`
    )
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- components/layout/site-header.test.tsx components/layout/site-footer.test.tsx`
Expected: FAIL — modules don't exist.

- [ ] **Step 3: Implement `SiteHeader`**

Create `components/layout/site-header.tsx`:

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "/s", label: "Search stays" },
  { href: "/host", label: "Become a host" },
  { href: "/login", label: "Log in" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-5xl items-center justify-between rounded-full border border-border bg-card/90 px-4 py-2 backdrop-blur">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
          K
        </span>
        Kiphaus
      </Link>
      <nav className="hidden items-center gap-6 md:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm font-medium hover:opacity-60">
            {link.label}
          </Link>
        ))}
      </nav>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>
      {open && (
        <nav className="absolute top-full left-0 mt-2 flex w-full flex-col gap-1 rounded-2xl border border-border bg-card p-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
```

- [ ] **Step 4: Implement `SiteFooter`**

Create `components/layout/site-footer.tsx`:

```tsx
import Link from "next/link"
import { searchCities } from "@/lib/mock-data"

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/policy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
]

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-5xl px-4 py-16 text-sm text-muted-foreground">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-semibold text-foreground">Kiphaus</p>
          <p className="mt-2">Verified stays. Direct bookings. Better earnings.</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Company</p>
          <ul className="mt-2 space-y-1">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground">Legal</p>
          <ul className="mt-2 space-y-1">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-6">
        {searchCities.map((city) => (
          <Link key={city} href={`/s?city=${encodeURIComponent(city)}`} className="hover:text-foreground">
            {city}
          </Link>
        ))}
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm run test -- components/layout/site-header.test.tsx components/layout/site-footer.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 6: Invoke `/frontend-design` on both files**

Scope to `components/layout/site-header.tsx` and `components/layout/site-footer.tsx` against `DESIGN.md`'s "Floating Nav Capsule" spec (22px radius, 1px border + 5px glow ring, 8px/16px padding). Apply corrections, re-run Step 5.

- [ ] **Step 7: Commit**

```bash
git add components/layout/site-header.tsx components/layout/site-footer.tsx components/layout/site-header.test.tsx components/layout/site-footer.test.tsx
git commit -m "feat: add SiteHeader and SiteFooter"
```

---

### Task 9: `SearchBar` component

**Files:**
- Create: `components/features/guest/search-bar.tsx`
- Test: `components/features/guest/search-bar.test.tsx`

**Interfaces:**
- Consumes: `searchCities` from `@/lib/mock-data`; `useRouter` from `next/navigation`; `Input` from `@/components/ui/input`; `NativeSelect`/`NativeSelectOption` from `@/components/ui/native-select`; `Button` from `@/components/ui/button`.
- Produces: `SearchBar({ className? })` — navigates to `/s?city=...&checkin=...&checkout=...&guests=...` on submit. Consumed by the landing page (Task 10) and search results page (Task 12).

- [ ] **Step 1: Write the failing test**

Create `components/features/guest/search-bar.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchBar } from "@/components/features/guest/search-bar"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

describe("SearchBar", () => {
  beforeEach(() => {
    push.mockClear()
  })

  it("navigates to /s with the selected city and guest count", async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    await user.selectOptions(screen.getByLabelText("City"), "Goa")
    await user.click(screen.getByRole("button", { name: "Search stays" }))
    expect(push).toHaveBeenCalledTimes(1)
    const url = push.mock.calls[0][0] as string
    expect(url).toContain("city=Goa")
    expect(url).toContain("guests=2")
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- components/features/guest/search-bar.test.tsx`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement**

Create `components/features/guest/search-bar.tsx`:

```tsx
"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { cn } from "@/lib/utils"
import { searchCities } from "@/lib/mock-data"

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [checkin, setCheckin] = useState("")
  const [checkout, setCheckout] = useState("")
  const [guests, setGuests] = useState(2)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (checkin) params.set("checkin", checkin)
    if (checkout) params.set("checkout", checkout)
    params.set("guests", String(guests))
    router.push(`/s?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 md:flex-row md:items-end",
        className
      )}
    >
      <label className="flex-1 text-sm">
        City
        <NativeSelect value={city} onChange={(event) => setCity(event.target.value)} className="mt-1 w-full">
          <NativeSelectOption value="">Anywhere</NativeSelectOption>
          {searchCities.map((cityOption) => (
            <NativeSelectOption key={cityOption} value={cityOption}>
              {cityOption}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <label className="text-sm">
        Check-in
        <Input type="date" value={checkin} onChange={(event) => setCheckin(event.target.value)} className="mt-1" />
      </label>
      <label className="text-sm">
        Check-out
        <Input type="date" value={checkout} onChange={(event) => setCheckout(event.target.value)} className="mt-1" />
      </label>
      <label className="text-sm">
        Guests
        <Input
          type="number"
          min={1}
          value={guests}
          onChange={(event) => setGuests(Number(event.target.value))}
          className="mt-1 w-20"
        />
      </label>
      <Button type="submit" className="rounded-full">
        Search stays
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -- components/features/guest/search-bar.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Invoke `/frontend-design` on this file**

Scope to `components/features/guest/search-bar.tsx` against `DESIGN.md`'s hero pill button + card spec. Apply corrections, re-run Step 4.

- [ ] **Step 6: Commit**

```bash
git add components/features/guest/search-bar.tsx components/features/guest/search-bar.test.tsx
git commit -m "feat: add SearchBar component"
```

---

### Task 10: Landing page

**Files:**
- Modify: `app/page.tsx` (currently empty)
- Test: `app/page.test.tsx`

**Interfaces:**
- Consumes: `SiteHeader` (Task 8), `SiteFooter` (Task 8), `SearchBar` (Task 9), `PropertyCard` (Task 7), `featuredProperties` from `@/lib/mock-data` (Task 3).

- [ ] **Step 1: Write the failing test**

Create `app/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import LandingPage from "@/app/page"
import { featuredProperties } from "@/lib/mock-data"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe("LandingPage", () => {
  it("renders the hero heading, search bar, and one card per featured property", () => {
    render(<LandingPage />)
    expect(screen.getByRole("heading", { name: "Verified stays. Direct bookings." })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Search stays" })).toBeInTheDocument()
    for (const property of featuredProperties) {
      expect(screen.getByText(property.title)).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- app/page.test.tsx`
Expected: FAIL — `app/page.tsx` is currently empty.

- [ ] **Step 3: Implement**

Replace the contents of `app/page.tsx`:

```tsx
import Link from "next/link"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { SearchBar } from "@/components/features/guest/search-bar"
import { PropertyCard } from "@/components/features/guest/property-card"
import { featuredProperties } from "@/lib/mock-data"

const TRUST_PROPS = [
  {
    title: "Zero commission, ever",
    body: "Hosts pay one flat annual subscription, not a cut of every booking. Guests never pay a platform fee.",
  },
  {
    title: "Four-level verification",
    body: "Identity, property, video walkthrough, and on-site inspection — trust you can see, not assume.",
  },
  {
    title: "Direct to host, always",
    body: "Every listing connects you straight to a real host on WhatsApp. No platform inbox in between.",
  },
]

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section
          style={{ background: "var(--gradient-dusk-gradient)" }}
          className="relative flex min-h-[560px] flex-col items-center justify-center gap-8 px-4 pt-32 pb-24 text-center text-white"
        >
          <div className="max-w-2xl space-y-4">
            <h1 className="font-perfectly-nineties-regular text-4xl md:text-5xl">
              Verified stays. Direct bookings.
            </h1>
            <p className="text-base text-white/90">
              India&apos;s marketplace for homestays, villas, and heritage homes — priced honestly, booked directly
              with the host.
            </p>
          </div>
          <SearchBar className="w-full max-w-3xl bg-white text-foreground" />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {TRUST_PROPS.map((prop) => (
              <div key={prop.title}>
                <h2 className="font-perfectly-nineties-regular text-2xl">{prop.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{prop.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-20">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-perfectly-nineties-regular text-3xl">Featured verified stays</h2>
            <Link href="/s" className="text-sm font-medium hover:opacity-60">
              See all stays
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm run test -- app/page.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Invoke `/senior-frontend` code-review pass**

Scope it to `app/page.tsx`. Apply any correctness/architecture fixes it surfaces (e.g. Server/Client Component boundary correctness), then re-run Step 4.

- [ ] **Step 6: Browser verification**

Run: `npm run dev`. Using the Playwright MCP tools: `browser_navigate` to `http://localhost:3000/`, `browser_take_screenshot`, `browser_console_messages` (expect zero errors). Toggle to dark theme (if a toggle exists on this page) and screenshot again. `browser_resize` to a 390×844 mobile viewport and screenshot again. Confirm the hero, search bar, trust props, and featured rail all render without layout breakage.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx app/page.test.tsx
git commit -m "feat: build landing page"
```

---

### Task 11: `SearchFilters` + `EmptyState` components

**Files:**
- Create: `components/features/guest/search-filters.tsx`
- Create: `components/features/guest/empty-state.tsx`
- Test: `components/features/guest/search-filters.test.tsx`
- Test: `components/features/guest/empty-state.test.tsx`

**Interfaces:**
- Consumes: `useRouter`, `useSearchParams` from `next/navigation`; `NativeSelect`/`NativeSelectOption` from `@/components/ui/native-select`; `Input` from `@/components/ui/input`; `Button` from `@/components/ui/button`.
- Produces: `SearchFilters()` (reads current `useSearchParams`, submits an updated `/s?...` URL preserving existing params), `EmptyState({ city? })` — both consumed by the search results page (Task 12).

- [ ] **Step 1: Write the failing tests**

Create `components/features/guest/empty-state.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { EmptyState } from "@/components/features/guest/empty-state"

describe("EmptyState", () => {
  it("renders the city-specific SECURITY.md copy when a city is given", () => {
    render(<EmptyState city="Mumbai" />)
    expect(
      screen.getByText("No properties found for those dates in Mumbai. Try adjusting your filters or exploring nearby destinations.")
    ).toBeInTheDocument()
  })

  it("renders the generic copy when no city is given", () => {
    render(<EmptyState />)
    expect(
      screen.getByText("No properties found for those dates. Try adjusting your filters or exploring nearby destinations.")
    ).toBeInTheDocument()
  })
})
```

Create `components/features/guest/search-filters.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SearchFilters } from "@/components/features/guest/search-filters"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("city=Goa"),
}))

describe("SearchFilters", () => {
  beforeEach(() => {
    push.mockClear()
  })

  it("applies a property type filter while preserving the existing city param", async () => {
    const user = userEvent.setup()
    render(<SearchFilters />)
    await user.selectOptions(screen.getByLabelText("Property type"), "Villa")
    await user.click(screen.getByRole("button", { name: "Apply filters" }))
    expect(push).toHaveBeenCalledTimes(1)
    const url = push.mock.calls[0][0] as string
    expect(url).toContain("city=Goa")
    expect(url).toContain("type=Villa")
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- components/features/guest/search-filters.test.tsx components/features/guest/empty-state.test.tsx`
Expected: FAIL — modules don't exist.

- [ ] **Step 3: Implement `EmptyState`**

Create `components/features/guest/empty-state.tsx`:

```tsx
export function EmptyState({ city }: { city?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border py-20 text-center">
      <p className="text-lg font-medium">
        No properties found for those dates{city ? ` in ${city}` : ""}.
      </p>
      <p className="text-sm text-muted-foreground">
        Try adjusting your filters or exploring nearby destinations.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Implement `SearchFilters`**

Create `components/features/guest/search-filters.tsx`:

```tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const PROPERTY_TYPES = ["Homestay", "Villa", "Farm Stay", "Heritage Home"] as const
const VERIFICATION_LEVELS = [1, 2, 3, 4] as const
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
  { value: "verified", label: "Most verified first" },
] as const

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [type, setType] = useState(searchParams.get("type") ?? "")
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "")
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "")
  const [verification, setVerification] = useState(searchParams.get("verification") ?? "")
  const [sort, setSort] = useState(searchParams.get("sort") ?? "relevance")

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const setOrDelete = (key: string, value: string) => {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    setOrDelete("type", type)
    setOrDelete("priceMin", priceMin)
    setOrDelete("priceMax", priceMax)
    setOrDelete("verification", verification)
    setOrDelete("sort", sort)
    router.push(`/s?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 md:w-64">
      <label className="text-sm">
        Property type
        <NativeSelect value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full">
          <NativeSelectOption value="">Any type</NativeSelectOption>
          {PROPERTY_TYPES.map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Min price
          <Input type="number" min={0} value={priceMin} onChange={(event) => setPriceMin(event.target.value)} className="mt-1" />
        </label>
        <label className="flex-1 text-sm">
          Max price
          <Input type="number" min={0} value={priceMax} onChange={(event) => setPriceMax(event.target.value)} className="mt-1" />
        </label>
      </div>
      <label className="text-sm">
        Minimum verification level
        <NativeSelect
          value={verification}
          onChange={(event) => setVerification(event.target.value)}
          className="mt-1 w-full"
        >
          <NativeSelectOption value="">Any level</NativeSelectOption>
          {VERIFICATION_LEVELS.map((level) => (
            <NativeSelectOption key={level} value={String(level)}>
              Level {level}+
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <label className="text-sm">
        Sort by
        <NativeSelect value={sort} onChange={(event) => setSort(event.target.value)} className="mt-1 w-full">
          {SORT_OPTIONS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>
      <Button type="submit" className="rounded-full">
        Apply filters
      </Button>
    </form>
  )
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm run test -- components/features/guest/search-filters.test.tsx components/features/guest/empty-state.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add components/features/guest/search-filters.tsx components/features/guest/empty-state.tsx components/features/guest/search-filters.test.tsx components/features/guest/empty-state.test.tsx
git commit -m "feat: add SearchFilters and EmptyState components"
```

---

### Task 12: Search results page

**Files:**
- Create: `app/(guest)/s/page.tsx` (currently a 1-line stub — replace it)
- Create: `app/(guest)/s/loading.tsx`
- Test: `app/(guest)/s/page.test.tsx`

**Interfaces:**
- Consumes: `SiteHeader`, `SiteFooter` (Task 8), `SearchBar` (Task 9), `SearchFilters`, `EmptyState` (Task 11), `PropertyCard` (Task 7), `searchProperties` (Task 3), `SearchParams` from `@/types` (Task 2), `Skeleton` from `@/components/ui/skeleton`.

- [ ] **Step 1: Write the failing tests**

Create `app/(guest)/s/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import SearchPage from "@/app/(guest)/s/page"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe("SearchPage", () => {
  it("renders matching results for a city filter", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({ city: "Goa" }) })
    render(jsx)
    expect(screen.getByText("4 stays in Goa")).toBeInTheDocument()
  })

  it("renders the empty state for a city with no listings yet", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({ city: "Mumbai" }) })
    render(jsx)
    expect(
      screen.getByText("No properties found for those dates in Mumbai. Try adjusting your filters or exploring nearby destinations.")
    ).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- "app/(guest)/s/page.test.tsx"`
Expected: FAIL — current `page.tsx` is a 1-line stub.

- [ ] **Step 3: Implement the page**

Replace the contents of `app/(guest)/s/page.tsx`:

```tsx
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { SearchBar } from "@/components/features/guest/search-bar"
import { SearchFilters } from "@/components/features/guest/search-filters"
import { PropertyCard } from "@/components/features/guest/property-card"
import { EmptyState } from "@/components/features/guest/empty-state"
import { searchProperties } from "@/lib/mock-data"
import type { PropertyType, SearchParams, VerificationLevel } from "@/types"

function parseSearchParams(raw: Record<string, string | string[] | undefined>): SearchParams {
  const get = (key: string) => {
    const value = raw[key]
    return Array.isArray(value) ? value[0] : value
  }
  return {
    city: get("city") || undefined,
    type: (get("type") as PropertyType) || undefined,
    guests: get("guests") ? Number(get("guests")) : undefined,
    priceMin: get("priceMin") ? Number(get("priceMin")) : undefined,
    priceMax: get("priceMax") ? Number(get("priceMax")) : undefined,
    verification: get("verification") ? (Number(get("verification")) as VerificationLevel) : undefined,
    sort: (get("sort") as SearchParams["sort"]) || undefined,
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const params = parseSearchParams(raw)
  const results = searchProperties(params)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
        <SearchBar className="mb-8" />
        <div className="flex flex-col gap-8 md:flex-row">
          <SearchFilters />
          <div className="flex-1">
            <p className="mb-4 text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "stay" : "stays"}
              {params.city ? ` in ${params.city}` : ""}
            </p>
            {results.length === 0 ? (
              <EmptyState city={params.city} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {results.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 4: Implement the loading skeleton**

Create `app/(guest)/s/loading.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
      <Skeleton className="mb-8 h-24 w-full rounded-3xl" />
      <div className="flex flex-col gap-8 md:flex-row">
        <Skeleton className="h-96 w-full rounded-3xl md:w-64" />
        <div className="grid flex-1 gap-6 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-3xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm run test -- "app/(guest)/s/page.test.tsx"`
Expected: PASS (2 tests)

- [ ] **Step 6: Invoke `/senior-frontend` code-review pass**

Scope to `app/(guest)/s/page.tsx`. Apply corrections, re-run Step 5.

- [ ] **Step 7: Browser verification**

Run: `npm run dev`. Via Playwright MCP: navigate to `/s`, `/s?city=Goa`, and `/s?city=Mumbai` (expect the empty state). Screenshot each, check `browser_console_messages` for errors, and repeat at a 390px viewport. Click a filter, submit, and confirm the URL and result count update.

- [ ] **Step 8: Commit**

```bash
git add "app/(guest)/s/page.tsx" "app/(guest)/s/loading.tsx" "app/(guest)/s/page.test.tsx"
git commit -m "feat: build search results page"
```

---

### Task 13: `PropertyGallery` + `HostCard` components

**Files:**
- Create: `components/features/guest/property-gallery.tsx`
- Create: `components/features/guest/host-card.tsx`
- Test: `components/features/guest/property-gallery.test.tsx`
- Test: `components/features/guest/host-card.test.tsx`

**Interfaces:**
- Consumes: `Dialog`, `DialogContent` from `@/components/ui/dialog`; `Avatar`, `AvatarImage`, `AvatarFallback` from `@/components/ui/avatar`; `Host` from `@/types`.
- Produces: `PropertyGallery({ images, title })`, `HostCard({ host })` — both consumed by the property detail page (Task 15).

- [ ] **Step 1: Write the failing tests**

Create `components/features/guest/property-gallery.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PropertyGallery } from "@/components/features/guest/property-gallery"

describe("PropertyGallery", () => {
  const images = ["https://example.com/1.jpg", "https://example.com/2.jpg"]

  it("renders a thumbnail per image and switches the active one on click", async () => {
    const user = userEvent.setup()
    render(<PropertyGallery images={images} title="Test stay" />)
    const thumbnails = screen.getAllByRole("button", { name: /Show photo/i })
    expect(thumbnails).toHaveLength(2)
    await user.click(thumbnails[1])
    expect(thumbnails[1]).toHaveClass("ring-2")
  })

  it("shows a fallback when there are no images", () => {
    render(<PropertyGallery images={[]} title="Test stay" />)
    expect(screen.getByText("No photos yet")).toBeInTheDocument()
  })
})
```

Create `components/features/guest/host-card.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { HostCard } from "@/components/features/guest/host-card"

describe("HostCard", () => {
  it("renders the host name and response stats", () => {
    render(
      <HostCard
        host={{ name: "Ritika", responseRate: 98, avgResponseTimeMinutes: 15, badge: "Top Rated Host", otherListingsCount: 2 }}
      />
    )
    expect(screen.getByText("Hosted by Ritika")).toBeInTheDocument()
    expect(screen.getByText("98% response rate · responds in ~15 min")).toBeInTheDocument()
    expect(screen.getByText("2 other listings on Kiphaus")).toBeInTheDocument()
  })

  it("omits the other-listings line when the count is zero", () => {
    render(
      <HostCard host={{ name: "Neha", responseRate: 85, avgResponseTimeMinutes: 90, badge: null, otherListingsCount: 0 }} />
    )
    expect(screen.queryByText(/other listing/)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- components/features/guest/property-gallery.test.tsx components/features/guest/host-card.test.tsx`
Expected: FAIL — modules don't exist.

- [ ] **Step 3: Implement `PropertyGallery`**

Create `components/features/guest/property-gallery.tsx`:

```tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-3xl bg-muted text-sm text-muted-foreground">
        No photos yet
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="relative block aspect-[16/9] w-full overflow-hidden rounded-3xl bg-muted"
      >
        <Image src={images[activeIndex]} alt={title} fill className="object-cover" sizes="100vw" priority />
      </button>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1} of ${images.length}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl",
                index === activeIndex && "ring-2 ring-ring"
              )}
            >
              <Image src={image} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="sm:max-w-3xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image src={images[activeIndex]} alt={title} fill className="object-contain" sizes="100vw" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 4: Implement `HostCard`**

Create `components/features/guest/host-card.tsx`:

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Host } from "@/types"

export function HostCard({ host }: { host: Host }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
      <Avatar size="lg">
        {host.photo && <AvatarImage src={host.photo} alt={host.name} />}
        <AvatarFallback>{host.name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">Hosted by {host.name}</p>
        <p className="text-sm text-muted-foreground">
          {host.responseRate}% response rate · responds in ~{host.avgResponseTimeMinutes} min
        </p>
        {host.badge && <p className="text-sm text-muted-foreground">{host.badge}</p>}
        {host.otherListingsCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {host.otherListingsCount} other {host.otherListingsCount === 1 ? "listing" : "listings"} on Kiphaus
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm run test -- components/features/guest/property-gallery.test.tsx components/features/guest/host-card.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add components/features/guest/property-gallery.tsx components/features/guest/host-card.tsx components/features/guest/property-gallery.test.tsx components/features/guest/host-card.test.tsx
git commit -m "feat: add PropertyGallery and HostCard components"
```

---

### Task 14: `ReviewSummary` + `ReviewCard` components

**Files:**
- Create: `components/features/guest/review-summary.tsx`
- Create: `components/features/guest/review-card.tsx`
- Test: `components/features/guest/review-summary.test.tsx`
- Test: `components/features/guest/review-card.test.tsx`

**Interfaces:**
- Consumes: `ReviewBreakdown`, `Review` from `@/types`.
- Produces: `ReviewSummary({ rating, reviewCount, breakdown })`, `ReviewCard({ review })` — both consumed by the property detail page (Task 15).

- [ ] **Step 1: Write the failing tests**

Create `components/features/guest/review-summary.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ReviewSummary } from "@/components/features/guest/review-summary"

describe("ReviewSummary", () => {
  it("renders the overall rating and every category", () => {
    render(
      <ReviewSummary
        rating={4.9}
        reviewCount={34}
        breakdown={{ cleanliness: 4.9, accuracy: 4.8, checkIn: 4.7, communication: 4.9, location: 4.8, value: 4.7 }}
      />
    )
    expect(screen.getByText("★ 4.9", { exact: false })).toBeInTheDocument()
    expect(screen.getByText("(34 reviews)")).toBeInTheDocument()
    expect(screen.getByText("Cleanliness")).toBeInTheDocument()
    expect(screen.getByText("Check-in")).toBeInTheDocument()
  })
})
```

Create `components/features/guest/review-card.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ReviewCard } from "@/components/features/guest/review-card"

describe("ReviewCard", () => {
  it("renders author, text, and host reply when present", () => {
    render(
      <ReviewCard
        review={{ id: "r1", author: "Ananya", date: "2026-05-10", rating: 5, text: "Great stay!", hostReply: "Thanks!" }}
      />
    )
    expect(screen.getByText("Ananya")).toBeInTheDocument()
    expect(screen.getByText("Great stay!")).toBeInTheDocument()
    expect(screen.getByText("Thanks!")).toBeInTheDocument()
  })

  it("omits the host reply block when absent", () => {
    render(<ReviewCard review={{ id: "r2", author: "Rahul", date: "2026-05-11", rating: 4, text: "Good." }} />)
    expect(screen.queryByText("Host reply:")).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- components/features/guest/review-summary.test.tsx components/features/guest/review-card.test.tsx`
Expected: FAIL — modules don't exist.

- [ ] **Step 3: Implement `ReviewSummary`**

Create `components/features/guest/review-summary.tsx`:

```tsx
import type { ReviewBreakdown } from "@/types"

const CATEGORY_LABELS: Record<keyof ReviewBreakdown, string> = {
  cleanliness: "Cleanliness",
  accuracy: "Accuracy",
  checkIn: "Check-in",
  communication: "Communication",
  location: "Location",
  value: "Value",
}

export function ReviewSummary({
  rating,
  reviewCount,
  breakdown,
}: {
  rating: number
  reviewCount: number
  breakdown: ReviewBreakdown
}) {
  const categories = Object.keys(CATEGORY_LABELS) as (keyof ReviewBreakdown)[]

  return (
    <div className="space-y-4">
      <p className="text-2xl font-semibold">
        ★ {rating.toFixed(1)} <span className="text-base font-normal text-muted-foreground">({reviewCount} reviews)</span>
      </p>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {categories.map((key) => (
          <div key={key} className="flex items-center justify-between gap-4 text-sm">
            <span>{CATEGORY_LABELS[key]}</span>
            <span className="text-muted-foreground">{breakdown[key].toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement `ReviewCard`**

Create `components/features/guest/review-card.tsx`:

```tsx
import type { Review } from "@/types"

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="space-y-1 border-b border-border py-4 last:border-b-0">
      <p className="font-medium">{review.author}</p>
      <p className="text-xs text-muted-foreground">
        {review.date} · ★ {review.rating.toFixed(1)}
      </p>
      <p className="text-sm">{review.text}</p>
      {review.hostReply && (
        <p className="mt-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Host reply: </span>
          {review.hostReply}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm run test -- components/features/guest/review-summary.test.tsx components/features/guest/review-card.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add components/features/guest/review-summary.tsx components/features/guest/review-card.tsx components/features/guest/review-summary.test.tsx components/features/guest/review-card.test.tsx
git commit -m "feat: add ReviewSummary and ReviewCard components"
```

---

### Task 15: Property detail page

**Files:**
- Create: `app/(guest)/rooms/[id]/page.tsx` (currently a 1-line stub — replace it)
- Create: `app/(guest)/rooms/[id]/loading.tsx`
- Test: `app/(guest)/rooms/[id]/page.test.tsx`

**Interfaces:**
- Consumes: `SiteHeader`, `SiteFooter` (Task 8), `PropertyGallery`, `HostCard` (Task 13), `TrustBadgeRow` (Task 5), `ReviewSummary`, `ReviewCard` (Task 14), `WhatsAppGateModal` (Task 6), `PropertyCard` (Task 7), `propertyById`, `propertiesByCity` (Task 3), `notFound` from `next/navigation`.

- [ ] **Step 1: Write the failing tests**

Create `app/(guest)/rooms/[id]/page.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import PropertyDetailPage from "@/app/(guest)/rooms/[id]/page"
import { propertyById } from "@/lib/mock-data"

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
}))

describe("PropertyDetailPage", () => {
  it("renders the property title, price, and host name", async () => {
    const property = propertyById("p1")!
    const jsx = await PropertyDetailPage({ params: Promise.resolve({ id: "p1" }) })
    render(jsx)
    expect(screen.getByRole("heading", { name: property.title })).toBeInTheDocument()
    expect(screen.getByText("₹4,200", { exact: false })).toBeInTheDocument()
    expect(screen.getByText(`Hosted by ${property.hostName}`)).toBeInTheDocument()
  })

  it("calls notFound for an unknown id", async () => {
    await expect(PropertyDetailPage({ params: Promise.resolve({ id: "does-not-exist" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    )
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test -- "app/(guest)/rooms/[id]/page.test.tsx"`
Expected: FAIL — current `page.tsx` is a 1-line stub.

- [ ] **Step 3: Implement the page**

Replace the contents of `app/(guest)/rooms/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation"
import { Heart, MessageCircle } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { PropertyGallery } from "@/components/features/guest/property-gallery"
import { TrustBadgeRow } from "@/components/features/guest/trust-badge-row"
import { HostCard } from "@/components/features/guest/host-card"
import { ReviewSummary } from "@/components/features/guest/review-summary"
import { ReviewCard } from "@/components/features/guest/review-card"
import { WhatsAppGateModal } from "@/components/features/guest/whatsapp-gate-modal"
import { PropertyCard } from "@/components/features/guest/property-card"
import { Button } from "@/components/ui/button"
import { propertiesByCity, propertyById } from "@/lib/mock-data"

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = propertyById(id)
  if (!property) notFound()

  const similar = propertiesByCity(property.city)
    .filter((candidate) => candidate.id !== property.id)
    .slice(0, 3)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
        <h1 className="font-perfectly-nineties-regular text-3xl">{property.title}</h1>
        <p className="mt-1 text-muted-foreground">
          {property.city}, {property.region}
        </p>

        <div className="mt-6">
          <PropertyGallery images={property.images} title={property.title} />
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>{property.guests} guests</span>
              <span>{property.beds} beds</span>
              <span>{property.propertyType}</span>
            </div>

            <TrustBadgeRow verificationLevel={property.verificationLevel} hostBadge={property.hostBadge} />

            <p>{property.description}</p>

            <div>
              <h2 className="font-perfectly-nineties-regular text-2xl">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {property.amenities.map((amenity) => (
                  <li key={amenity}>{amenity}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-perfectly-nineties-regular text-2xl">House rules</h2>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {property.houseRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                Cancellation policy: <span className="font-medium">{property.cancellationPolicy}</span>
              </p>
            </div>

            <HostCard host={property.host} />

            <div>
              <h2 className="font-perfectly-nineties-regular text-2xl">Reviews</h2>
              <div className="mt-4">
                <ReviewSummary rating={property.rating} reviewCount={property.reviewCount} breakdown={property.reviewBreakdown} />
              </div>
              <div className="mt-4">
                {property.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Located in {property.city}, {property.region}. The exact address is shared once the host confirms
              your booking.
            </p>
          </div>

          <aside className="h-fit space-y-4 rounded-3xl border border-border bg-card p-5">
            <p className="text-2xl font-semibold">
              ₹{property.pricePerNight.toLocaleString("en-IN")}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ night, all-in</span>
            </p>
            <WhatsAppGateModal variant="contact" triggerRender={<Button className="w-full rounded-full" />}>
              <MessageCircle className="size-4" />
              Book via WhatsApp
            </WhatsAppGateModal>
            <WhatsAppGateModal
              variant="save"
              triggerRender={<Button variant="outline" className="w-full rounded-full" />}
            >
              <Heart className="size-4" />
              Save to wishlist
            </WhatsAppGateModal>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-perfectly-nineties-regular text-2xl">More stays in {property.city}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((candidate) => (
                <PropertyCard key={candidate.id} property={candidate} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
```

- [ ] **Step 4: Implement the loading skeleton**

Create `app/(guest)/rooms/[id]/loading.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function PropertyDetailLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 pt-28 pb-20">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-2 h-5 w-1/3" />
      <Skeleton className="mt-6 h-80 w-full rounded-3xl" />
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm run test -- "app/(guest)/rooms/[id]/page.test.tsx"`
Expected: PASS (2 tests)

- [ ] **Step 6: Invoke `/senior-frontend` code-review pass**

Scope to `app/(guest)/rooms/[id]/page.tsx`. Apply corrections, re-run Step 5.

- [ ] **Step 7: Browser verification**

Run: `npm run dev`. Via Playwright MCP: navigate to `/rooms/p1`, click a gallery thumbnail and confirm the active image switches, click "Book via WhatsApp" and confirm the gate modal opens with the contact copy, click "Save to wishlist" and confirm the save copy, navigate to `/rooms/does-not-exist` and confirm Next's not-found page renders. Screenshot each at both light/dark theme and at a 390px viewport; check `browser_console_messages` for errors throughout.

- [ ] **Step 8: Commit**

```bash
git add "app/(guest)/rooms/[id]/page.tsx" "app/(guest)/rooms/[id]/loading.tsx" "app/(guest)/rooms/[id]/page.test.tsx"
git commit -m "feat: build property detail page"
```

---

### Task 16: Cross-cutting audit and DESIGN.md/CLAUDE.md resync

**Files:**
- Modify: `CLAUDE.md`
- Possibly modify: any file flagged by the `/ui-ux-pro-max` audit pass in Step 1
- Possibly modify: `DESIGN.md` (only if `/impeccable` scan mode finds real drift)

**Interfaces:**
- Consumes: everything built in Tasks 1-15. This task changes no public interfaces — it is a verification and doc-hygiene pass.

- [ ] **Step 1: Run `/ui-ux-pro-max` audit**

Scope it to `app/page.tsx`, `app/(guest)/s/page.tsx`, `app/(guest)/rooms/[id]/page.tsx`, and every component under `components/features/guest/` and `components/layout/`. Apply any fixes it surfaces (contrast, focus order, touch-target size, copy clarity, WCAG 2.1 AA gaps).

- [ ] **Step 2: Re-run the full test suite and typecheck after any Step 1 fixes**

Run: `npm run test`
Expected: PASS (all tests from Tasks 1-15)

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Run `/impeccable` in scan mode**

Scope it to the full app to re-sync `DESIGN.md` against what actually shipped, per `CLAUDE.md`'s own instruction ("Once real on-brand components exist, re-run `/impeccable document` in scan mode to replace the seed with real tokens"). Apply any token corrections it surfaces to `DESIGN.md` and/or `app/globals.css`.

- [ ] **Step 4: Full Playwright walkthrough**

Via Playwright MCP: `/` → click "Search stays" → `/s?city=Goa` → click a `PropertyCard` → `/rooms/p8` → click "Book via WhatsApp" → confirm the gate modal → close it → click "Save to wishlist" → confirm the gate modal. Repeat the same walkthrough in dark theme and at a 390×844 viewport. Screenshot each step; confirm zero console errors throughout via `browser_console_messages`.

- [ ] **Step 5: Update `CLAUDE.md`**

In the "Design Context" section, replace the paragraph starting "DESIGN.md is currently a seed..." and the "Known off-brand prior art" paragraph with:

```markdown
- **DESIGN.md is resolved**: the Portal system (iOS-blue `#007aff` accent, Perfectly Nineties/Playfair display serif, Inter body, 50px pill buttons, glow-ring elevation) is the confirmed Kiphaus brand direction as of 2026-07-16 — see `docs/superpowers/specs/2026-07-16-guest-discovery-slice-design.md` for the decision record.
- **Guest discovery slice shipped**: `components/layout/site-header.tsx`, `site-footer.tsx`, and `components/features/guest/*` are the current source of truth for on-brand components — not the deleted `header.tsx`/`listing-card.tsx` this file used to reference.
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md DESIGN.md app/globals.css
git commit -m "docs: resync CLAUDE.md and DESIGN.md after guest discovery slice"
```

---

## Self-Review Notes

- **Spec coverage:** every section of `docs/superpowers/specs/2026-07-16-guest-discovery-slice-design.md` maps to a task — routes (Tasks 10, 12, 15), data layer (Task 3), component inventory (Tasks 5-9, 11, 13-14), page structure (Tasks 10, 12, 15), WhatsApp/wishlist gate (Task 6, wired in Tasks 7 and 15), non-functional requirements (empty-state copy in Task 11, skeletons in Tasks 12/15, a11y in Task 16 Step 1), tooling application (`/frontend-design` in Tasks 5/7/8/9, `/senior-frontend` in Tasks 10/12/15, `/ui-ux-pro-max` + `/impeccable` in Task 16, Playwright verification in Tasks 10/12/15/16), and the deferred-scope list (nothing in this plan touches auth/host/admin routes).
- **Type consistency:** `Property`, `Host`, `Review`, `ReviewBreakdown`, `SearchParams` are defined once in Task 2 and imported everywhere else — no redeclaration. `WhatsAppGateModal`'s `triggerRender`/`children` signature (Task 6) is used identically in Tasks 7 and 15.
- **Base UI composition:** every `Dialog`/`Button` composition in this plan follows the `render` prop pattern confirmed against the installed `components/ui/dialog.tsx` — no `asChild` usage.
