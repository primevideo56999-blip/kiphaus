import Link from "next/link"
import { MapPin } from "lucide-react"

export function EmptyState({ city }: { city?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center bg-card/50">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MapPin className="size-6" />
      </div>
      <h3 className="text-lg font-bold text-foreground">
        {city ? `No stays found in "${city}"` : `No homestays found`}
      </h3>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
        {city
          ? `We couldn't find any properties matching "${city}". Try searching another location or clear your search.`
          : `No homestays matched your selected criteria. Try clearing your search filters to see all available stays.`}
      </p>
      {city && (
        <div className="mt-2">
          <Link
            href="/s"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Clear Search & View All Stays
          </Link>
        </div>
      )}
    </div>
  )
}
