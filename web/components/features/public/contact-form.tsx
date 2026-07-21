"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sendContactMessage } from "@/lib/api"

const fieldClass =
  "rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
const labelClass = "text-body-sm font-medium text-graphite tracking-body-sm"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setError(null)
    try {
      await sendContactMessage({ name, email, subject, message })
      setStatus("sent")
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your message. Please try again.")
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-2xl border border-border px-6 py-8 text-center text-body text-ink-black">
        Thanks — we&rsquo;ve got your message and will reply within one business day.
      </p>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className={labelClass}>Name</Label>
          <Input id="contact-name" name="name" required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className={labelClass}>Email</Label>
          <Input id="contact-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-subject" className={labelClass}>Subject</Label>
        <Input id="contact-subject" name="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} className={fieldClass} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message" className={labelClass}>Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-2xl border-border bg-transparent px-5 py-4 text-body hover:border-graphite/50 transition-colors"
        />
      </div>
      {error && <p className="text-body-sm text-destructive tracking-body-sm">{error}</p>}
      <Button type="submit" disabled={status === "sending"} className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  )
}
