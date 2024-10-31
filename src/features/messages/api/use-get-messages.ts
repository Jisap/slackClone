import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from '../../../../convex/_generated/dataModel';

const BATCH_SIZE = 20;

interface UseGetMessagesProps {
  channelId?: Id<'channels'>
  conversationId?: Id<'conversations'>
  parentMessageId?: Id<'messages'>
}

export type GetMessagesReturnType = typeof api.messages.get._returnType["page"]; // Tipo del retorno de la consulta a la tabla messages

export const useGetMessages = ({ channelId, conversationId, parentMessageId }: UseGetMessagesProps) => {
  
  // Este hook devuelve los resultados de la consulta al endpoint ademas de un status y la fn loadMore si existen más rdos por mostrar
  const { results, status, loadMore } = usePaginatedQuery( 
    api.messages.get,
    { channelId, conversationId, parentMessageId },
    { initialNumItems: BATCH_SIZE },
  );

  return { 
    results,
    status,
    loadMore: () => loadMore(BATCH_SIZE)
  }
}


