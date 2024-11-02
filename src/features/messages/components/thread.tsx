import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel"
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";
import { Message } from "@/components/Message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useCreateMessage } from "../api/use-create-message";
import { useChannelId } from "@/hooks/use-channel-id";
import { toast } from "sonner";


const Editor = dynamic(() => import("@/components/editor"), { ssr: false });


interface ThreadProps {
  messageId: Id<"messages">
  onClose: () => void;
}

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages"> // En este componente es necesario el parentMessageId para responder el mensaje
  body: string;
  image: Id<"_storage"> | undefined;
}

export const Thread = ({ messageId, onClose }: ThreadProps) => {

  const channelId = useChannelId()

  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { mutate: createMessage } = useCreateMessage();

  const workspaceId = useWorkspaceId();                                                  // Query para obtener el workspaceId según la url
  const { data: currentMember } = useCurrentMember({ workspaceId })                      // Query para obtener el miembro actualmente logueado del workspace
  const { data: message, isLoading: loadingMessage } = useGetMessage({ id: messageId }); // Obtenemos el mensaje y sus props asociadas (user, member, image,reactions)

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  // callback para el evento submit del formulario
  const handleSubmit = async ({ body, image }: { body: string, image: File | null }) => { // Extraemos de la petición el cuerpo del mensaje y la imagen asociada
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);               // Deshabilitamos el editor para evitar que se actualicen los valores del editor

      const values: CreateMessageValues = {            // Valores que el mensaje debe tener
        channelId,
        workspaceId,
        parentMessageId: messageId,
        body,
        image: undefined
      }

      if (image) {                                                       // Si hay una imagen adjunta
        const url = await generateUploadUrl({}, { throwError: true });   // se genera una URL de subida a convex     

        if (!url) {
          throw new Error("Url not found");
        }

        const result = await fetch(url, {                                // Subida de la imagen a convex
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();                     // Obtenemos el ID de la imagen subida

        values.image = storageId;                                      // Se actualiza el valor de la imagen en el mensaje
      }

      await createMessage(                                             // Llamamos a la mutation de convex para crear el mensaje con los values actualizados
        values
        , { throwError: true });                                       // Se lanza un error si ocurre algún error
      setEditorKey((prevKey) => prevKey + 1);                          // Incrementamos el contador de mensajes -> provoca que el editor se actualice al actualizar el estado del componente -> limpia el contenido del editor
    } catch (error) {
      toast.error("Failed to create message");
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);                                // Habilitamos el editor para que se actualicen los valores del editor
    }
  }

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
            isEditing={editingId === message._id} // Cuando en el toolbar se da al btn de editar -> setEditingId(id) -> Si es = message._id que se renderiza en thread -> Editor
            setEditingId={setEditingId}
            isCompact={false}
            />
        )}
      </div>
      <div className="px-4">
        <Editor 
          key={editorKey}
          onSubmit={handleSubmit}
          innerRef={editorRef}
          disabled={isPending}
          placeHolder="Reply..."
        />
      </div>
    </div>
  )
}

