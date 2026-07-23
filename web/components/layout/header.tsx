"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { Bell, Laptop, Moon, Search, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import { LogoMark } from "@/components/shared/logo"
import { useAuth } from "@/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Laptop },
  { value: "dark", label: "Dark", icon: Moon },
] as const

const NAV_LINKS = [
  { href: "/s", label: "Explore stays" },
  { href: "/host", label: "Kiphaus your home" },
] as const

export function Header({ variant = "solid" }: { variant?: "solid" | "floating" }) {
  const [mounted, setMounted] = useState(false)
  const [heroSearchVisible, setHeroSearchVisible] = useState(true)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const floating = variant === "floating"

  // Airbnb-style: once the hero's own search bar scrolls out of view, the
  // floating nav shows a compact search pill in its place.
  useEffect(() => {
    if (!floating) return
    const el = document.getElementById("hero-search")
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setHeroSearchVisible(entry.isIntersecting), {
      rootMargin: "-96px 0px 0px 0px",
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [floating])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const showCompactSearch = floating && !heroSearchVisible

  return (
    <header
      className={
        floating
          ? "fixed inset-x-0 top-0 z-30 flex w-full justify-center pt-4 md:pt-6"
          : "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-200"
      }
    >
      <div
        className={
          floating
            ? "mx-4 flex h-16 w-full max-w-3xl items-center gap-4 rounded-full bg-white/70 px-4 shadow-sm backdrop-blur-md md:px-6 dark:bg-black/40"
            : "mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8"
        }
      >
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <LogoMark className="text-primary w-8 h-auto" />
          <span className="text-[20px] font-semibold tracking-[-0.36px] text-primary">Kiphaus</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center md:flex">
          <AnimatePresence mode="wait" initial={false}>
                {showCompactSearch ? (
              <motion.div
                key="compact-search"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Link
                  href="/s"
                  className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-body-sm font-semibold text-graphite shadow-sm transition-shadow hover:shadow-md dark:bg-black/60"
                >
                  <Search className="size-3.5" />
                  Search stays
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="nav-links"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
              >
                <Link
                  href="/s"
                  className="rounded-full px-4 py-2 text-body-sm font-semibold text-graphite tracking-body-sm transition-colors hover:bg-ash-mist hover:text-ink-black"
                >
                  Explore stays
                </Link>
                <Link
                  href={user?.role === "host" ? "/host/dashboard" : user ? "/host/onboarding" : "/host"}
                  className="rounded-full px-4 py-2 text-body-sm font-semibold text-graphite tracking-body-sm transition-colors hover:bg-ash-mist hover:text-ink-black"
                >
                  {user?.role === "host" ? "Switch to host view" : user ? "Become a host" : "Kiphaus your home"}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/s"
            aria-label="Search stays"
            className="flex size-9 items-center justify-center rounded-full text-graphite transition-colors hover:bg-ash-mist md:hidden"
          >
            <Search className="size-4" />
          </Link>

          {user && (
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="flex size-9 items-center justify-center rounded-full text-graphite transition-colors hover:bg-ash-mist"
            >
              <Bell className="size-4.5" />
            </Link>
          )}

          {!user && (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-body-sm font-semibold text-ink-black transition-colors hover:bg-ash-mist sm:inline-flex sm:items-center"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-full bg-primary px-4 py-2 text-body-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex sm:items-center"
              >
                Sign up
              </Link>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={user ? "Account menu" : "Menu"}
              className="flex size-9 items-center justify-center rounded-full text-graphite outline-none transition-colors hover:bg-ash-mist"
            >
              {user ? (
                <Avatar size="sm">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.full_name} />}
                  <AvatarFallback>{user.full_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
              ) : (
                <User className="size-4.5" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-4">
              {user ? (
                <>
                  <DropdownMenuItem render={<Link href="/wishlists" />}>Wishlists</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/trips" />}>Trips</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/messages" />}>Messages</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/account" />}>Account</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/contact" />}>Help Centre</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.role === "host" ? (
                    <DropdownMenuItem render={<Link href="/host/dashboard" />}>Switch to host view</DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem render={<Link href="/host/onboarding" />}>Become a host</DropdownMenuItem>
                  )}
                </>
              ) : (
                <>
                  <DropdownMenuItem render={<Link href="/login" />} className="sm:hidden">Log in</DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/signup" />} className="sm:hidden">Sign up</DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
                  <DropdownMenuItem render={<Link href="/contact" />}>Help Centre</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/host" />}>Kiphaus your home</DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <div className="px-2 pb-2">
                  {mounted && (
                    <ToggleGroup
                      value={theme ? [theme] : ["system"]}
                      onValueChange={(values) => {
                        if (values[0]) setTheme(values[0])
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                        <ToggleGroupItem key={value} value={value} aria-label={label} className="flex-1">
                          <Icon className="size-4" />
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  )}
                </div>
              </DropdownMenuGroup>

              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export { Header as SiteHeader }
