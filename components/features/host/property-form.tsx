import Link from "next/link"
import { ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { HOST_AMENITY_OPTIONS } from "@/lib/mock-data"
import { PillRadio } from "@/components/features/host/pill-radio"
import type { CancellationPolicy, Property, PropertyType } from "@/types"

const PROPERTY_TYPES: PropertyType[] = ["Homestay", "Villa", "Farm Stay", "Heritage Home"]
const CANCELLATION_POLICIES: CancellationPolicy[] = ["Flexible", "Moderate", "Firm"]

const fieldClass =
  "rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
const labelClass = "text-body-sm font-medium text-graphite tracking-body-sm"

export function PropertyForm({
  property,
  submitLabel,
  onSubmitHref,
}: {
  property?: Property
  submitLabel: string
  onSubmitHref: string
}) {
  return (
    <div className="space-y-10">
      <section aria-labelledby="basics">
        <h2 id="basics" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
          Property basics
        </h2>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className={labelClass}>Listing title</Label>
            <Input id="title" defaultValue={property?.title} placeholder="Aravali Ridge Studio with Terrace" className={fieldClass} />
          </div>

          <div className="space-y-2">
            <Label className={labelClass}>Property type</Label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <PillRadio key={type} name="propertyType" value={type} defaultChecked={(property?.propertyType ?? PROPERTY_TYPES[0]) === type}>
                  {type}
                </PillRadio>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city" className={labelClass}>City</Label>
              <Input id="city" defaultValue={property?.city} placeholder="Gurugram" className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region" className={labelClass}>State / region</Label>
              <Input id="region" defaultValue={property?.region} placeholder="Delhi NCR" className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests" className={labelClass}>Guests</Label>
              <Input id="guests" type="number" min={1} defaultValue={property?.guests} className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beds" className={labelClass}>Beds</Label>
              <Input id="beds" type="number" min={1} defaultValue={property?.beds} className={fieldClass} />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="photos">
        <h2 id="photos" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Photos</h2>
        <p className="mt-1 text-body-sm text-smoke tracking-body-sm">
          Add at least 5 photos. Your Level 3 video walkthrough doubles as a trust signal here too.
        </p>
        <button
          type="button"
          className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-smoke transition-colors hover:border-graphite/50"
        >
          <ImagePlus className="size-6" aria-hidden="true" />
          <span className="text-body-sm font-medium tracking-body-sm">Add photos</span>
        </button>
      </section>

      <Separator />

      <section aria-labelledby="amenities">
        <h2 id="amenities" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Amenities & house rules</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {HOST_AMENITY_OPTIONS.map((amenity) => {
            const id = `amenity-${amenity}`
            return (
              <div key={amenity} className="flex items-center gap-2">
                <Checkbox id={id} defaultChecked={property?.amenities.includes(amenity)} />
                <Label htmlFor={id} className="text-body-sm font-normal text-graphite tracking-body-sm">{amenity}</Label>
              </div>
            )
          })}
        </div>
        <div className="mt-6 space-y-2">
          <Label htmlFor="house-rules" className={labelClass}>House rules</Label>
          <Textarea
            id="house-rules"
            rows={4}
            defaultValue={property?.houseRules.join("\n")}
            placeholder={"Check-in after 1:00 PM, check-out before 11:00 AM\nNo smoking indoors"}
            className="rounded-2xl border-border bg-transparent px-5 py-4 text-body hover:border-graphite/50 transition-colors"
          />
        </div>
      </section>

      <Separator />

      <section aria-labelledby="pricing">
        <h2 id="pricing" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Pricing & policy</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price" className={labelClass}>Price per night (₹)</Label>
            <Input id="price" type="number" min={0} defaultValue={property?.pricePerNight} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cleaning-fee" className={labelClass}>Cleaning fee (₹)</Label>
            <Input id="cleaning-fee" type="number" min={0} defaultValue={1500} className={fieldClass} />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <Label className={labelClass}>Cancellation policy</Label>
          <div className="flex flex-wrap gap-2">
            {CANCELLATION_POLICIES.map((policy) => (
              <PillRadio key={policy} name="cancellationPolicy" value={policy} defaultChecked={(property?.cancellationPolicy ?? "Flexible") === policy}>
                {policy}
              </PillRadio>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button
          className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          render={<Link href={onSubmitHref} />}
          nativeButton={false}
        >
          {submitLabel}
        </Button>
        <Button
          variant="outline"
          className="rounded-full h-[50px] px-8 border-border font-semibold text-graphite"
          render={<Link href="/host/properties" />}
          nativeButton={false}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
