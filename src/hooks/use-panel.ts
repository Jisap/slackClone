import { useParentMessageId } from '../features/messages/store/use-parent-message-id';



export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId(); // Obtiene el valor de parentMessageId desde la Url y lo almacena en el estado

  const onOpenMessage = (messageId: string) => {  // Actualiza el valor de parentMessageId en la Url
    setParentMessageId(messageId);
  }

  const onClose = () => {                         // Establece el parentMessageId en null
    setParentMessageId(null);
  }

  return {
    parentMessageId,
    onOpenMessage,
    onClose
  }
}