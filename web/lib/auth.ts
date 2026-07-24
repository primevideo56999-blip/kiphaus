// Thin fetch wrapper around the Django JWT auth API.
// Access token lives in memory only (never localStorage — XSS-exfiltratable).
// Refresh token lives in an httpOnly cookie the browser attaches automatically;
// this module never reads or writes it directly. See docs/AUTH-PLAN.md.

export type Role = "guest" | "host" | "admin"

export interface AuthUser {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  role: Role
  phone: string
  phone_verified: boolean
  avatar: string | null
  bio: string
  is_verified: boolean
  email_verified: boolean
  created_at: string
}

export class AuthError extends Error {
  status: number
  errors: Record<string, any> | null
  body: Record<string, any> | null

  constructor(status: number, message: string, body: Record<string, any> | null = null) {
    super(message)
    this.status = status
    this.errors = body
    this.body = body
  }
}

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

function setAccessToken(token: string | null) {
  accessToken = token
}

// First-party marker cookie for proxy.ts's presence check. The real kh_refresh
// cookie is httpOnly and set by the API, which is a different hostname than the
// frontend in production (separate Render services, no shared parent domain) —
// middleware running on the frontend server never sees it. This cookie holds no
// token, just tracks "was a login/session-restore successful," set from the one
// place (AuthProvider) that already knows.
const SESSION_MARKER = "kh_session"
const SESSION_MARKER_MAX_AGE = 60 * 60 * 24 * 7 // matches SIMPLE_JWT REFRESH_TOKEN_LIFETIME

export function setSessionMarker() {
  document.cookie = `${SESSION_MARKER}=1; path=/; max-age=${SESSION_MARKER_MAX_AGE}; samesite=lax`
}

export function clearSessionMarker() {
  document.cookie = `${SESSION_MARKER}=; path=/; max-age=0; samesite=lax`
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function rawFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...opts,
    credentials: "include", // sends the httpOnly refresh cookie
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...opts.headers,
    },
  })
}

async function throwAuthError(res: Response): Promise<never> {
  const body = await res.json().catch(() => null)
  const message =
    body?.detail ??
    body?.non_field_errors?.[0] ??
    "Something went wrong. Please try again."
  throw new AuthError(res.status, message, body ?? null)
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await rawFetch("/api/v1/auth/token/refresh/", { method: "POST" })
        if (!res.ok) {
          setAccessToken(null)
          return false
        }
        const data = await res.json()
        setAccessToken(data.access)
        return true
      } catch {
        setAccessToken(null)
        return false
      }
    })().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

export async function apiFetch(path: string, opts: RequestInit = {}, allowRefresh = true) {
  const res = await rawFetch(path, opts)

  if (res.status === 401 && allowRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return apiFetch(path, opts, false)
  }

  if (!res.ok) return throwAuthError(res)
  // 205 (LogoutView) carries no body per spec, same as 204 — calling
  // res.json() on either throws "Unexpected end of JSON input" client-side,
  // which then skips the caller's post-logout redirect entirely.
  if (res.status === 204 || res.status === 205) return null
  return res.json()
}

/** Like apiFetch, but for multipart bodies (file uploads) — must NOT set
 * Content-Type: application/json, the browser sets the multipart boundary itself. */
export async function apiFetchForm(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" = "POST",
  allowRefresh = true
): Promise<unknown> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  })

  if (res.status === 401 && allowRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return apiFetchForm(path, formData, method, false)
  }

  if (!res.ok) return throwAuthError(res)
  return res.json()
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiFetch("/api/v1/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false)
  setAccessToken(data.access)
  return data.user as AuthUser
}

export async function register(input: {
  email: string
  password1: string
  password2: string
  username: string
  first_name?: string
  role?: "guest" | "host"
}): Promise<{ user: AuthUser; verification_url?: string }> {
  const data = await apiFetch("/api/v1/auth/register/", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      username: input.username,
      first_name: input.first_name,
      password: input.password1,
      password2: input.password2,
      role: input.role ?? "guest",
    }),
  }, false)
  if (data.access) {
    setAccessToken(data.access)
  }
  return { user: data.user as AuthUser, verification_url: data.verification_url }
}

export async function loginWithGoogle(idToken: string): Promise<AuthUser> {
  const data = await apiFetch("/api/v1/auth/google/", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  }, false)
  setAccessToken(data.access)
  return data.user as AuthUser
}

export async function loginWithApple(idToken: string): Promise<AuthUser> {
  const data = await apiFetch("/api/v1/auth/apple/", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  }, false)
  setAccessToken(data.access)
  return data.user as AuthUser
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/v1/auth/logout/", { method: "POST" })
  } finally {
    setAccessToken(null)
  }
}

/** Silently restores the session after a page reload (access token is memory-only). Never throws. */
export async function restoreSession(): Promise<AuthUser | null> {
  if (typeof document !== "undefined" && !document.cookie.includes(`${SESSION_MARKER}=1`)) {
    setAccessToken(null)
    return null
  }
  const refreshed = await refreshAccessToken()
  if (!refreshed) {
    clearSessionMarker()
    setAccessToken(null)
    return null
  }
  try {
    const user = await getCurrentUser()
    if (!user.email_verified) {
      clearSessionMarker()
      setAccessToken(null)
      return null
    }
    return user
  } catch {
    clearSessionMarker()
    setAccessToken(null)
    return null
  }
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiFetch("/api/v1/auth/me/")
}

/** Updates the signed-in user's editable profile fields (name/phone/bio — email and role are read-only). */
export function updateProfile(input: { first_name?: string; last_name?: string; phone?: string; bio?: string }): Promise<AuthUser> {
  return apiFetch("/api/v1/users/me/", { method: "PATCH", body: JSON.stringify(input) })
}

export function changePassword(input: { old_password: string; new_password: string }): Promise<{ detail: string }> {
  return apiFetch("/api/v1/auth/change-password/", { method: "PATCH", body: JSON.stringify(input) })
}

/** Updates the signed-in user's avatar (multipart — MeView's avatar_upload field). */
export async function updateAvatar(file: File): Promise<AuthUser> {
  const formData = new FormData()
  formData.append("avatar_upload", file)
  return apiFetchForm("/api/v1/users/me/", formData, "PATCH") as Promise<AuthUser>
}

/** Upgrades the signed-in guest to a host (role=host + HostProfile), idempotent. */
export function becomeHost(input: { phone?: string; bio?: string } = {}): Promise<AuthUser> {
  return apiFetch("/api/v1/users/me/become-host/", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function requestPasswordReset(email: string): Promise<{ detail: string }> {
  return apiFetch("/api/v1/auth/password/reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
  }, false)
}

export function confirmPasswordReset(input: {
  uid: string
  token: string
  new_password1: string
  new_password2: string
}): Promise<{ detail: string }> {
  return apiFetch("/api/v1/auth/password/reset/confirm/", {
    method: "POST",
    body: JSON.stringify(input),
  }, false)
}

/** Resends email verification link to current user session or specified email address. */
export function resendVerificationEmail(email?: string): Promise<{ detail: string; verification_url?: string }> {
  return apiFetch("/api/v1/auth/verify-email/resend/", {
    method: "POST",
    body: JSON.stringify(email ? { email } : {}),
  }, false)
}

/** No session required — reachable from a cold email-link click. */
export function confirmVerificationEmail(input: { uid: string; token: string }): Promise<{ detail: string }> {
  return apiFetch("/api/v1/auth/verify-email/confirm/", {
    method: "POST",
    body: JSON.stringify(input),
  }, false)
}
