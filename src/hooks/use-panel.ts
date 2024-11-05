import { useProfileMemberId } from '@/features/members/store/use-profile-member-id';
import { useParentMessageId } from '../features/messages/store/use-parent-message-id';



export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId(); // Obtiene el valor de parentMessageId desde la Url y lo almacena en el estado
  const [profileMemberId, setProfileMemberId] = useProfileMemberId(); // Obtiene el valor de profileMemberId desde la Url y lo almacena en el estado

  const onOpenMessage = (messageId: string) => {  // Actualiza el valor de parentMessageId en la Url
    setParentMessageId(messageId);
    setProfileMemberId(null);
  }

  const onOpenProfile = (memberId: string) => {  // Actualiza el valor de profileMemberId en la Url
    setProfileMemberId(memberId);
    setParentMessageId(null);
  }

  const onClose = () => {                         // Establece el parentMessageId en null
    setParentMessageId(null);
    setProfileMemberId(null);                     // Establece el profileMemberId en null           
  }


  return {
    parentMessageId,
    profileMemberId,
    onOpenMessage,
    onOpenProfile,
    onClose
  }
}