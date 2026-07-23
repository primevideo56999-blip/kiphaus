"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Laptop, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { FadeIn } from "@/components/motion/fade-in"
import { LogoMark } from "@/components/shared/logo"
import { HostNav } from "@/components/features/host/host-nav"
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

export function HostShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { user, isLoading, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
    } else if (user.role !== "host") {
      router.replace("/host/onboarding")
    }
  }, [isLoading, user, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (isLoading || !user || user.role !== "host") {
    return null
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/host/dashboard" className="flex items-center gap-2">
              <LogoMark className="text-primary w-7 h-auto" />
              <span className="text-body-sm font-semibold tracking-body-sm text-ink-black">
                Kiphaus <span className="text-smoke font-medium">Host</span>
              </span>
            </Link>
          </div>

          <nav className="hidden flex-1 items-center justify-center md:flex">
            <Link
              href="/s"
              className="rounded-full px-4 py-2 text-body-sm font-semibold text-graphite tracking-body-sm transition-colors hover:bg-ash-mist hover:text-ink-black"
            >
              Switch to guest view
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className="flex size-9 items-center justify-center rounded-full text-graphite outline-none transition-colors hover:bg-ash-mist"
              >
                <Avatar size="sm">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.full_name} />}
                  <AvatarFallback>{user.full_name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-4">
                <DropdownMenuItem render={<Link href="/host/messages" />}>Messages</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account" />}>Account</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/contact" />}>Help Centre</DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/s" />}>Switch to guest view</DropdownMenuItem>

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

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
          <HostNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <FadeIn inView={false}>{children}</FadeIn>
      </main>

      <footer className="border-t border-border py-6">
        <p className="mx-auto max-w-6xl px-4 text-body-sm text-smoke tracking-body-sm sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Kiphaus. Zero commission, every stay.
        </p>
      </footer>
    </div>
  )
}
