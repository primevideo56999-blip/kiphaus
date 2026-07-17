import type {
  CancellationPolicy,
  Host,
  HostBadge,
  ListingStatus,
  Property,
  PropertyType,
  Review,
  ReviewBreakdown,
  SearchParams,
  SubscriptionPlanId,
  VerificationLevel,
  VerificationStepStatus,
} from "@/types"

export type { SearchParams }

type BaseProperty = {
  id: string
  slug: string
  title: string
  propertyType: PropertyType
  city: string
  region: string
  lat: number
  lng: number
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
    lat: 28.4211,
    lng: 77.0431,
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
    lat: 28.4165,
    lng: 77.0900,
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
    lat: 28.4909,
    lng: 77.0879,
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
    lat: 28.2903,
    lng: 77.0483,
    guests: 10,
    beds: 4,
    pricePerNight: 12800,
    rating: 5.0,
    reviewCount: 8,
    verificationLevel: 4,
    hostName: "Vikram",
    hostBadge: "Top Rated Host",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    featured: true,
  },
  {
    id: "p5",
    slug: "hauz-khas-heritage-haveli-delhi",
    title: "Hauz Khas Heritage Haveli Room",
    propertyType: "Heritage Home",
    city: "New Delhi",
    region: "Delhi NCR",
    lat: 28.5535,
    lng: 77.2004,
    guests: 3,
    beds: 1,
    pricePerNight: 5600,
    rating: 4.9,
    reviewCount: 45,
    verificationLevel: 4,
    hostName: "Imran",
    hostBadge: "Top Rated Host",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    featured: true,
  },
  {
    id: "p6",
    slug: "vasant-vihar-garden-flat-delhi",
    title: "Vasant Vihar Garden-Facing Flat",
    propertyType: "Homestay",
    city: "New Delhi",
    region: "Delhi NCR",
    lat: 28.5581,
    lng: 77.1588,
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
    lat: 28.5459,
    lng: 77.3610,
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
    lat: 15.5439,
    lng: 73.7553,
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
    lat: 15.5928,
    lng: 73.7826,
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
    lat: 15.6469,
    lng: 73.7469,
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
    lat: 15.5553,
    lng: 73.7517,
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
    lat: 32.2549,
    lng: 77.1734,
    guests: 4,
    beds: 2,
    pricePerNight: 3200,
    rating: 4.9,
    reviewCount: 52,
    verificationLevel: 4,
    hostName: "Deepika",
    hostBadge: "Top Rated Host",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    featured: true,
  },
  {
    id: "p13",
    slug: "tapovan-ganga-view-rishikesh",
    title: "Tapovan Ganga-View Cottage",
    propertyType: "Homestay",
    city: "Rishikesh",
    region: "Uttarakhand",
    lat: 30.1298,
    lng: 78.2870,
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
    lat: 24.5764,
    lng: 73.6797,
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
    lat: 12.3375,
    lng: 75.8069,
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
    images: base.image ? [
      base.image,
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    ] : [],
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

export type TripStatus = "upcoming" | "completed" | "cancelled"

export type Trip = {
  id: string
  property: Property
  checkIn: string
  checkOut: string
  guests: number
  status: TripStatus
  totalPaid: number
}

// ponytail: trip/thread history is generated from existing mock properties,
// standing in for a bookings table until the real backend exists.
function buildTrips(): Trip[] {
  return [
    { id: "t1", property: properties[0], checkIn: "2026-08-14", checkOut: "2026-08-17", guests: 2, status: "upcoming", totalPaid: properties[0].pricePerNight * 3 },
    { id: "t2", property: properties[7], checkIn: "2026-03-02", checkOut: "2026-03-06", guests: 4, status: "completed", totalPaid: properties[7].pricePerNight * 4 },
    { id: "t3", property: properties[11], checkIn: "2026-01-10", checkOut: "2026-01-12", guests: 2, status: "completed", totalPaid: properties[11].pricePerNight * 2 },
    { id: "t4", property: properties[3], checkIn: "2025-12-24", checkOut: "2025-12-26", guests: 6, status: "cancelled", totalPaid: 0 },
  ]
}

export const trips: Trip[] = buildTrips()

export type MessageThread = {
  id: string
  property: Property
  lastMessage: string
  lastMessageAt: string
  unread: boolean
}

function buildThreads(): MessageThread[] {
  return [
    { id: "m1", property: properties[0], lastMessage: "Sure, check-in from 1 PM works great. See you soon!", lastMessageAt: "2026-07-15", unread: true },
    { id: "m2", property: properties[7], lastMessage: "Thank you for staying with us — hope you had a great trip.", lastMessageAt: "2026-03-07", unread: false },
    { id: "m3", property: properties[13], lastMessage: "Is early check-in possible on the 10th?", lastMessageAt: "2026-01-05", unread: false },
  ]
}

export const messageThreads: MessageThread[] = buildThreads()

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  readMinutes: number
  publishedAt: string
  image: string
  featured?: boolean
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-kiphaus-verifies-every-host",
    title: "How Kiphaus verifies every host before they go live",
    excerpt: "A look inside the four-level verification framework — identity, property, video, and on-site — that every Kiphaus listing passes before guests can book.",
    category: "Trust & Safety",
    readMinutes: 6,
    publishedAt: "2026-06-18",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    featured: true,
  },
  {
    slug: "why-we-dont-hide-fees",
    title: "Why the price you see is the price you pay",
    excerpt: "Fee-reveal-at-checkout inflates a ₹4,000 listing to ₹6,000 by the time you pay. Here's why Kiphaus shows the all-in total from the first screen.",
    category: "Transparent Pricing",
    readMinutes: 4,
    publishedAt: "2026-05-30",
    image: "https://images.unsplash.com/photo-1542690969-5a2050285637",
  },
  {
    slug: "goa-villas-for-family-weekends",
    title: "8 verified Goa villas built for family weekends",
    excerpt: "Private pools, real host reviews, and WhatsApp-direct contact — a shortlist of Goa stays we'd actually book for our own families.",
    category: "Destination Guide",
    readMinutes: 7,
    publishedAt: "2026-05-12",
    image: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff",
  },
  {
    slug: "talking-to-your-host-on-whatsapp",
    title: "Why every Kiphaus conversation happens on WhatsApp",
    excerpt: "No platform inbox, no gatekeeping. Here's the thinking behind routing every guest-host conversation straight to WhatsApp.",
    category: "Product",
    readMinutes: 3,
    publishedAt: "2026-04-22",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  },
  {
    slug: "hosting-without-a-tech-team",
    title: "Listing your first homestay without a tech team",
    excerpt: "From onboarding to your first booking — what it actually takes for a first-time host to get verified and start hosting on Kiphaus.",
    category: "For Hosts",
    readMinutes: 8,
    publishedAt: "2026-04-02",
    image: "https://images.unsplash.com/photo-1682414180825-c0df1934387f",
  },
]

