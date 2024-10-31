"use client"

import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { Loader, TriangleAlert } from "lucide-react";
import { Header } from "./Header";
import { ChatInput } from "./chat-input";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { MessageList } from "@/components/message-list";


const ChannelIdPage = () => {

  const channelId = useChannelId();                 // Obtenemos el id del channel contenido en los params

  const { 
    results,
    status,  // estado de la consulta
    loadMore // carga la siguiente pág de rdos
  } = useGetMessages({ channelId });                // Obtenemos los mensajes del channel así como el status y loadMore desde usePaginatedQuery

  const { 
    data: channel, 
    isLoading: channelLoading 
  } = useGetChannel({ id: channelId });              // Obtenemos la data del channel

  if(channelLoading || status === "LoadingFirstPage"){
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground"/>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted">
          Channel not found
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header name={channel.name} />
      <MessageList 
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"} // isLoadingMore depende del status de la consulta
        canLoadMore={status === "CanLoadMore"}   // al igual que canLoadMore 
      />
      <ChatInput
        placeholder={`Message # ${channel.name}`}
      />
    </div>
  )
}

export default ChannelIdPage