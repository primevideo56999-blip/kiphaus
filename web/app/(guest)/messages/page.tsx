import { MessageSquare } from "lucide-react"
import { FadeIn } from "@/components/motion/fade-in"

export default function GuestMessagesPage() {
  return (
    <FadeIn inView={false} className="hidden h-full flex-col items-center justify-center gap-3 text-center md:flex">
      <MessageSquare className="size-10 text-smoke" strokeWidth={1.5} />
      <p className="font-semibold text-ink-black">Select a conversation</p>
      <p className="max-w-xs text-body-sm text-smoke tracking-body-sm">
        Pick a conversation from the list to see the full message thread.
      </p>
    </FadeIn>
  )
}
