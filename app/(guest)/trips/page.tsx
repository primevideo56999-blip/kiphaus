import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { AccountNav } from "@/components/features/guest/account-nav"
import { TripCard } from "@/components/features/guest/trip-card"
import { Button } from "@/components/ui/button"
import { trips } from "@/lib/mock-data"

export default function GuestTripsPage() {
  const upcoming = trips.filter((trip) => trip.status === "upcoming")
  const past = trips.filter((trip) => trip.status !== "upcoming")

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Trips</h1>

        <div className="mt-8 flex flex-col gap-10 md:flex-row">
          <AccountNav />

          <div className="min-w-0 flex-1">
            {trips.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
                <p className="max-w-sm text-body text-ink-black leading-body tracking-body">
                  No trips yet. Once you book a verified stay, it&rsquo;ll show up here.
                </p>
                <Button className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" render={<a href="/s" />} nativeButton={false}>
                  Search stays
                </Button>
              </div>
            ) : (
              <div className="space-y-10">
                {upcoming.length > 0 && (
                  <section aria-labelledby="upcoming-trips">
                    <h2 id="upcoming-trips" className="mb-4 text-heading-sm font-semibold text-ink-black leading-heading-sm">
                      Upcoming
                    </h2>
                    <div className="space-y-4">
                      {upcoming.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </div>
                  </section>
                )}

                {past.length > 0 && (
                  <section aria-labelledby="past-trips">
                    <h2 id="past-trips" className="mb-4 text-heading-sm font-semibold text-ink-black leading-heading-sm">
                      Past trips
                    </h2>
                    <div className="space-y-4">
                      {past.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
