"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { LogoMark } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  return (
    <section className={cn("w-full max-w-8xl mx-auto md:px-8", className)}>
      <div className="m-2 rounded-[20px] overflow-hidden relative flex flex-col font-sans bg-secondary border border-border">
        {/* Row 1 — Hero */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 md:px-20 pt-20 pb-16 text-center">
          <motion.h1
            className="font-perfectly-nineties-regular text-display text-ink-black leading-display max-w-3xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            Discover unique stays. No hidden fees.
          </motion.h1>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          >
            <Button
              className="h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              render={<Link href="/s" />}
              nativeButton={false}
            >
              <span>Explore stays</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
          </motion.div>
        </div>

        {/* Row 2 — Footer card */}
        <motion.div
          className="relative z-10 border-t border-border bg-background p-8 md:p-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Footer Row A */}
          <div className="flex flex-col md:flex-row justify-between gap-10">
            {/* Column 1 — Brand & Newsletter CTA */}
            <div className="md:w-[32%] flex flex-col justify-between">
              <div>
                <Link href="/" className="flex items-center gap-2.5 mb-3 group">
                  <LogoMark className="text-primary w-7 h-auto transition-transform group-hover:scale-105" />
                  <span className="text-xl font-semibold tracking-tight text-ink-black">
                    Kiphaus
                  </span>
                </Link>
                <p className="mt-3 text-smoke text-caption leading-relaxed max-w-[300px]">
                  India&rsquo;s verified marketplace for homestays, villas, and
                  unique stays. Every listing checked, every price final upfront.
                </p>
              </div>

              {/* Newsletter Ad / CTA */}
              <div className="mt-6 pt-5 border-t border-border">
                <h5 className="text-ink-black text-body-sm font-semibold mb-1 tracking-body-sm">
                  Join our newsletter
                </h5>
                <p className="text-smoke text-caption mb-3 leading-snug">
                  Get exclusive stay recommendations & secret deals directly to your inbox.
                </p>
                {subscribed ? (
                  <div className="py-2.5 px-4 bg-accent rounded-xl text-body-sm text-accent-foreground font-medium border border-border text-center">
                    Thanks for subscribing!
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-background text-ink-black placeholder:text-smoke text-body-sm rounded-md px-3.5 py-2.5 outline-none border border-input focus:border-primary focus:ring-2 focus:ring-accent transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-caption tracking-wider px-4 py-2.5 rounded-md transition-colors shrink-0 cursor-pointer uppercase"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Column 2 — Explore */}
            <div>
              <h4 className="text-ink-black text-body-sm font-semibold mb-4 tracking-body-sm">
                Explore stays
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/s"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Explore stays
                  </Link>
                </li>
                <li>
                  <Link
                    href="/s?type=villa"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Luxury villas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/s?type=homestay"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Verified homestays
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wishlists"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Wishlists
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    List your home
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 — Resources */}
            <div>
              <h4 className="text-ink-black text-body-sm font-semibold mb-4 tracking-body-sm">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/blog"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Travel blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Help center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/host/dashboard"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Host portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 — Company & Legal */}
            <div>
              <h4 className="text-ink-black text-body-sm font-semibold mb-4 tracking-body-sm">
                Company & legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    About us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#careers"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policy"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-smoke text-body-sm hover:text-ink-black transition-colors"
                  >
                    Terms of service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Row B */}
          <div className="mt-6 pt-5 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-smoke text-caption">
                © {new Date().getFullYear()} Kiphaus Inc. All rights reserved.
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="text-smoke text-caption">
                Our story continues:
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-graphite hover:bg-ash-mist transition-colors"
                aria-label="TikTok"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.77 0 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 000 12.68 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-graphite hover:bg-ash-mist transition-colors"
                aria-label="Facebook"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>

              {/* X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-graphite hover:bg-ash-mist transition-colors"
                aria-label="X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-graphite hover:bg-ash-mist transition-colors"
                aria-label="YouTube"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 7s-.3-1.9-1.2-2.7c-1.1-1.2-2.4-1.2-3-1.3C16.2 3 12 3 12 3s-4.2 0-6.8.2c-.6.1-1.9.1-3 1.3C1.3 5.1 1 7 1 7S.7 9.1.7 11.2v2c0 2.1.3 4.2.3 4.2s.3 1.9 1.2 2.7c1.1 1.2 2.6 1.1 3.3 1.2C7.5 21.5 12 21.5 12 21.5s4.2 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.7 1.2-2.7s.3-2.1.3-4.2v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l8 3.6-8 3.5z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-graphite hover:bg-ash-mist transition-colors"
                aria-label="Instagram"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect x={2} y={2} width={20} height={20} rx={5} />
                  <circle cx={12} cy={12} r={5} />
                  <circle
                    cx={17.5}
                    cy={6.5}
                    r={1}
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export { Footer as SiteFooter }
