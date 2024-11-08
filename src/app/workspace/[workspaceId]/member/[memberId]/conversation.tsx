
import { Id } from "../../../../../../convex/_generated/dataModel"
import { useMemberId } from "@/hooks/use-member-id"
import { useGetMember } from "@/features/members/api/use-get-member"
import { useGetMessages } from "@/features/messages/api/use-get-messages"
import { Loader } from "lucide-react"
import { Header } from "./Header"
import { ChatInput } from "./chat-input"
import { MessageList } from "@/components/message-list"
import { usePanel } from "@/hooks/use-panel"



interface ConversationProps {
  id: Id<"conversations">
}

export const Conversation = ({ id }: ConversationProps) => {

  const memberId = useMemberId();                                                       // id desde url

  const { onOpenProfile } = usePanel();                                                 // Obtiene el valor de parentMessageId desde la Url y lo almacena en el estado -> abre el panel de perfil

  const { data:member, isLoading: memberLoading } = useGetMember({ id: memberId });     // Devuelve el miembro con su usuario asociado según id de miembro
  const { results, status, loadMore } = useGetMessages({                                // Obtenemos los mensajes de la conversation      
    conversationId: id,
  });
  
  if (memberLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => onOpenProfile(memberId)}
      />
      <MessageList 
        data={results}
        variant="conversation"
        memberImage={member?.user.image}
        memberName={member?.user.name}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput 
        placeholder={`Message ${member?.user.name}`}
        conversationId={id}
      />
    </div>
  )
}

