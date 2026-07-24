"use client"

import dynamic from "next/dynamic"

const PropertyMap = dynamic(() => import("@/components/features/guest/property-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-2xl bg-muted animate-pulse flex items-center justify-center text-smoke text-sm font-medium">
      Loading map…
    </div>
  ),
})

interface RoomMapProps {
  lat?: number
  lng?: number
  label?: string
}

export function RoomMap({ lat, lng, label }: RoomMapProps) {
  return <PropertyMap lat={lat} lng={lng} label={label} />
}
