"use client"

import { useRouter } from "next/navigation"
import { FadeIn } from "@/components/motion/fade-in"
import { HostShell } from "@/components/features/host/host-shell"
import { PropertyForm } from "@/components/features/host/property-form"

export default function HostPropertyNewPage() {
  const router = useRouter()

  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Add a property</h1>
      <p className="mt-2 max-w-xl text-body-sm text-smoke tracking-body-sm">
        Save your property details and photos to make your stay live and searchable.
      </p>
      <FadeIn inView={false} className="mt-10 max-w-2xl">
        <PropertyForm submitLabel="Save property" onSaved={(id) => router.push(`/host/properties/${id}/edit`)} />
      </FadeIn>
    </HostShell>
  )
}
