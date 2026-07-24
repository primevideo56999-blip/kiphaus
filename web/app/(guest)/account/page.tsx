"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { SiteHeader } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/footer"
import { AccountNav } from "@/components/features/guest/account-nav"
import { FadeIn } from "@/components/motion/fade-in"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks"
import { AuthError } from "@/lib/auth"

const fieldClass =
  "rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
const labelClass = "text-body-sm font-medium text-graphite tracking-body-sm"

export default function GuestAccountPage() {
  const { user, updateProfile, updateAvatar, changePassword, logout } = useAuth()
  const router = useRouter()

  const [name, setName] = useState(user?.full_name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [bio, setBio] = useState(user?.bio ?? "")
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [profileError, setProfileError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    setProfileStatus("saving")
    setProfileError(null)
    const [first_name, ...rest] = name.trim().split(" ")
    try {
      await updateProfile({ first_name, last_name: rest.join(" "), phone, bio })
      setProfileStatus("saved")
    } catch (err) {
      setProfileError(err instanceof AuthError ? err.message : "Couldn't save your changes.")
      setProfileStatus("error")
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    setAvatarError(null)
    try {
      await updateAvatar(file)
    } catch (err) {
      setAvatarError(err instanceof AuthError ? err.message : "Couldn't upload profile photo.")
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPasswordStatus("saving")
    setPasswordError(null)
    try {
      await changePassword({ old_password: currentPassword, new_password: newPassword })
      setCurrentPassword("")
      setNewPassword("")
      setPasswordStatus("saved")
    } catch (err) {
      setPasswordError(err instanceof AuthError ? err.message : "Couldn't update your password.")
      setPasswordStatus("error")
    }
  }

  async function handleLogout() {
    await logout()
    router.push("/login")
  }

  const isHost = user?.role === "host"
  const isProfileIncomplete = isHost && (!user?.bio?.trim() || !user?.avatar)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <h1 className="font-perfectly-nineties-regular text-heading text-ink-black leading-heading">Account</h1>

        {isProfileIncomplete && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-left flex items-start gap-4">
            <div className="size-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 font-bold text-amber-700">
              !
            </div>
            <div className="space-y-1">
              <h3 className="text-body font-semibold text-ink-black">Complete Your Host Profile</h3>
              <p className="text-body-sm text-smoke">
                To manage and publish property listings, hosts are required to upload a **Profile Photo** and write a brief **Bio (About you)** below.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-10 md:flex-row">
          <AccountNav />

          <div className="min-w-0 flex-1 space-y-10">
            <FadeIn inView={false} delay={0}>
              <section aria-labelledby="personal-info">
                <h2 id="personal-info" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                  Personal info & Profile
                </h2>
                <p className="mt-1 text-body-sm text-smoke tracking-body-sm">
                  Update your profile photo, contact details, and host bio.
                </p>

                {/* Profile Photo Upload */}
                <div className="mt-6 flex items-center gap-5 p-4 rounded-2xl border border-border bg-ash-mist/30">
                  <div className="relative size-16 rounded-full overflow-hidden bg-ash-mist border border-border shrink-0">
                    {user?.avatar ? (
                      /* eslint-disable-next-next/no-img-element */
                      <img src={user.avatar} alt={user.full_name} className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center font-bold text-lg text-graphite">
                        {user?.full_name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <Label htmlFor="avatar-upload" className="text-body-sm font-semibold text-ink-black cursor-pointer hover:underline">
                      {avatarUploading ? "Uploading photo…" : "Upload Profile Photo"}
                    </Label>
                    <p className="text-body-xs text-smoke">JPG, PNG, or WebP. Max 5MB.</p>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={avatarUploading}
                      className="hidden"
                    />
                  </div>
                </div>
                {avatarError && <p className="mt-2 text-body-sm text-destructive tracking-body-sm">{avatarError}</p>}

                <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name" className={labelClass}>Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={labelClass}>Phone (WhatsApp)</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email" className={labelClass}>Email</Label>
                    <Input id="email" type="email" value={user?.email ?? ""} disabled className={fieldClass} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bio" className={labelClass}>Bio / About You {isHost && <span className="text-destructive">* (Required for hosts)</span>}</Label>
                    <textarea
                      id="bio"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell guests about yourself, your hospitality background, and your homestays..."
                      className="w-full rounded-2xl p-4 bg-transparent border border-border hover:border-graphite/50 transition-colors text-body text-ink-black focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {profileError && <p className="text-body-sm text-destructive tracking-body-sm sm:col-span-2">{profileError}</p>}
                  {profileStatus === "saved" && <p className="text-body-sm text-primary tracking-body-sm sm:col-span-2">Profile updated successfully.</p>}
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={profileStatus === "saving"} className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                      {profileStatus === "saving" ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </form>
              </section>
            </FadeIn>

            <Separator />

            <FadeIn inView={false} delay={0.05}>
              <section aria-labelledby="security">
                <h2 id="security" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                  Login & security
                </h2>
                <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handlePasswordSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className={labelClass}>Current password</Label>
                    <Input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className={fieldClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className={labelClass}>New password</Label>
                    <Input id="new-password" type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={fieldClass} />
                  </div>
                  {passwordError && <p className="text-body-sm text-destructive tracking-body-sm sm:col-span-2">{passwordError}</p>}
                  {passwordStatus === "saved" && <p className="text-body-sm text-primary tracking-body-sm sm:col-span-2">Password updated.</p>}
                  <div className="sm:col-span-2">
                    <Button type="submit" variant="outline" disabled={passwordStatus === "saving"} className="rounded-full h-[50px] px-8 border-border font-semibold text-graphite">
                      {passwordStatus === "saving" ? "Updating…" : "Update password"}
                    </Button>
                  </div>
                </form>
              </section>
            </FadeIn>

            <Separator />

            <FadeIn inView={false} delay={0.1}>
              <section aria-labelledby="notifications">
                <h2 id="notifications" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                  Notifications
                </h2>
                <p className="mt-1 text-body-sm text-smoke tracking-body-sm">Coming soon — no notification preferences to save yet.</p>
                <div className="mt-6 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-black">WhatsApp updates from hosts</p>
                      <p className="text-body-sm text-smoke tracking-body-sm">Booking confirmations and host replies</p>
                    </div>
                    <Switch defaultChecked disabled aria-label="WhatsApp updates from hosts" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-black">Email receipts</p>
                      <p className="text-body-sm text-smoke tracking-body-sm">Booking confirmations and payment receipts</p>
                    </div>
                    <Switch defaultChecked disabled aria-label="Email receipts" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-black">Kiphaus offers</p>
                      <p className="text-body-sm text-smoke tracking-body-sm">Occasional deals from verified hosts</p>
                    </div>
                    <Switch disabled aria-label="Kiphaus offers" />
                  </div>
                </div>
              </section>
            </FadeIn>

            <Separator />

            <FadeIn inView={false} delay={0.12}>
              <section aria-labelledby="hosting-section">
                <h2 id="hosting-section" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
                  Hosting & Mode
                </h2>
                <p className="mt-1 text-body-sm text-smoke tracking-body-sm">
                  {user?.role === "host"
                    ? "You are registered as a host. Switch to your host dashboard to manage properties, bookings, and verification."
                    : "Earn by listing your homestay or villa on Kiphaus with zero commission."}
                </p>
                <div className="mt-4">
                  <Button
                    onClick={() => router.push(user?.role === "host" ? "/host/dashboard" : "/host/onboarding")}
                    className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {user?.role === "host" ? "Switch to host view" : "Become a host"}
                  </Button>
                </div>
              </section>
            </FadeIn>

            <Separator />

            <FadeIn inView={false} delay={0.15}>
              <section>
                {user && (
                  <p className="text-body-sm text-smoke tracking-body-sm">
                    Member since {new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="mt-4 rounded-full h-[50px] px-6 border-border font-semibold text-graphite"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  Log out
                </Button>
              </section>
            </FadeIn>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
