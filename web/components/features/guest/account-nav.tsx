"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks"

export function AccountNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    { href: "/trips", label: "Trips" },
    { href: "/wishlists", label: "Wishlists" },
    { href: "/messages", label: "Messages" },
    { href: "/account", label: "Account" },
    user?.role === "host"
      ? { href: "/host/dashboard", label: "Switch to host view" }
      : { href: "/host/onboarding", label: "Become a host" },
  ]

  return (
    <nav
      aria-label="Account navigation"
      className="flex gap-2 overflow-x-auto pb-2 md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:pb-0"
    >
      {navItems.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2.5 text-body-sm font-semibold tracking-body-sm transition-colors md:shrink",
              active
                ? "bg-primary text-primary-foreground"
                : "text-graphite hover:bg-ash-mist"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

