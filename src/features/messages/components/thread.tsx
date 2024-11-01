import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel"
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";


interface ThreadProps {
  messageId: Id<"messages">
  onClose: () => void;
}

export const Thread = ({ messageId, onClose }: ThreadProps) => {

  const { data: message, isLoading: loadingMessage } = useGetMessage({ id: messageId }); // Obtenemos el mensaje y sus props asociadas (user, member, image,reactions)

  if(loadingMessage){
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader className="animate-spin size-5 text-muted-foreground" />
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
        {JSON.stringify(message)}
      </div>
    </div>
  )
}

