import Link from "next/link"
import { Eye, MessageSquare, CalendarCheck, IndianRupee } from "lucide-react"
import { HostShell } from "@/components/features/host/host-shell"
import { StatCard } from "@/components/features/host/stat-card"
import { InquiryRow } from "@/components/features/host/inquiry-row"
import { PropertyRow } from "@/components/features/host/property-row"
import { VerificationTracker } from "@/components/features/host/verification-tracker"
import { currentHost, hostInquiries, hostListings, hostSubscription, hostVerificationSteps } from "@/lib/mock-data"

export default function HostDashboardPage() {
  const totalViews = hostListings.reduce((sum, listing) => sum + listing.views, 0)
  const totalInquiries = hostListings.reduce((sum, listing) => sum + listing.inquiries, 0)
  const totalBookings = hostListings.reduce((sum, listing) => sum + listing.bookings, 0)
  const estimatedEarnings = hostListings.reduce(
    (sum, listing) => sum + listing.bookings * listing.property.pricePerNight * 3,
    0
  )

  return (
    <HostShell>
      <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">
        Welcome back, {currentHost.name.split(" ")[0]}
      </h1>
      <p className="mt-2 text-body-sm text-smoke tracking-body-sm">
        Here&rsquo;s how your {hostListings.length} {hostListings.length === 1 ? "listing" : "listings"} are doing.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Eye} label="Listing views" value={totalViews.toLocaleString("en-IN")} />
        <StatCard icon={MessageSquare} label="Inquiries" value={String(totalInquiries)} />
        <StatCard icon={CalendarCheck} label="Bookings" value={String(totalBookings)} />
        <StatCard icon={IndianRupee} label="Est. earnings" value={`₹${estimatedEarnings.toLocaleString("en-IN")}`} hint="Kiphaus doesn't process stay payments" />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="recent-inquiries">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="recent-inquiries" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                Recent inquiries
              </h2>
            </div>
            <div className="space-y-3">
              {hostInquiries.map((inquiry) => (
                <InquiryRow key={inquiry.id} inquiry={inquiry} />
              ))}
            </div>
          </section>

          <section aria-labelledby="your-properties">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="your-properties" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                Your properties
              </h2>
              <Link href="/host/properties" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
                See all
              </Link>
            </div>
            <div className="space-y-3">
              {hostListings.slice(0, 2).map((listing) => (
                <PropertyRow key={listing.property.id} listing={listing} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink-black">Verification</h2>
              <Link href="/host/verification" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
                Details
              </Link>
            </div>
            <VerificationTracker steps={hostVerificationSteps} compact />
          </div>

          <div className="rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink-black">Subscription</h2>
              <Link href="/host/subscription" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
                Manage
              </Link>
            </div>
            <p className="mt-2 text-body-sm text-smoke tracking-body-sm">
              {hostSubscription.plan === "premium" ? "Premium" : "Basic"} plan · renews{" "}
              {new Date(hostSubscription.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </aside>
      </div>
    </HostShell>
  )
}
