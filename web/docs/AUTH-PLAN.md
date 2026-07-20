# Auth — Django (SimpleJWT) backend + Next.js frontend

Status: **implemented** (2026-07-19). Supersedes the original dj-rest-auth/session-cookie draft
below this line's history — that plan was written before the Django backend existed; the backend
that actually got built uses `djangorestframework-simplejwt`, not `dj-rest-auth`/`django-allauth`
(neither package is installed). Rather than discard the working JWT implementation to match a
plan that was never followed, the plan was updated to match reality, hardened for long-term use.

Approach: **JWT bearer access token (short-lived, kept in memory on the client) + JWT refresh
token in an httpOnly cookie.** This is deliberately not:
- **Raw JWT-in-localStorage** — the refresh token is long-lived (7 days); if it were readable by
  JS, any XSS on the site hands an attacker a week of full account access. httpOnly closes that.
- **Pure Django session cookies** (the original plan) — works fine for a browser-only client, but
  this product is a marketplace that may eventually need a mobile app talking to the same API;
  bearer tokens carry over to that case for free, cookies don't.

## 1. Backend (`api/users/`)

`AUTH_USER_MODEL = "users.User"` — custom user, email-keyed (`USERNAME_FIELD = "email"`), `role`
field (`guest`/`host`/`admin`). Already migrated — do not swap the user model post-migration.

### Endpoints (`api/v1/auth/`, wired in `users/urls/auth.py`)

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `register/` | POST | none | `{email, username, first_name?, last_name?, password, password2, role?}` → `{user, access}` + sets refresh cookie |
| `login/` | POST | none | `{email, password}` → `{user, access}` + sets refresh cookie. Throttled (`auth` scope, 10/min) |
| `logout/` | POST | Bearer | Blacklists the refresh token (cookie or body), clears the cookie |
| `token/refresh/` | POST | refresh cookie | No body needed from the browser — reads `kh_refresh` cookie. Rotates + re-sets the cookie (`ROTATE_REFRESH_TOKENS=True`) |
| `me/` | GET/PATCH | Bearer | Current user profile |
| `change-password/` | PUT | Bearer | `{old_password, new_password}` |
| `password/reset/` | POST | none | `{email}` → always 200, generic message (no user enumeration). Emails a reset link via `default_token_generator` |
| `password/reset/confirm/` | POST | none | `{uid, token, new_password1, new_password2}` |

### The refresh cookie (`kh_refresh`)

Set by `LoginView`/`RegisterView`/`CookieTokenRefreshView` in `api/users/views.py`:
`httponly=True`, `samesite="Lax"`, `secure=not DEBUG`, `path="/"`, `domain=AUTH_COOKIE_DOMAIN`
(blank in dev — host-only cookie still reaches `localhost:3000`'s middleware because browsers
ignore port when matching cookie domains; set to `.kiphaus.com` in prod so both
`app.kiphaus.com` and `api.kiphaus.com` see it).

`SameSite=Lax` (not `Strict`) is the CSRF mitigation here: DRF's `APIView` is inherently
CSRF-exempt from Django's `CsrfViewMiddleware` (no `SessionAuthentication` in
`DEFAULT_AUTHENTICATION_CLASSES`), so `Lax` is what stops a cross-site page from silently
POSTing to `token/refresh/` with the ambient cookie — cross-site fetch/XHR POSTs don't carry
`Lax` cookies, only top-level navigations do.

### Settings (`api/core/settings/base.py` / `production.py`)

- `CORS_ALLOW_CREDENTIALS = True` — required for `credentials:"include"` to work cross-origin.
- `CORS_ALLOWED_ORIGINS` — explicit origin list in both dev and prod. Production no longer uses
  `CORS_ALLOW_ALL_ORIGINS` (that combined with credentials would defeat CORS entirely).
- `AUTH_COOKIE_DOMAIN` — env-driven, blank in dev, `.kiphaus.com` in prod.
- `FRONTEND_URL` — used to build the password-reset link in the email.
- `REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["auth"] = "10/min"` — applied only to
  `AuthRateThrottle` (`users/throttles.py`) on login/register/password-reset views, not globally
  (a global anon throttle would rate-limit anonymous property browsing too).
- Production `SECRET_KEY` and `ALLOWED_HOSTS` now fail fast if unset instead of falling back to
  an insecure default / `"*"`.

## 1a. Social login (Google + Apple)

