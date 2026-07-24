"use client"

import { useState, type SubmitEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list"
import { SocialAuthButtons } from "@/components/features/auth/social-auth-buttons"
import { useAuth } from "@/hooks"
import { AuthError, resendVerificationEmail } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  async function onSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setVerificationUrl(null)
    setResendStatus(null)
    setIsSubmitting(true)
    try {
      const user = await login(email, password)
      router.push(user.role === "host" ? "/host/dashboard" : "/")
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
        const rawUrl = (err.body as Record<string, unknown> | null)?.verification_url
        const url =
          typeof rawUrl === "string"
            ? rawUrl
            : Array.isArray(rawUrl) && typeof rawUrl[0] === "string"
            ? rawUrl[0]
            : null
        if (url) {
          setVerificationUrl(url)
        }
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    if (!email) return
    setIsResending(true)
    setResendStatus(null)
    try {
      await resendVerificationEmail(email)
      setResendStatus("A new verification link has been sent to your email.")
    } catch {
      setResendStatus("Couldn't send link. Please check your email address.")
    } finally {
      setIsResending(false)
    }
  }

  const isUnverifiedError = Boolean(verificationUrl) || (error && error.toLowerCase().includes("not verified"))

  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Welcome to Kiphaus</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          Enter your details to log in to your account
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <StaggerList className="space-y-5" inView={false}>
          {error && (
            <StaggerItem>
              {isUnverifiedError ? (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="size-4.5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p role="alert" className="text-body-sm font-semibold text-ink-black">
                        Email Verification Required
                      </p>
                      <p className="text-body-sm text-smoke">
                        {error} We sent a confirmation link to your inbox.
                      </p>
                    </div>
                  </div>

                  {resendStatus && (
                    <p className="text-body-sm font-medium text-primary text-center pt-1">{resendStatus}</p>
                  )}

                  <div className="pt-2 flex flex-col gap-2 border-t border-border">
                    {verificationUrl && (
                      <>
                        <a
                          href={verificationUrl}
                          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-body-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                        >
                          Verify Email Now
                        </a>
                        <div className="pt-2 text-body-sm border-t border-border/50">
                          <p className="text-smoke font-medium">For testing purpose:</p>
                          <a href={verificationUrl} className="text-primary font-semibold hover:underline break-all">
                            {verificationUrl}
                          </a>
                        </div>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="w-full inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-body-sm font-semibold text-graphite hover:bg-ash-mist transition-colors disabled:opacity-50"
                    >
                      {isResending ? "Sending fresh link..." : "Resend Verification Link"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-center">
                  <p role="alert" className="text-body-sm font-medium text-destructive">{error}</p>
                </div>
              )}
            </StaggerItem>
          )}
          <StaggerItem>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-sm font-medium text-graphite tracking-body-sm">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-body-sm font-medium text-graphite tracking-body-sm">Password</Label>
                <Link href="/forget-password" className="text-body-sm font-semibold text-primary hover:underline tracking-body-sm">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="pt-4 space-y-4">
              <Button type="submit" disabled={isSubmitting} className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
              <p className="text-body-sm text-smoke text-center tracking-body-sm">
                By continuing, you agree to Kiphaus&apos;s{" "}
                <Link href="/terms" className="font-semibold text-ink-black hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/policy" className="font-semibold text-ink-black hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </StaggerItem>
        </StaggerList>
      </form>

      <SocialAuthButtons
        onSuccess={(user) => router.push(user.role === "host" ? "/host/dashboard" : "/")}
        onError={setError}
      />

      <div className="mt-6 text-center text-body-sm font-medium text-smoke tracking-body-sm">
        New here?{" "}
        <Link href="/signup" className="text-ink-black hover:underline font-semibold">
          Sign up
        </Link>
      </div>
    </div>
  )
}
