
import { useCreateMessage } from '@/features/messages/api/use-create-message';
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url';
import { useChannelId } from '@/hooks/use-channel-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import dynamic from 'next/dynamic'
import Quill from 'quill';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Id } from '../../../../../../convex/_generated/dataModel';

const Editor = dynamic(() => import('@/components/editor'), { ssr: false }); // Carga el componente Editor de forma dinámica y desactiva el renderizado del lado del servidor (SSR) para este componente.

interface ChatInputProps {
  placeholder?: string;
  conversationId: Id<'conversations'>;
}

type CreateMessageValues = {
  conversationId: Id<'conversations'>;
  workspaceId: Id<"workspaces">;
  body: string;
  image: Id<"_storage"> | undefined;
}

export const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {

  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const workspaceId = useWorkspaceId();

  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { mutate: createMessage } = useCreateMessage();

  // callback para el evento submit del formulario
  const handleSubmit = async({ body, image }: {body: string, image: File | null}) => { // Extraemos de la petición el cuerpo del mensaje y la imagen asociada
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);               // Deshabilitamos el editor para evitar que se actualicen los valores del editor
      
      const values: CreateMessageValues = {            // Valores que el mensaje debe tener
        conversationId,
        workspaceId,
        body,
        image: undefined
      }

      if(image){                                                       // Si hay una imagen adjunta
        const url = await generateUploadUrl({}, { throwError: true }); // se genera una URL de subida a convex     
      
        if(!url){
          throw new Error("Url not found");
        }

        const result = await fetch(url, {                              // Subida de la imagen a convex
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: image,
        });

        if(!result.ok){
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();                     // Obtenemos el ID de la imagen subida

        values.image = storageId;                                      // Se actualiza el valor de la imagen en el mensaje
      }

      await createMessage(                             // Llamamos a la mutation de convex para crear el mensaje con los values actualizados
        values
      , { throwError: true });                         // Se lanza un error si ocurre algún error
      setEditorKey((prevKey) => prevKey + 1);          // Incrementamos el contador de mensajes -> provoca que el editor se actualice al actualizar el estado del componente -> limpia el contenido del editor
    } catch (error) {
      toast.error("Failed to create message");
    }finally{
      setIsPending(false);
      editorRef?.current?.enable(true);                // Habilitamos el editor para que se actualicen los valores del editor
    }
  }

  return (
    <div className='px-5 w-full'>
      <Editor 
        key={editorKey}
        variant="create"
        placeHolder={placeholder}
        onSubmit={handleSubmit}  
        disabled={isPending}
        innerRef={editorRef} // ref al componente <Editor />
      />
    </div>
  )
}

