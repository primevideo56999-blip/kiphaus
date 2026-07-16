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