export const currentHost = {
  name: "Ritika Malhotra",
  email: "ritika.malhotra@example.com",
  phone: "+91 98000 00137",
  businessType: "Individual" as const,
  memberSince: "2025",
}

export type ListingStat = {
  property: Property
  status: ListingStatus
  views: number
  inquiries: number
  bookings: number
}

// ponytail: "my listings" is a fixed slice of the shared mock property
// catalog, standing in for a host_id-scoped query until the real backend exists.
export const hostListings: ListingStat[] = [
  { property: properties[0], status: "active", views: 842, inquiries: 12, bookings: 4 },
  { property: properties[1], status: "active", views: 519, inquiries: 7, bookings: 2 },
  { property: properties[2], status: "draft", views: 0, inquiries: 0, bookings: 0 },
]

export type VerificationStep = {
  level: VerificationLevel
  status: VerificationStepStatus
  detail: string
}

export const hostVerificationSteps: VerificationStep[] = [
  { level: 1, status: "approved", detail: "Aadhaar and mobile OTP verified on 2 Feb 2026." },
  { level: 2, status: "approved", detail: "Ownership documents approved on 9 Feb 2026." },
  { level: 3, status: "in_review", detail: "Video walkthrough submitted 14 Jul 2026 — review usually takes 2-3 business days." },
  { level: 4, status: "not_started", detail: "Unlocks once your video walkthrough is approved." },
]

export const hostSubscription = {
  plan: "premium" as SubscriptionPlanId,
  status: "active" as const,
  renewalDate: "2027-03-14",
  price: 4999,
}

export type HostInquiry = {
  id: string
  guestName: string
  property: Property
  message: string
  receivedAt: string
  status: "new" | "responded" | "booked"
}

export const hostInquiries: HostInquiry[] = [
  { id: "i1", guestName: "Kabir Anand", property: properties[0], message: "Is early check-in possible on the 14th?", receivedAt: "2026-07-16", status: "new" },
  { id: "i2", guestName: "Simran Kaur", property: properties[1], message: "Can we bring a small dog?", receivedAt: "2026-07-14", status: "responded" },
  { id: "i3", guestName: "Aditya Rao", property: properties[0], message: "Booked for the 14th-17th, thank you!", receivedAt: "2026-07-10", status: "booked" },
]

export const HOST_AMENITY_OPTIONS = [
  "Wi-Fi",
  "Air conditioning",
  "Kitchen",
  "Free parking",
  "Washing machine",
  "TV",
  "Geyser / hot water",
  "Power backup",
  "Pool",
  "Pet friendly",
  "Workspace",
  "Balcony / terrace",
]

export const currentGuest = {
  name: "Ananya Sharma",
  email: "ananya.sharma@example.com",
  phone: "+91 98765 43210",
  memberSince: "2025",
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
