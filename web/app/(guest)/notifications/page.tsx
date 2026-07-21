"use client"

import { BellOff } from "lucide-react"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { FadeIn } from "@/components/motion/fade-in"

export default function NotificationsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Notifications</h1>

        <FadeIn inView={false} className="mt-16 flex flex-col items-center gap-4 py-20 text-center">
          <BellOff className="size-8 text-smoke" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-body font-semibold text-ink-black">No notifications yet</p>
            <p className="text-body-sm text-smoke tracking-body-sm">
              You&rsquo;ve got a blank slate for now. We&rsquo;ll let you know when there&rsquo;s an update.
            </p>
          </div>
        </FadeIn>
      </main>
      <SiteFooter />
    </>
  )
}
