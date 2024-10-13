import React, { useEffect, useRef } from 'react'
import Quill, { QuillOptions } from 'quill'
import "quill/dist/quill.snow.css"
import { Button } from './ui/button';
import { PiTextAa } from 'react-icons/pi';
import { ImageIcon, Smile } from 'lucide-react';
import { MdSend } from 'react-icons/md';
import { Hint } from './hint';


const Editor = () => {

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(!containerRef.current) return;

    const container = containerRef.current;

    const editorContainer = container.appendChild(
      container.ownerDocument.createElement('div')
    );

    const options: QuillOptions = {
      theme: 'snow',
    }

    new Quill(editorContainer, options);

    return () => {
      if(container){
        container.innerHTML = '';
      }
    }
  },[])

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
        <Hint label="Submit">
          <Button
            disabled={false}
            onClick={() => {}}
            size="iconSm"
            className='ml-auto bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
          >
            <MdSend className='size-4' />
          </Button>
        </Hint>
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