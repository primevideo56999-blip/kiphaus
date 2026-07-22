import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cheap presence check only — real enforcement is Django rejecting
// unauthenticated/wrong-role API calls regardless of what this proxy does.
// Checks "kh_session", a first-party marker cookie (see setSessionMarker in
// web/lib/auth.ts) — NOT the API's httpOnly "kh_refresh" cookie, which is
// scoped to the API's own hostname and, in production (separate Render
// services, no shared parent domain), never reaches this frontend server at
// all.
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("kh_session")
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: [
    // /host itself is the public "become a host" landing page — must stay
    // crawlable and reachable logged-out.
    "/account/:path*",
    "/trips/:path*",
    "/wishlists/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/rooms/:id/book",
    "/host/dashboard/:path*",
    "/host/properties/:path*",
    "/host/messages/:path*",
    "/host/subscription/:path*",
    "/host/verification/:path*",
    "/host/onboarding",
  ],
}
