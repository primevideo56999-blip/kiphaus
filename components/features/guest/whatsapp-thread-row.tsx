import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MessageThread } from "@/lib/mock-data"

export function WhatsAppThreadRow({ thread }: { thread: MessageThread }) {
  const { property } = thread
  const whatsappHref = `https://wa.me/${property.whatsappNumber.replace(/\D/g, "")}`

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border p-4">
      <Link href={`/rooms/${property.id}`} className="relative size-14 shrink-0 overflow-hidden rounded-full bg-muted">
        {property.images[0] && (
          <Image src={property.images[0]} alt={property.title} fill className="object-cover" sizes="56px" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-ink-black">{property.hostName}</p>
          {thread.unread && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
        </div>
        <p className="truncate text-body-sm text-smoke tracking-body-sm">{property.title}</p>
        <p className="mt-0.5 truncate text-body-sm text-graphite tracking-body-sm">{thread.lastMessage}</p>
      </div>

      <Button
        size="icon"
        className="size-11 shrink-0 rounded-full bg-primary hover:bg-primary/90"
        aria-label={`Continue on WhatsApp with ${property.hostName}`}
        render={<a href={whatsappHref} target="_blank" rel="noopener noreferrer" />}
        nativeButton={false}
      >
        <MessageCircle className="size-5 text-primary-foreground" />
      </Button>
    </div>
  )
}
