
import { useCreateMessage } from '@/features/messages/api/use-create-message';
import { useChannelId } from '@/hooks/use-channel-id';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import dynamic from 'next/dynamic'
import Quill from 'quill';
import { useRef } from 'react';

const Editor = dynamic(() => import('@/components/editor'), { ssr: false }); // Carga el componente Editor de forma dinámica y desactiva el renderizado del lado del servidor (SSR) para este componente.

interface ChatInputProps {
  placeholder?: string;
}

export const ChatInput = ({ placeholder }: ChatInputProps) => {

  const editorRef = useRef<Quill | null>(null);

  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const { mutate: createMessage } = useCreateMessage();

  const handleSubmit = ({ body, image}: {body: string, image: File | null}) => { // 
    console.log(body, image);
    createMessage({ body, workspaceId, channelId });
  }

  return (
    <div className='px-5 w-full'>
      <Editor 
        variant="create"
        placeHolder={placeholder}
        onSubmit={handleSubmit}  
        disabled={false}
        innerRef={editorRef} // ref al componente <Editor />
      />
    </div>
  )
}

