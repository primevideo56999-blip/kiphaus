"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { LayoutGrid, Map as MapIcon, Columns, Navigation, MapPin } from "lucide-react"
import { PropertyCard } from "@/components/features/guest/property-card"
import { EmptyState } from "@/components/features/guest/empty-state"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { fetchProperties } from "@/lib/api"
import type { Property } from "@/types"

// Dynamic import Leaflet map with SSR disabled
const PropertyMap = dynamic(() => import("@/components/features/guest/property-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[550px] w-full rounded-3xl bg-muted animate-pulse flex items-center justify-center text-smoke font-medium">
      Loading interactive map…
    </div>
  ),
})

interface PropertySearchClientProps {
  results: Property[]
  city?: string
}

export function PropertySearchClient({ results: initialResults, city }: PropertySearchClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "split" | "map">("split")
  const [properties, setProperties] = useState<Property[]>(initialResults)
  const [isLocating, setIsLocating] = useState(false)
  const [locationActive, setLocationActive] = useState(false)

  useEffect(() => {
    // Automatically attempt geolocation if user hasn't explicitly searched for a specific city
    if (!city && typeof window !== "undefined" && "geolocation" in navigator) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const locationSorted = await fetchProperties({
              nearLat: latitude,
              nearLng: longitude,
            })
            if (locationSorted.length > 0) {
              setProperties(locationSorted)
              setLocationActive(true)
            }
          } catch {
            // Keep default initial results if request fails
          } finally {
            setIsLocating(false)
          }
        },
        () => {
          setIsLocating(false)
        },
        { timeout: 8000 }
      )
    }
  }, [city])

  if (properties.length === 0) {
    return (
      <FadeIn inView={false}>
        <EmptyState city={city} />
      </FadeIn>
    )
  }

  return (
    <div className="space-y-6">
      {/* Location Banner */}
      {locationActive && (
        <div className="flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
          <Navigation className="size-3.5 fill-primary" />
          <span>Showing stays near your location first — followed by all other stays across India</span>
        </div>
      )}

      {/* Header bar with Count and View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink-black">
            {properties.length} {properties.length === 1 ? "stay" : "stays"}
            {city ? ` in ${city}` : ""}
          </p>
          {isLocating && (
            <span className="text-xs font-medium text-smoke animate-pulse flex items-center gap-1">
              <MapPin className="size-3" /> Detecting your location...
            </span>
          )}
        </div>

        {/* View mode toggle buttons */}
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-ash-mist/50 p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "grid" ? "bg-background text-ink-black shadow-sm" : "text-smoke hover:text-ink-black"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`hidden sm:flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "split" ? "bg-background text-ink-black shadow-sm" : "text-smoke hover:text-ink-black"
            }`}
          >
            <Columns className="size-3.5" />
            Split
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "map" ? "bg-background text-ink-black shadow-sm" : "text-smoke hover:text-ink-black"
            }`}
          >
            <MapIcon className="size-3.5" />
            Map
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {viewMode === "grid" && (
        <StaggerList inView={false} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <StaggerItem key={property.id}>
              <PropertyCard property={property} />
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      {viewMode === "map" && (
        <div className="w-full">
          <PropertyMap properties={properties} className="h-[650px] w-full" />
        </div>
      )}

      {viewMode === "split" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Property Cards column */}
          <div className="lg:col-span-7 xl:col-span-6">
            <StaggerList inView={false} className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {properties.map((property) => (
                <StaggerItem key={property.id}>
                  <PropertyCard property={property} />
                </StaggerItem>
              ))}
            </StaggerList>
          </div>

          {/* Sticky Map column */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6">
            <div className="sticky top-24">
              <PropertyMap properties={properties} className="h-[calc(100vh-140px)] min-h-[500px] w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
