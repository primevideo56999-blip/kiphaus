import Link from "next/link"
import { Plus } from "lucide-react"
import { HostShell } from "@/components/features/host/host-shell"
import { PropertyRow } from "@/components/features/host/property-row"
import { Button } from "@/components/ui/button"
import { hostListings, hostSubscription } from "@/lib/mock-data"

export default function HostPropertiesPage() {
  const canAddListing = hostSubscription.plan === "premium" || hostListings.length === 0

  return (
    <HostShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Properties</h1>
          <p className="mt-2 text-body-sm text-smoke tracking-body-sm">
            {hostListings.length} {hostListings.length === 1 ? "listing" : "listings"}
            {hostSubscription.plan === "basic" && " · Basic plan is limited to 1 listing"}
          </p>
        </div>
        <Button
          className="rounded-full h-[50px] px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          render={<Link href={canAddListing ? "/host/properties/new" : "/host/subscription"} />}
          nativeButton={false}
        >
          <Plus className="size-4" />
          Add property
        </Button>
      </div>

      <div className="mt-8">
        {hostListings.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
              You haven&rsquo;t listed a property yet. Add your first one to start getting verified.
            </p>
            <Button
              className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              render={<Link href="/host/properties/new" />}
              nativeButton={false}
            >
              Add your first property
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {hostListings.map((listing) => (
              <PropertyRow key={listing.property.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </HostShell>
  )
}
