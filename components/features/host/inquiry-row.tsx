import { Badge } from "@/components/ui/badge"
import type { HostInquiry } from "@/lib/mock-data"

const STATUS_LABEL: Record<HostInquiry["status"], string> = {
  new: "New",
  responded: "Responded",
  booked: "Booked",
}

const STATUS_VARIANT: Record<HostInquiry["status"], "default" | "secondary" | "outline"> = {
  new: "default",
  responded: "outline",
  booked: "secondary",
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export function InquiryRow({ inquiry }: { inquiry: HostInquiry }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink-black">{inquiry.guestName}</p>
          <Badge variant={STATUS_VARIANT[inquiry.status]}>{STATUS_LABEL[inquiry.status]}</Badge>
        </div>
        <p className="truncate text-body-sm text-smoke tracking-body-sm">{inquiry.property.title}</p>
        <p className="mt-1 text-body-sm text-graphite tracking-body-sm">{inquiry.message}</p>
      </div>
      <span className="shrink-0 text-body-sm text-smoke tracking-body-sm">{formatDate(inquiry.receivedAt)}</span>
    </div>
  )
}
