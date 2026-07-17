import { HostShell } from "@/components/features/host/host-shell"
import { PropertyForm } from "@/components/features/host/property-form"

export default function HostPropertyNewPage() {
  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Add a property</h1>
      <p className="mt-2 max-w-xl text-body-sm text-smoke tracking-body-sm">
        Submitting kicks off verification for this listing — it won&rsquo;t be searchable until Level 1 & 2 are approved.
      </p>
      <div className="mt-10 max-w-2xl">
        <PropertyForm submitLabel="Submit for verification" onSubmitHref="/host/properties" />
      </div>
    </HostShell>
  )
}
