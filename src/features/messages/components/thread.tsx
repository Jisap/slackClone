import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel"
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";
import { Message } from "@/components/Message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";



interface ThreadProps {
  messageId: Id<"messages">
  onClose: () => void;
}

export const Thread = ({ messageId, onClose }: ThreadProps) => {

  const workspaceId = useWorkspaceId();                                                  // Query para obtener el workspaceId según la url
  const { data: currentMember } = useCurrentMember({ workspaceId })                      // Query para obtener el miembro actualmente logueado del workspace
  const { data: message, isLoading: loadingMessage } = useGetMessage({ id: messageId }); // Obtenemos el mensaje y sus props asociadas (user, member, image,reactions)


  if(loadingMessage){
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4  h-[49px] border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button
            onClick={onClose}
            size="iconSm"
            variant="ghost"
          >
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className='flex flex-col gap-y-2 h-full items-center justify-center'>
          <Loader className="animate-spin size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      </div>
    )
  }

  if(!message){
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center px-4  h-[49px] border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button
          onClick={onClose}
          size="iconSm"
          variant="ghost"
        >
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>
      <div className='flex flex-col gap-y-2 h-full items-center justify-center'>
        <AlertTriangle className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Message not found</p>
      </div>
    </div>
  }


  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center px-4  h-[49px] border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button 
          onClick={onClose}
          size="iconSm"
          variant="ghost"  
        >
          <XIcon className="size-5 stroke-[1.5]"/>
        </Button>
      </div>
      <div>
        {message && (
          <Message 
            hideThreadButton
            memberId={message.memberId}
            authorImage={message?.user.image}
            authorName={message?.user.name}
            isAuthor={message.memberId === currentMember?._id} // Si el mensaje = al miembro logueado -> isAuthor = true -> Btn edición visible
            body={message.body}
            image={message.image}
            createdAt={message._creationTime}
            updatedAt={message.updatedAt}
            id={message._id}
            reactions={message.reactions}
            isEditing={false}
            setEditingId={() => {}}
            isCompact={false}
            />
        )}
      </div>
    </div>
  )
}

