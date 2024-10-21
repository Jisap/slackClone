
import { useCreateMessage } from '@/features/messages/api/use-create-message';
import { useChannelId } from '@/hooks/use-channel-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import dynamic from 'next/dynamic'
import Quill from 'quill';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const Editor = dynamic(() => import('@/components/editor'), { ssr: false }); // Carga el componente Editor de forma dinámica y desactiva el renderizado del lado del servidor (SSR) para este componente.

interface ChatInputProps {
  placeholder?: string;
}

export const ChatInput = ({ placeholder }: ChatInputProps) => {

  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const { mutate: createMessage } = useCreateMessage();

  // callback para el evento submit del formulario
  const handleSubmit = async({ body, image }: {body: string, image: File | null}) => { // Extraemos de la petición el cuerpo del mensaje y la imagen asociada
    try {
      setIsPending(true);
      await createMessage({                            // Llamamos a la mutation de convex para crear el mensaje
        body, 
        workspaceId, 
        channelId 
      }, { throwError: true });                        // Se lanza un error si ocurre algún error
      setEditorKey((prevKey) => prevKey + 1);          // Incrementamos el contador de mensajes -> provoca que el editor se actualice al actualizar el estado del componente -> limpia el contenido del editor
    } catch (error) {
      toast.error("Failed to create message");
    }finally{
      setIsPending(false);
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

