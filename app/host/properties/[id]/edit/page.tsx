import { notFound } from "next/navigation"
import { FadeIn } from "@/components/motion/fade-in"
import { HostShell } from "@/components/features/host/host-shell"
import { PropertyForm } from "@/components/features/host/property-form"
import { propertyById } from "@/lib/mock-data"

export default async function HostPropertyEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = propertyById(id)
  if (!property) notFound()

  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Edit property</h1>
      <p className="mt-2 max-w-xl text-body-sm text-smoke tracking-body-sm">
        Changes to verified details (address, ownership) may re-trigger Level 2 review.
      </p>
      <FadeIn inView={false} className="mt-10 max-w-2xl">
        <PropertyForm property={property} submitLabel="Save changes" onSubmitHref="/host/properties" />
      </FadeIn>
    </HostShell>
  )
}
