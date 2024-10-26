import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { Message } from "./Message";
import { ChannelHero } from "./ChannelHero";

const TIME_THRESHOLD = 5; // Representa el umbral de tiempo máximo entre dos mensajes consecutivos para considerarlos "compactos"
                          // (es decir, que pertenezcan a la misma "burbuja de conversación").
                          
                          
interface MessageListProps {
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: number;
  variant?: "channel" | "thread" | "conversation";
  data: GetMessagesReturnType | undefined;
  loadMore: () => void;
  isLoadingMore: boolean;
  canLoadMore: boolean;
}

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if(isToday(date)) return "Today";
  if(isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
}

export const MessageList = ({
  memberName,
  memberImage,
  channelName,
  channelCreationTime,
  variant="channel",
  data,
  loadMore,
  isLoadingMore,
  canLoadMore,  
}: MessageListProps) => {

  const groupedMessages = data?.reduce( // Mensajes agrupados por fechas
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if(!groups[dateKey]){
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof data>
  )

  // Object convierte un objeto 
  // const obj = {
  //   "2024-10-24": [mensaje1, mensaje2],
  //   "2024-10-23": [mensaje3, mensaje4]
  // }
  // en un array de pares[clave, valor] -> 
  // [
  //   ["2024-10-24", [mensaje1, mensaje2]],
  //   ["2024-10-23", [mensaje3, mensaje4]]
  // ]

  return (
    <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
     {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
        <div key={dateKey}>
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              {formatDateLabel(dateKey)}
            </span>
          </div>
          {messages.map((message, index) => {
            
            const prevMessage = messages[index - 1];
            const isCompact =                                   // booleano que indica si los mensajes son "compactos" o no
              prevMessage &&                                    // si hay un mensaje anterior y    
              prevMessage.user?._id === message.user?._id &&    // si el mensaje anterior pertenece al mismo usuario que crea el último mensaje
              differenceInMinutes(                              // se comprueba que la diferencia de tiempo entre ambos mensajes es menor a TIME_THRESHOLD.
                new Date(message._creationTime),
                new Date(prevMessage._creationTime)      
              ) < TIME_THRESHOLD;                               // Si las condiciones se cumplen se devuelve true -> isCompact = true
            
            return (
              <Message 
                key={message._id}
                id={message._id}
                memberId={message.memberId}
                authorImage={message.user.image}
                authorName={message.user.name}
                isAuthor={false}
                reactions={message.reactions}
                body={message.body}
                image={message.image}
                updatedAt={message.updatedAt}
                createdAt={message._creationTime}
                isEditing={false}
                setEditingId={() => {}}
                isCompact={isCompact}
                hideThreadButton={false}
                threadCount={message.threadCount}
                threadImage={message.threadImage}
                threadTimestamp={message.threadTimestamp}
              />
            )
          })}
        </div>
     ))}
     {variant === "channel" && channelName && channelCreationTime && (
      <ChannelHero 
        name={channelName}
        creationTime={channelCreationTime}
      />
     )}
    </div>
  )
}

