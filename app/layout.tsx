import { JetBrains_Mono, Inter, Playfair_Display } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// DESIGN.md's "Perfectly Nineties Regular" is a paid display serif; Playfair Display
// is the documented substitute.
const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-perfectly-nineties-regular",
})

export const metadata: Metadata = {
  title: "Verified Vacation Rentals & Direct Bookings | Kiphaus",
  description:
    "Tired of hidden fees on vacation rentals? Kiphaus offers direct bookings for verified stays. Save money and book your perfect trip with confidence today.",
  openGraph: {
    title: "Kiphaus — Verified Stays & Direct Bookings",
    description: "Discover the better way to travel. Connect directly with hosts for verified vacation rentals, zero hidden fees, and a seamless booking experience.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiphaus — Verified Stays & Direct Bookings",
    description: "Skip the middleman. Book verified vacation rentals directly with hosts on Kiphaus. Save on fees and stay with confidence.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        fontDisplay.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
