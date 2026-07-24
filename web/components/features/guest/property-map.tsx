"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Property } from "@/types"

interface PropertyMapProps {
  properties?: Property[]
  lat?: number
  lng?: number
  label?: string
  className?: string
  center?: [number, number]
  zoom?: number
}
export default function PropertyMap({
  properties = [],
  lat,
  lng,
  label,
  className = "h-[500px] w-full rounded-2xl",
  center,
  zoom = 11,
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  const propList: Partial<Property>[] =
    properties.length > 0
      ? properties
      : typeof lat === "number" && typeof lng === "number"
      ? [{ id: "single", title: label ?? "Property Location", city: label ?? "", pricePerNight: 0, lat, lng }]
      : []

  useEffect(() => {
    if (!containerRef.current) return

    // Calculate map center if not explicitly provided
    let initialCenter: [number, number] = center || (typeof lat === "number" && typeof lng === "number" ? [lat, lng] : [28.4595, 77.0266])
    const validCoords = propList.filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
    
    if (!center && validCoords.length > 0) {
      const avgLat = validCoords.reduce((sum, p) => sum + (p.lat ?? 0), 0) / validCoords.length
      const avgLng = validCoords.reduce((sum, p) => sum + (p.lng ?? 0), 0) / validCoords.length
      initialCenter = [avgLat, avgLng]
    }

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      // OpenStreetMap Free Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
    } else {
      mapRef.current.setView(initialCenter, zoom)
    }

    const map = mapRef.current

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Add markers for properties
    const bounds = L.latLngBounds([])

    propList.forEach((property) => {
      // Fallback coordinate offset for demo properties if lat/lng null
      const lat = property.lat ?? (28.4595 + (Math.random() - 0.5) * 0.08)
      const lng = property.lng ?? (77.0266 + (Math.random() - 0.5) * 0.08)

      const latLng: [number, number] = [lat, lng]
      bounds.extend(latLng)

      // Price pill custom HTML icon
      const priceText = property.pricePerNight ? `₹${property.pricePerNight.toLocaleString("en-IN")}` : "Stay"
      const customHtmlIcon = L.divIcon({
        className: "custom-map-pill-marker",
        html: `<div style="
          background-color: #18181b;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 12px;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          white-space: nowrap;
          cursor: pointer;
        ">${priceText}</div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      })

      const marker = L.marker(latLng, { icon: customHtmlIcon }).addTo(map)

      // Popup Content
      const popupHtml = `
        <div style="width: 220px; font-family: system-ui, sans-serif; padding: 4px;">
          ${
            property.image
              ? `<img src="${property.image}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 12px; margin-bottom: 8px;" alt="${property.title}"/>`
              : ""
          }
          <div style="font-weight: 700; font-size: 14px; color: #09090b; line-height: 1.2; margin-bottom: 4px;">
            ${property.title}
          </div>
          <div style="font-size: 12px; color: #71717a; margin-bottom: 6px;">
            📍 ${property.city}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e4e4e7; pt: 6px; margin-top: 6px;">
            <div style="font-size: 14px; font-weight: 800; color: #18181b;">
              ₹${(property.pricePerNight ?? 0).toLocaleString("en-IN")}<span style="font-weight: 400; font-size: 11px; color: #71717a;"> /night</span>
            </div>
            <a href="/rooms/${property.id}" style="
              background: #2563eb;
              color: #ffffff;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
              padding: 4px 10px;
              border-radius: 9999px;
            ">View</a>
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, { maxWidth: 240 })
      markersRef.current.push(marker)
    })

    if (properties.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [properties, center, zoom])

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border shadow-sm">
      <div ref={containerRef} className={className} />
    </div>
  )
}