Status: Google — implemented, needs a real Client ID to test end-to-end. Apple — implemented,
untestable without a paid Apple Developer account. Design rationale:
`docs/superpowers/specs/2026-07-20-social-login-design.md` (repo root).

No `django-allauth`/`dj-rest-auth` — both providers' client-side SDKs hand the browser a signed
`id_token` (JWT) directly, so the backend just verifies it and mints a token pair through the
same `_set_refresh_cookie`/`RefreshToken.for_user` path `LoginView`/`RegisterView` already use.
Response contract is identical to `login/`.

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `google/` | POST | none | `{id_token}` → `{user, access}` + refresh cookie. Verified via `google-auth`'s `id_token.verify_oauth2_token`, audience = `GOOGLE_CLIENT_ID` |
| `apple/` | POST | none | `{id_token}` → `{user, access}` + refresh cookie. Verified via `PyJWT`'s `PyJWKClient` against Apple's JWKS endpoint, audience = `APPLE_CLIENT_ID` |

`SocialAccount` model (`api/users/models.py`) maps `(provider, provider_user_id)` → `User`.
Needed because Apple only sends the `email` claim on a user's *first* authorization ever — every
later "Continue with Apple" has to be re-recognized by Apple's opaque `sub`, not email. Resolution
logic (`api/users/social.py` `resolve_social_user`): match by `(provider, sub)` first (returning
user), then by email (links to an existing password account), then creates a new `role="guest"`,
`is_verified=True`, unusable-password user with a generated unique `username`.

New settings: `GOOGLE_CLIENT_ID` / `APPLE_CLIENT_ID` (backend, `api/.env.example`),
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_APPLE_CLIENT_ID` (frontend, `web/.env.example`) —
all blank-safe; leaving them blank just means the buttons render without functioning rather than
erroring.

## 2. Frontend (`web/lib/auth.ts`, `web/hooks/use-auth.tsx`, `web/proxy.ts`)

- Access token: module-level variable in `lib/auth.ts`, never persisted (reset on full reload —
  `restoreSession()` calls `token/refresh/` on app mount to get a new one from the cookie).
- All authenticated requests go through `apiFetch`, which attaches `Authorization: Bearer
  <token>`, and on a `401` does exactly one silent refresh-and-retry before giving up.
- `useAuth()` (`hooks/use-auth.tsx`) exposes `login`, `register`, `logout`, `user`, `isLoading`.
- `proxy.ts` (Next 16's replacement for `middleware.ts` — same mechanism, renamed file/export)
  checks for the presence of the `kh_refresh` cookie as a cheap route guard on
  `/account`, `/trips`, `/wishlists`, `/messages`. It is **not** the real enforcement — Django
  rejecting unauthenticated/wrong-role calls is. This is unchanged from the original plan.

## 3. Explicitly out of scope for this pass

- Storing the access token in a cookie too, or unifying it with the refresh cookie — the memory +
  cookie split is deliberate (see rationale above).
- 2FA — add when there's an actual requirement. (Social/OAuth login is now implemented — see 1a.)
- Per-object permissions (`django-guardian`) — role-based (`IsHost`/`IsHostProfileComplete` in
  `users/permissions.py`) is enough for the current 3 fixed roles.

## 4. Test coverage (not skippable — this is a security path)

`api/users/tests.py` (plain Django `TestCase`, no pytest) covers as of 2026-07-20:
password validation, `SocialAccount` uniqueness, `resolve_social_user`'s four branches (new user,
link-by-email, returning-user-by-provider-id, no-email-and-no-match), `verify_google_token`/
`verify_apple_token` (mocked, valid + invalid), and the `google/`/`apple/` view endpoints
end-to-end (mocked verification, real DB, asserts the `kh_refresh` cookie is set).

Still not written — needed before shipping the original (non-social) auth paths:
- Django `APITestCase`: register, login (correct + wrong password, throttle trips after 10),
  logout, `me/` (authenticated + unauthenticated), `token/refresh/` (valid cookie, missing
  cookie, expired/blacklisted token), password reset request + confirm (valid token, reused
  token, expired token, non-existent email still returns the generic 200).
- One `curl -c/-b cookies.txt` script: register → confirm `kh_refresh` cookie is `HttpOnly` +
  `Secure` (prod) → `me/` with the returned access token → `token/refresh/` with just the cookie
  → `logout/` → confirm the refresh token is blacklisted (`token/refresh/` now fails).
