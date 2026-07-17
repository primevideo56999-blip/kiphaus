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
  title: "Verified Vacation Rentals | Book Direct & Save | Kiphaus",
  description:
    "Save money on verified vacation rentals by booking directly. Kiphaus connects you with trusted hosts for seamless, fee-free trips. Reserve today.",
  openGraph: {
    title: "Skip the Fees: Direct Vacation Rentals on Kiphaus",
    description: "Planning a trip shouldn't mean paying hidden fees. Browse thousands of beautiful homes and book directly with the hosts you trust.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kiphaus | No-Fee Direct Vacation Rentals",
    description: "We're fixing travel by cutting out the middleman. Find incredible places to stay and deal directly with the owners. Better trips, zero booking fees.",
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
