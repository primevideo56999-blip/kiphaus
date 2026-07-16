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
