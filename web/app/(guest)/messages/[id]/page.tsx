import { ConversationThread } from "@/components/features/chat/conversation-thread"
import { FadeIn } from "@/components/motion/fade-in"

export default async function GuestConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <FadeIn inView={false} className="h-full p-4">
      <ConversationThread conversationId={id} backHref="/messages" />
    </FadeIn>
  )
}
