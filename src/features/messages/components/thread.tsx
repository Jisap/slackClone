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
import { useGetMessages } from "../api/use-get-messages";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";


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

const TIME_THRESHOLD = 5;

export const Thread = ({ messageId, onClose }: ThreadProps) => {

  const channelId = useChannelId()
  const workspaceId = useWorkspaceId();                                                  // Query para obtener el workspaceId según la url

  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { mutate: createMessage } = useCreateMessage();

  const { data: currentMember } = useCurrentMember({ workspaceId })                      // Query para obtener el miembro actualmente logueado del workspace
  const { data: message, isLoading: loadingMessage } = useGetMessage({ id: messageId }); // Obtenemos el mensaje y sus props asociadas (user, member, image,reactions)
  const { results, status, loadMore} = useGetMessages({                                  // hook para obtener los mensajes asociados al hilo
    channelId, 
    parentMessageId: messageId 
  });

  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

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
  };

  const groupedMessages = results?.reduce( // Mensajes agrupados por fechas
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message); // Agrega el mensaje actual al principio del arreglo de esa fecha.
      return groups;                    // Devuelve un objeto con las fechas como claves y los mensajes como valores
    },
    {} as Record<string, typeof results>
  )

  //{
  //  "2024-11-01": [/* mensajes del 1 de noviembre de 2024 */],
  //  "2024-11-02": [/* mensajes del 2 de noviembre de 2024 */],
  //}

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
  }


  


  if(loadingMessage || status === "LoadingFirstPage"){
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
      <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
        {/* Aquí se mostrarán los mensajes agrupados por fechas en Thread component */}
        {
          Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
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
                    isAuthor={message.memberId === currentMember?._id}
                    reactions={message.reactions}
                    body={message.body}
                    image={message.image}
                    updatedAt={message.updatedAt}
                    createdAt={message._creationTime}
                    isEditing={editingId === message._id}
                    setEditingId={setEditingId}
                    isCompact={isCompact}
                    hideThreadButton
                    threadCount={message.threadCount}
                    threadImage={message.threadImage}
                    threadName={message.threadName}
                    threadTimestamp={message.threadTimestamp}
                  />
                )
              })}
            </div>
          ))
        }

        {/* loadMore utils para cargar más mensajes */}
        <div
          className="h-1"
          ref={(el) => {                                          // Asignamos una ref al div
            if (el) {                                             // Si el div se monto y existe la ref
              const observer = new IntersectionObserver(          // se crea una instancia de IntersectionObserver que detecta si un elemento (div) está dentro de la vista del usuario
                ([entry]) => {                                    // Cada vez que el estado de visibilidad del div cambia respecto al viewport se ejecuta este cb              
                  if (entry.isIntersecting && canLoadMore) {      // Si el div se encuentra dentro de la vista del usuario y la prop canLoadMore es true se ejecuta loadMore
                    loadMore();
                  }
                },
                { threshold: 1.0 }                              // Especifica que el callback debe activarse solo cuando el elemento esté completamente dentro del viewport(100 % visible).                    
              );

              observer.observe(el);                             // Comienza a observar el elemento el, activando el callback cuando cambia su visibilidad en el viewport.
              return () => observer.disconnect();
            }
          }}// Este fragmento observa cuándo el div entra en la vista del usuario. Si canLoadMore es true en ese momento, se llama a loadMore() para cargar más contenido.
        />

        {isLoadingMore && (
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              <Loader className="size-4 animate-spin" />
            </span>
          </div>

        )}

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

