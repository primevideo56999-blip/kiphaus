import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function VerifyPage() {
  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center space-y-3">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Verify your email</h1>
        <p className="text-smoke text-body leading-body tracking-body max-w-[300px] mx-auto">
          We sent a verification link to your email address. Please click the link to verify your account.
        </p>
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <Button className="w-full rounded-full h-[50px] bg-primary hover:bg-primary/90 text-primary-foreground text-body font-semibold">
          Open Email App
        </Button>
        <div className="text-center text-body-sm font-medium text-smoke tracking-body-sm mt-4">
          Didn't receive the email?{" "}
          <button className="text-ink-black hover:underline font-semibold transition-colors">
            Click to resend
          </button>
        </div>
        <div className="mt-8 text-center text-body-sm font-semibold text-smoke tracking-body-sm">
          <Link href="/login" className="text-ink-black hover:underline transition-colors">
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  )
}
