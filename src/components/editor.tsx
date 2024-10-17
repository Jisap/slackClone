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
import { EmojiPopover } from './emoji-popover';


type EditorValue = {
  image: File | null;
  body: string;
}

interface EditorProps {
  variant?: "create" | "update"
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeHolder?: string;
  defaultValue?: Delta | Op[]; // Objeto Delta (formato interno de Quill) o un array de operaciones.
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
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);                    // Estas ref permiten llamar a las props desde dentro del useEffect
  const placeHolderRef = useRef(placeHolder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);

  useLayoutEffect(() => {                               // Este efecto se ejecuta antes de que el navegador pinte, actualizando las referencias con los valores más recientes de las props.
    submitRef.current = onSubmit;
    placeHolderRef.current = placeHolder;
    quillRef.current = null;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled; 
  })

  useEffect(() => {
    if(!containerRef.current) return;

    const container = containerRef.current;            // Define una ref llamada container que sera donde se renderizara el contenedor

    const editorContainer = container.appendChild(     // Al contenedor se le añade un div
      container.ownerDocument.createElement('div')
    );

    const options: QuillOptions = {                    // Se definen las opciones del container
      theme: 'snow',
      placeholder: placeHolderRef.current,
      modules: {
        toolbar:[
          ["bold", "italic", "strike"],
          ["link"],
          [{list: "ordered"}, {list: "bullet"}],
          [{ 'align': [] }],
          ['blockquote', 'code-block'],
          [{ 'size': ['small', false, 'large', 'huge'] }],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                //TODO: Submit form
                return 
              }
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n")
              }
            }
          }
        }
      }
    }

    const quill = new Quill(editorContainer, options); // Se aplican las opciones al contenedor en una instancia de Quill 
    quillRef.current = quill;                          // Definida la instancia de Quill se vincula a quillRef -> Permite acceder a la instancia de Quill desde cualquier parte del componente
    quillRef.current.focus();                          // Se establece así el foco en quillRef

    if (innerRef) {                                    // Al asignar quill a innerRef.current, se permite que el componente padre tenga acceso directo a la instancia de Quill.
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);        // Establece el contenido inicial del editor Quill.
    setText(quill.getText());                          // Actualiza el estado text del componente React con el texto actual del editor. 
    quill.on(Quill.events.TEXT_CHANGE, () => {         // Se agrega un listener para el evento TEXT_CHANGE del editor Quill.
      setText(quill.getText());                        // Cuando cambia el texto de quill se actualiza el estado de text                
    })

    return () => {                                     // Cuando el componente se desmonta o cuando las dependencias del efecto cambian, 
      
      quill.off(Quill.events.TEXT_CHANGE);             // elimina el event listener, 
      if(container){
        container.innerHTML = '';                      // limpia el contenido HTML del contenedor del editor.
      }
      if (quillRef.current) {                          // establece la referencia de Quill a null.
        quillRef.current = null;
      }
      if(innerRef){                                    // establece la referencia de innerRef a null, lo cual
        innerRef.current = null;                       // asegura que cualquier referencia externa a la instancia de Quill también se limpie
      }
    }
  },[innerRef]);

  const toggleToolbar = () => {
    setIsToolbarVisible((current) => !current);                                // Conmuta el estado de isToolbarVisible -> modifica mensaje del hint
    const toolbarElement = containerRef.current?.querySelector('.ql-toolbar'); // Obtiene el elemento con clase "ql-toolbar" del contenedor

    if(toolbarElement){                                                        // Si "ql-toolbar" existe
      toolbarElement.classList.toggle("hidden")                                // conmuta la clase "hidden" del elemento -> oculta/muestra el toolbar
    }

  }

  const isEmpty = text.replace(/<(.|\n)*?>/g, "").trim().length === 0; 

  const onEmojiSelect = (emoji:any) => {                                   // Función para la selección de un emoji 
    const quill = quillRef.current;                                        // Obtiene la instancia de Quill desde la ref
    quill?.insertText(quill?.getSelection()?.index || 0, emoji.native);    //  inserta el emoji en la posición actual del cursor. 
  }

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white'>
        <div 
          ref={containerRef}
          className='h-full ql-custom'  
        />
        <div className='flex px-2 pb-2 z-[5]'>
        <Hint label={isToolbarVisible ? "Hide formatting" : "Show formatting"}>
          <Button
            disabled={disabled}
            variant='ghost'
            size="iconSm"
            onClick={toggleToolbar}
          >
            <PiTextAa className='size-4' />
          </Button>
        </Hint>
        <EmojiPopover onEmojiSelect={() => {}}>
          <Button
            disabled={disabled}
            variant='ghost'
            size="iconSm"
          >
            <Smile className='size-4' />
          </Button>
        </EmojiPopover>
        {variant === "create" && (
          <Hint label="Image">
            <Button
              disabled={disabled}
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
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button
              disabled={disabled || isEmpty}
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