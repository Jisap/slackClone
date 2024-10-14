import React, { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Quill, { QuillOptions } from 'quill'
import "quill/dist/quill.snow.css"
import { Button } from './ui/button';
import { PiTextAa } from 'react-icons/pi';
import { ImageIcon, Smile } from 'lucide-react';
import { MdSend } from 'react-icons/md';
import { Hint } from './hint';
import { Delta, Op } from 'quill/core';
import { cn } from '@/lib/utils';


type EditorValue = {
  image: File | null;
  body: string;
}

interface EditorProps {
  variant?: "create" | "update"
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeHolder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
}

const Editor = ({ 
  variant = "create",
  onSubmit,
  onCancel,
  placeHolder="Write a message...",
  defaultValue=[],
  disabled=false,
  innerRef,
} : EditorProps) => {

  const [text, setText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);                        // Estas ref permiten llamar a las props desde dentro del useEffect
  const placeHolderRef = useRef(placeHolder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);

  useLayoutEffect(() => {                                      // Esto se ejecuta cuando el componente se renderiza por primera vez
    submitRef.current = onSubmit;
    placeHolderRef.current = placeHolder;
    quillRef.current = null;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled; 
  })

  useEffect(() => {
    if(!containerRef.current) return;

    const container = containerRef.current;

    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    );

    const options: QuillOptions = {
      theme: 'snow',
      placeholder: placeHolderRef.current,
    }

    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();

    if(innerRef){
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());
    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    })

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if(container){
        container.innerHTML = '';
      }
      if(quillRef.current){
        quillRef.current = null;
      }
      if(innerRef){
        innerRef.current = null;
      }
    }
  },[innerRef]);

  const isEmpty = text.replace(/<(.|\n)*?>/g, "").trim().length === 0; 

  console.log({ isEmpty, text });

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white'>
        <div 
          ref={containerRef}
          className='h-full ql-custom'  
        />
        <div className='flex px-2 pb-2 z-[5]'>
        <Hint label="Hide formatting">
          <Button
            disabled={false}
            variant='ghost'
            size="iconSm"
            onClick={() => {}}
          >
            <PiTextAa className='size-4' />
          </Button>
        </Hint>
        <Hint label="emoji">
          <Button
            disabled={false}
            variant='ghost'
            size="iconSm"
            onClick={() => { }}
          >
            <Smile className='size-4' />
          </Button>
        </Hint>
        {variant === "create" && (
          <Hint label="Image">
            <Button
              disabled={false}
              variant='ghost'
              size="iconSm"
              onClick={() => { }}
            >
              <ImageIcon className='size-4' />
            </Button>
          </Hint>
        )}
        {variant === "update" && (
          <div className='ml-auto flex items-center gap-x-2'>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {}}
              disabled={false}
            >
              Cancel
            </Button>
            <Button
              disabled={false}
              size="sm"
              onClick={() => {}}
              className='bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
            >
              Save
            </Button>
          </div>
        )}
        {variant === "create" && (
          <Button
            disabled={disabled || isEmpty}
            onClick={() => {}}
            size="iconSm"
            className={cn(
              'ml-auto', 
              isEmpty 
                ? 'bg-white hover:bg-white text-muted-foreground'
                : 'bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
            )}
          >
            <MdSend className='size-4' />
          </Button>
        )}
        
        </div>     
      </div>

      <div className='p-2 tex-[10px] text-muted-foreground flex justify-end'>
        <p>
          <strong>Shift + Return</strong> to add a new line
        </p>
      </div>
    </div>
  )
}

export default Editor