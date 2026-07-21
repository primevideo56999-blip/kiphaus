"use client"

import * as React from "react"
import Script from "next/script"
import { useAuth } from "@/hooks"
import { AuthError, type AuthUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (resp: { credential: string }) => void
          }) => void
          prompt: () => void
        }
      }
    }
    AppleID?: {
      auth: {
        init: (config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void
        signIn: () => Promise<{ authorization: { id_token: string } }>
      }
    }
  }
}

interface SocialAuthButtonsProps {
  onSuccess: (user: AuthUser) => void
  onError: (message: string) => void
}

const socialButtonClass =
  "rounded-full h-10 hover:bg-ash-mist hover:border-graphite/30 transition-colors font-medium text-ink-black text-body-sm shadow-none"

export function SocialAuthButtons({ onSuccess, onError }: SocialAuthButtonsProps) {
  const { loginWithGoogle, loginWithApple } = useAuth()

  const handleGoogleCredential = React.useCallback(
    async (credential: string) => {
      try {
        onSuccess(await loginWithGoogle(credential))
      } catch (err) {
        onError(err instanceof AuthError ? err.message : "Google sign-in failed. Please try again.")
      }
    },
    [loginWithGoogle, onSuccess, onError]
  )

  const handleAppleClick = React.useCallback(async () => {
    if (!window.AppleID) return
    try {
      const result = await window.AppleID.auth.signIn()
      onSuccess(await loginWithApple(result.authorization.id_token))
    } catch (err) {
      onError(err instanceof AuthError ? err.message : "Apple sign-in failed. Please try again.")
    }
  }, [loginWithApple, onSuccess, onError])

  const initGoogle = React.useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || !window.google) return
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => handleGoogleCredential(resp.credential),
    })
  }, [handleGoogleCredential])

  React.useEffect(() => {
    // next/script dedupes by src app-wide, so onLoad only fires once per
    // session. On a page navigated to after the GSI script already loaded
    // elsewhere, initialize directly instead of waiting for an onLoad that
    // will never fire again.
    if (window.google) initGoogle()
  }, [initGoogle])

  const handleGoogleClick = React.useCallback(() => {
    if (!window.google) return
    // Same id_token flow as Google's own rendered button (google.accounts.id,
    // verified server-side by verify_oauth2_token) — prompt() lets it be
    // triggered from a normal styled button instead of Google's cross-origin
    // iframe button, which can't be clicked programmatically to match
    // Apple's button here.
    window.google.accounts.id.prompt()
  }, [])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
        onLoad={() => {
          const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
          if (!clientId || !window.AppleID) return
          window.AppleID.auth.init({
            clientId,
            scope: "name email",
            redirectURI: window.location.origin,
            usePopup: true,
          })
        }}
      />

      <div className="my-5 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <div className="px-4 text-body-sm text-smoke tracking-body-sm">Or continue with</div>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleAppleClick}
          className={socialButtonClass}
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.59-.8 1.51.05 2.53.72 3.26 1.84-2.88 1.62-2.39 5.61.34 6.74-.63 1.6-1.57 3.32-2.27 4.39zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.41-3.74 4.25z" />
          </svg>
          Apple
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleClick}
          className={socialButtonClass}
        >
          <svg className="size-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          Google
        </Button>
      </div>
    </>
  )
}
