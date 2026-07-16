"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { cn } from "@/lib/utils"
import { searchCities } from "@/lib/mock-data"

const fieldClass =
  "flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-5 py-3 md:py-2"
const labelClass =
  "text-micro font-semibold tracking-[0.08em] text-muted-foreground uppercase"
const controlClass =
  "h-auto w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-sm font-medium text-foreground shadow-none"
const selectControlClass = cn(
  "w-full",
  "[&_select]:h-auto [&_select]:w-full [&_select]:min-w-0 [&_select]:rounded-none [&_select]:border-0 [&_select]:bg-transparent [&_select]:p-0 [&_select]:pr-5 [&_select]:text-sm [&_select]:font-medium [&_select]:text-foreground [&_select]:shadow-none"
)

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [checkin, setCheckin] = useState("")
  const [checkout, setCheckout] = useState("")
  const [guests, setGuests] = useState(2)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (checkin) params.set("checkin", checkin)
    if (checkout) params.set("checkout", checkout)
    params.set("guests", String(guests))
    router.push(`/s?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow-glow)] md:flex-row md:items-stretch md:rounded-full",
        className
      )}
    >
      <div className="flex flex-1 flex-col divide-y divide-border md:flex-row md:divide-x md:divide-y-0">
        <label className={fieldClass}>
          <span className={labelClass}>City</span>
          <NativeSelect
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={selectControlClass}
          >
            <NativeSelectOption value="">Anywhere in India</NativeSelectOption>
            {searchCities.map((cityOption) => (
              <NativeSelectOption key={cityOption} value={cityOption}>
                {cityOption}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Check-in</span>
          <Input
            type="date"
            value={checkin}
            onChange={(event) => setCheckin(event.target.value)}
            className={controlClass}
          />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Check-out</span>
          <Input
            type="date"
            value={checkout}
            onChange={(event) => setCheckout(event.target.value)}
            className={controlClass}
          />
        </label>
        <label className={cn(fieldClass, "md:max-w-[112px]")}>
          <span className={labelClass}>Guests</span>
          <Input
            type="number"
            min={1}
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value))}
            className={controlClass}
          />
        </label>
      </div>
      <div className="flex items-center justify-center border-t border-border p-2.5 md:border-t-0 md:pr-2 md:pl-1">
        <Button
          type="submit"
          aria-label="Search stays"
          className="size-11 shrink-0 rounded-full bg-primary p-0 text-primary-foreground shadow-[var(--shadow-button)] hover:bg-primary/90"
        >
          <Search className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  )
}
