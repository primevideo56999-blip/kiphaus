import Image from "next/image"
import Link from "next/link"
import { Eye, MessageSquare, CalendarCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { verificationLabel } from "@/types"
import { hostVerificationSteps, type ListingStat } from "@/lib/mock-data"

const propertyLevelApproved = hostVerificationSteps.find((step) => step.level === 2)?.status === "approved"

const STATUS_LABEL: Record<ListingStat["status"], string> = {
  active: "Active",
  draft: "Draft",
  paused: "Paused",
}

const STATUS_VARIANT: Record<ListingStat["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "outline",
  paused: "secondary",
}

export function PropertyRow({ listing }: { listing: ListingStat }) {
  const { property, status, views, inquiries, bookings } = listing

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-center">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-32">
        {property.images[0] ? (
          <Image src={property.images[0]} alt={property.title} fill className="object-cover" sizes="128px" />
        ) : (
          <div className="flex h-full items-center justify-center text-body-sm text-smoke tracking-body-sm">
            No photo yet
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
          <Badge variant="outline">{verificationLabel[property.verificationLevel]}</Badge>
        </div>
        <p className="mt-1 truncate font-semibold text-ink-black">{property.title}</p>
        <p className="truncate text-body-sm text-smoke tracking-body-sm">
          {property.city}, {property.region} · ₹{property.pricePerNight.toLocaleString("en-IN")}/night
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-body-sm text-smoke tracking-body-sm">
          <span className="flex items-center gap-1"><Eye className="size-3.5" /> {views} views</span>
          <span className="flex items-center gap-1"><MessageSquare className="size-3.5" /> {inquiries} inquiries</span>
          <span className="flex items-center gap-1"><CalendarCheck className="size-3.5" /> {bookings} bookings</span>
        </div>
        {status === "draft" && !propertyLevelApproved && (
          <p className="mt-2 text-body-sm text-destructive tracking-body-sm">
            Complete Level 2 verification to make this property visible to guests.
          </p>
        )}
      </div>

      <div className="flex w-full shrink-0 gap-2 sm:w-auto">
        {status === "draft" && (
          <Button
            className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground sm:flex-none"
            disabled={!propertyLevelApproved}
            title={!propertyLevelApproved ? "Complete Level 2 verification to make this property visible to guests." : undefined}
          >
            Publish
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1 rounded-full sm:flex-none"
          render={<Link href={`/host/properties/${property.id}/edit`} />}
          nativeButton={false}
        >
          Edit
        </Button>
      </div>
    </div>
  )
}
