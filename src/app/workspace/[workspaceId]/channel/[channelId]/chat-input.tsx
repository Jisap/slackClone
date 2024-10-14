
import dynamic from 'next/dynamic'
import Quill from 'quill';
import { useRef } from 'react';

const Editor = dynamic(() => import('@/components/editor'), { ssr: false }); // Carga el componente Editor de forma dinámica y desactiva el renderizado del lado del servidor (SSR) para este componente.

interface ChatInputProps {
  placeholder?: string;
}

export const ChatInput = ({ placeholder }: ChatInputProps) => {

  const editorRef = useRef<Quill | null>(null);


  return (
    <div className='px-5 w-full'>
      <Editor 
        variant="create"
        placeHolder={placeholder}
        onSubmit={() => {}}  
        disabled={false}
        innerRef={editorRef}
      />
    </div>
  )
}

