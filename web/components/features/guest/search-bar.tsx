"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { DateRange } from "react-day-picker"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns"
import {
  Search,
  MapPin,
  CalendarDays,
  Users,
  Minus,
  Plus,
  ChevronRight,
  Globe,
  Compass,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { searchCities } from "@/lib/mock-data"

const REGIONS = [
  { id: "gurugram-all", label: "All Gurugram", icon: Globe, query: "Gurugram" },
  { id: "golf-course", label: "Golf Course Rd", icon: MapPin, query: "Golf Course Road" },
  { id: "dlf-phase-3", label: "DLF Phase 3", icon: Compass, query: "DLF Phase 3" },
  { id: "cyber-city", label: "Cyber City", icon: MapPin, query: "Cyber City" },
  { id: "sohna-road", label: "Sohna Road", icon: Compass, query: "Sohna Road" },
  { id: "aravali", label: "Aravali Ridge", icon: Compass, query: "Aravali" },
]

const TRIP_LENGTHS = [
  { id: "weekend", label: "Weekend", days: 2 },
  { id: "week", label: "Week", days: 7 },
  { id: "month", label: "Month", days: 30 },
]

const FLEX_DAY_OPTIONS = [0, 1, 2, 3, 7, 14]
const MONTH_COUNT = 12

function formatDate(date?: Date) {
  return date ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : undefined
}

function toDateParam(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

type ActiveField = "where" | "when" | "who" | null

const FIELD_LABEL_CLASS = "text-micro font-extrabold tracking-widest uppercase text-foreground select-none"
const FIELD_VALUE_CLASS = "truncate text-sm font-medium text-muted-foreground group-hover:text-foreground"

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const [city, setCity] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [range, setRange] = useState<DateRange | undefined>()
  const [flexDays, setFlexDays] = useState(0)
  const [dateMode, setDateMode] = useState<"dates" | "flexible">("dates")
  const [tripLengthId, setTripLengthId] = useState<string | null>(null)
  const [monthIndex, setMonthIndex] = useState<number | null>(null)

  // Guest counters
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [pets, setPets] = useState(0)

  // Active popover section
  const [activeField, setActiveField] = useState<ActiveField>(null)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [mobileStep, setMobileStep] = useState<"where" | "when" | "who">("where")

  const reduceMotion = useReducedMotion()
  const carouselRef = useRef<HTMLDivElement>(null)

  const totalGuests = adults + children

  const [geoSuggestions, setGeoSuggestions] = useState<{ displayName: string; name: string; city: string; lat?: number; lng?: number }[]>([])
  const [isSearchingGeo, setIsSearchingGeo] = useState(false)

  useEffect(() => {
    if (!citySearch || citySearch.trim().length < 2) {
      setGeoSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearchingGeo(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(citySearch.trim())}&countrycodes=in&addressdetails=1&limit=5`, {
          headers: { "Accept-Language": "en" }
        })
        if (res.ok) {
          const data = await res.json()
          const suggestions = data.map((item: any) => {
            const city = item.address?.city || item.address?.town || item.address?.village || item.address?.state_district || item.name || citySearch
            return {
              displayName: item.display_name,
              name: item.name || city,
              city: city,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            }
          })
          setGeoSuggestions(suggestions)
        }
      } catch {
        setGeoSuggestions([])
      } finally {
        setIsSearchingGeo(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [citySearch])

  const filteredCities = useMemo(
    () => searchCities.filter((option) => option.toLowerCase().includes(citySearch.toLowerCase())),
    [citySearch]
  )

  const months = useMemo(() => {
    const start = startOfMonth(new Date())
    return Array.from({ length: MONTH_COUNT }, (_, i) => addMonths(start, i))
  }, [])

  const whenLabel = useMemo(() => {
    if (range?.from) {
      const fromStr = formatDate(range.from)
      const toStr = range.to ? formatDate(range.to) : ""
      const flexStr = flexDays > 0 && dateMode === "dates" ? ` ±${flexDays}d` : ""
      return `${fromStr}${toStr ? ` – ${toStr}` : ""}${flexStr}`
    }
    return "Add dates"
  }, [range, flexDays, dateMode])

  const whoLabel = useMemo(() => {
    const parts: string[] = []
    if (totalGuests > 0) {
      parts.push(`${totalGuests} ${totalGuests === 1 ? "guest" : "guests"}`)
    } else {
      parts.push("Add guests")
    }
    if (infants > 0) {
      parts.push(`${infants} ${infants === 1 ? "infant" : "infants"}`)
    }
    if (pets > 0) {
      parts.push(`${pets} ${pets === 1 ? "pet" : "pets"}`)
    }
    return parts.join(", ")
  }, [totalGuests, infants, pets])

  function applyTripLength(option: (typeof TRIP_LENGTHS)[number]) {
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + option.days)
    setRange({ from, to })
    setTripLengthId(option.id)
    setMonthIndex(null)
  }

  function applyMonth(index: number) {
    const month = months[index]
    setRange({ from: startOfMonth(month), to: endOfMonth(month) })
    setMonthIndex(index)
    setTripLengthId(null)
  }

  function scrollMonths(direction: -1 | 1) {
    carouselRef.current?.scrollBy({ left: direction * 200, behavior: "smooth" })
  }

  function clearDates() {
    setRange(undefined)
    setFlexDays(0)
    setTripLengthId(null)
    setMonthIndex(null)
  }

  function clearAll() {
    setCity("")
    setCitySearch("")
    clearDates()
    setAdults(1)
    setChildren(0)
    setInfants(0)
    setPets(0)
  }

  function handleSubmit(event?: FormEvent) {
    if (event) event.preventDefault()
    const params = new URLSearchParams()
    const selectedCity = (city || citySearch || "").trim()
    if (selectedCity) params.set("city", selectedCity)
    if (range?.from) params.set("checkin", toDateParam(range.from))
    if (range?.to) params.set("checkout", toDateParam(range.to))
    if (flexDays > 0) params.set("flex", String(flexDays))
    params.set("guests", String(totalGuests))
    if (infants > 0) params.set("infants", String(infants))
    if (pets > 0) params.set("pets", String(pets))

    setActiveField(null)
    setMobileModalOpen(false)
    router.push(`/s?${params.toString()}`)
  }

  return (
    <>
      {/* ========================================== */}
      {/* DESKTOP SEARCH CONSOLE (md+) - 3 FIELDS    */}
      {/* Boxed card with distinct field chips, not a */}
      {/* single continuous pill — deliberately away  */}
      {/* from the Airbnb Where/When/Who capsule.     */}
      {/* ========================================== */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative hidden md:flex items-stretch rounded-2xl border border-border bg-card shadow-md transition-shadow duration-300",
          activeField ? "shadow-xl" : "hover:shadow-lg",
          className
        )}
      >
        <div className="relative grid flex-1 grid-cols-3">
          {/* Active field highlight */}
          {activeField && (
            <motion.div
              layoutId="search-field-highlight"
              className={cn(
                "pointer-events-none absolute inset-y-2 z-10 rounded-xl bg-muted",
                activeField === "where" && "left-2 w-[calc(33.333%-8px)]",
                activeField === "when" && "left-[33.333%] w-1/3",
                activeField === "who" && "left-[66.666%] right-2 w-auto"
              )}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
            />
          )}

          {/* WHERE FIELD */}
          <Popover
            open={activeField === "where"}
            onOpenChange={(open) => setActiveField(open ? "where" : null)}
          >
            <PopoverTrigger
              type="button"
              className="group relative z-20 flex items-center gap-3 border-r border-border px-5 py-3.5 text-left focus-visible:outline-none cursor-pointer"
            >
              <MapPin className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
              <span className="flex min-w-0 flex-col">
                <span className={FIELD_LABEL_CLASS}>Where</span>
                <span className={FIELD_VALUE_CLASS}>{city || citySearch || "Search location"}</span>
              </span>
            </PopoverTrigger>

            <PopoverContent className="w-[420px] p-6 rounded-3xl border-border bg-popover text-popover-foreground shadow-2xl" align="start" sideOffset={12}>
              <div className="space-y-6">
                <div className="relative">
                  <Input
                    autoFocus
                    placeholder="Search Gurugram areas & sectors"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="rounded-full pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  {citySearch && (
                    <button
                      type="button"
                      onClick={() => setCitySearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
                    >
                      <X className="size-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {!citySearch && (
                  <div>
                    <h3 className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Gurugram Sectors & Hubs
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {REGIONS.map((region) => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() => {
                            setCity(region.query)
                            setActiveField("when")
                          }}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-2xl border border-border p-3 text-center transition-all hover:border-foreground hover:shadow-sm",
                            city === region.query && "border-primary bg-primary/10 text-primary"
                          )}
                        >
                          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
                            <region.icon className="size-5" />
                          </div>
                          <span className="text-xs font-semibold text-foreground">{region.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center justify-between">
                    <span>Destinations</span>
                    {isSearchingGeo && <span className="text-[10px] lowercase text-primary animate-pulse">searching map...</span>}
                  </h3>
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {citySearch && geoSuggestions.length > 0 ? (
                      geoSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCity(sug.city)
                            setActiveField("when")
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted",
                            city === sug.city && "bg-muted font-semibold text-primary"
                          )}
                        >
                          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                            <MapPin className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">{sug.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{sug.displayName}</p>
                          </div>
                        </button>
                      ))
                    ) : filteredCities.length > 0 ? (
                      filteredCities.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setCity(option)
                            setActiveField("when")
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted",
                            city === option && "bg-muted font-semibold text-primary"
                          )}
                        >
                          <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                            <MapPin className="size-4" />
                          </div>
                          <span className="text-foreground">{option}</span>
                        </button>
                      ))
                    ) : (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        {isSearchingGeo ? "Searching map..." : `No destinations match "${citySearch}"`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* WHEN FIELD */}
          <Popover
            open={activeField === "when"}
            onOpenChange={(open) => setActiveField(open ? "when" : null)}
          >
            <PopoverTrigger
              type="button"
              className="group relative z-20 flex items-center gap-3 border-r border-border px-5 py-3.5 text-left focus-visible:outline-none cursor-pointer"
            >
              <CalendarDays className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
              <span className="flex min-w-0 flex-col">
                <span className={FIELD_LABEL_CLASS}>When</span>
                <span className={FIELD_VALUE_CLASS}>{whenLabel}</span>
              </span>
            </PopoverTrigger>

            {/* WHEN POPOVER CONTENT */}
            <PopoverContent
              className="w-auto p-6 md:p-8 rounded-[32px] border-border bg-popover text-popover-foreground shadow-2xl"
              align="center"
              sideOffset={12}
            >
              <Tabs value={dateMode} onValueChange={(val) => setDateMode(val as "dates" | "flexible")}>
                <div className="mb-6 h-12 flex justify-center">
                  <TabsList className="gap-1 rounded-full bg-muted p-1 h-12 border border-border/40">
                    <TabsTrigger
                      value="dates"
                      className="rounded-full px-6 py-2 text-sm h-8 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      Dates
                    </TabsTrigger>
                    <TabsTrigger
                      value="flexible"
                      className="rounded-full px-6 py-2 text-sm h-8 font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                      Flexible
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="dates" className="mt-0">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={range}
                    onSelect={(value) => {
                      setRange(value)
                      setTripLengthId(null)
                      setMonthIndex(null)
                    }}
                    disabled={{ before: new Date() }}
                    className="[--cell-size:--spacing(11)]"
                    formatters={{
                      formatWeekdayName: (date) => format(date, "EEEEE"),
                    }}
                    classNames={{
                      weekday: "flex-1 text-sm font-medium text-muted-foreground select-none",
                      week: "mt-2.5 flex w-full",
                      caption_label: "text-base font-semibold text-foreground select-none",
                    }}
                  />
                  <div role="radiogroup" aria-label="Date flexibility" className="flex flex-wrap gap-2.5 pt-6 border-t border-border mt-4">
                    {FLEX_DAY_OPTIONS.map((days) => (
                      <button
                        key={days}
                        type="button"
                        role="radio"
                        aria-checked={flexDays === days}
                        onClick={() => setFlexDays(days)}
                        className={cn(
                          "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                          flexDays === days
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        )}
                      >
                        {days === 0 ? "Exact dates" : `± ${days} day${days > 1 ? "s" : ""}`}
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="flexible" className="mt-0">
                  <div className="min-w-[580px] p-2 flex flex-col items-center">
                    <p className="mb-4 text-base font-semibold text-foreground">
                      How long would you like to stay?
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center mb-8">
                      {TRIP_LENGTHS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={tripLengthId === option.id}
                          onClick={() => applyTripLength(option)}
                          className={cn(
                            "shrink-0 rounded-full border px-6 py-2 text-sm font-semibold transition-all",
                            tripLengthId === option.id
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <p className="mb-4 text-base font-semibold text-foreground">
                      When do you want to go?
                    </p>
                    <div className="relative w-full max-w-[580px]">
                      <div ref={carouselRef} className="no-scrollbar flex snap-x gap-3 overflow-x-auto scroll-smooth py-2 px-1">
                        {months.map((month, index) => (
                          <button
                            key={month.toISOString()}
                            type="button"
                            aria-pressed={monthIndex === index}
                            onClick={() => applyMonth(index)}
                            className={cn(
                              "flex shrink-0 snap-start flex-col items-center justify-center gap-1.5 rounded-2xl border border-border bg-card w-[120px] h-[120px] text-muted-foreground hover:border-foreground hover:text-foreground transition-all",
                              monthIndex === index && "border-2 border-foreground bg-muted font-semibold text-foreground"
                            )}
                          >
                            <CalendarDays className="size-7 text-muted-foreground mb-0.5" aria-hidden="true" />
                            <span className="text-sm font-semibold">{format(month, "MMMM")}</span>
                            <span className="text-xs">{format(month, "yyyy")}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        aria-label="Later months"
                        onClick={() => scrollMonths(1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full border border-border bg-background shadow-md text-foreground hover:scale-105 transition-all"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>

          {/* WHO FIELD */}
          <Popover
            open={activeField === "who"}
            onOpenChange={(open) => setActiveField(open ? "who" : null)}
          >
            <PopoverTrigger
              type="button"
              className="group relative z-20 flex items-center gap-3 px-5 py-3.5 text-left focus-visible:outline-none cursor-pointer"
            >
              <Users className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
              <span className="flex min-w-0 flex-col">
                <span className={FIELD_LABEL_CLASS}>Who</span>
                <span className={FIELD_VALUE_CLASS}>{whoLabel}</span>
              </span>
            </PopoverTrigger>

            <PopoverContent
              className="w-80 p-6 rounded-3xl border-border bg-popover text-popover-foreground shadow-2xl space-y-5"
              align="end"
              sideOffset={12}
            >
              {/* Adults Counter */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-foreground">Adults</p>
                  <p className="text-xs text-muted-foreground">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease adults"
                    disabled={adults <= 1}
                    onClick={() => setAdults((v) => Math.max(1, v - 1))}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-semibold text-foreground">{adults}</span>
                  <button
                    type="button"
                    aria-label="Increase adults"
                    onClick={() => setAdults((v) => v + 1)}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Children Counter */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-foreground">Children</p>
                  <p className="text-xs text-muted-foreground">Ages 2–12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease children"
                    disabled={children <= 0}
                    onClick={() => setChildren((v) => Math.max(0, v - 1))}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-semibold text-foreground">{children}</span>
                  <button
                    type="button"
                    aria-label="Increase children"
                    onClick={() => setChildren((v) => v + 1)}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Infants Counter */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-foreground">Infants</p>
                  <p className="text-xs text-muted-foreground">Under 2</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease infants"
                    disabled={infants <= 0}
                    onClick={() => setInfants((v) => Math.max(0, v - 1))}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-semibold text-foreground">{infants}</span>
                  <button
                    type="button"
                    aria-label="Increase infants"
                    onClick={() => setInfants((v) => v + 1)}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Pets Counter */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-foreground">Pets</p>
                  <p className="text-xs text-muted-foreground">Service animals welcome</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease pets"
                    disabled={pets <= 0}
                    onClick={() => setPets((v) => Math.max(0, v - 1))}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-semibold text-foreground">{pets}</span>
                  <button
                    type="button"
                    aria-label="Increase pets"
                    onClick={() => setPets((v) => v + 1)}
                    className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* SEARCH BUTTON */}
        <div className="flex items-center border-l border-border p-2">
          <Button
            type="submit"
            aria-label="Search stays"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Search className="size-4 shrink-0" />
            <span className="text-sm font-bold">Search</span>
          </Button>
        </div>
      </form>

      {/* ========================================== */}
      {/* MOBILE SEARCH COMPACT CARD (< md)          */}
      {/* ========================================== */}
      <div className="md:hidden w-full">
        <button
          type="button"
          onClick={() => setMobileModalOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Search className="size-4" />
            </span>
            <span className="min-w-0 text-left">
              <p className="truncate text-sm font-bold text-foreground">
                {city || "Where to?"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {whenLabel} · {whoLabel}
              </p>
            </span>
          </div>
        </button>
      </div>

      {/* ========================================== */}
      {/* MOBILE SEARCH DRAWER MODAL OVERLAY         */}
      {/* ========================================== */}
      <AnimatePresence>
        {mobileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setMobileModalOpen(false)}
                className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground"
              >
                <X className="size-5" />
              </button>
              <span className="text-sm font-bold text-foreground">Stays</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
            </div>

            {/* Steps Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Step 1: Where */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setMobileStep("where")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-xs font-bold text-muted-foreground uppercase">Where</span>
                  <span className="text-sm font-semibold text-foreground">{city || "Search destinations"}</span>
                </button>

                {mobileStep === "where" && (
                  <div className="mt-4 space-y-4 pt-3 border-t border-border">
                    <Input
                      placeholder="Search destinations"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="rounded-full bg-muted border-border"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {REGIONS.map((region) => (
                        <button
                          key={region.id}
                          type="button"
                          onClick={() => {
                            setCity(region.query)
                            setMobileStep("when")
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border border-border p-2.5 text-xs font-semibold transition-all",
                            city === region.query && "border-primary bg-primary/10 text-primary"
                          )}
                        >
                          <region.icon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{region.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: When */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setMobileStep("when")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-xs font-bold text-muted-foreground uppercase">When</span>
                  <span className="text-sm font-semibold text-foreground">{whenLabel}</span>
                </button>

                {mobileStep === "when" && (
                  <div className="mt-4 space-y-4 pt-3 border-t border-border">
                    <Calendar
                      mode="range"
                      numberOfMonths={1}
                      selected={range}
                      onSelect={(val) => setRange(val)}
                      disabled={{ before: new Date() }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full"
                      onClick={() => setMobileStep("who")}
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>

              {/* Step 3: Who */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setMobileStep("who")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-xs font-bold text-muted-foreground uppercase">Who</span>
                  <span className="text-sm font-semibold text-foreground">{whoLabel}</span>
                </button>

                {mobileStep === "who" && (
                  <div className="mt-4 space-y-4 pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Adults</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={adults <= 1}
                          onClick={() => setAdults((v) => Math.max(1, v - 1))}
                          className="flex size-8 items-center justify-center rounded-full border border-border"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span>{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults((v) => v + 1)}
                          className="flex size-8 items-center justify-center rounded-full border border-border"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="border-t border-border p-4 flex items-center justify-between bg-card">
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
              <Button
                type="button"
                onClick={() => handleSubmit()}
                className="rounded-full px-8 bg-primary text-primary-foreground font-bold shadow-md"
              >
                <Search className="size-4 mr-2" />
                Search
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
