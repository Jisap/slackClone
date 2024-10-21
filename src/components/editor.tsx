import React, { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Quill, { QuillOptions } from 'quill'
import "quill/dist/quill.snow.css"
import { Button } from './ui/button';
import { PiTextAa } from 'react-icons/pi';
import { ImageIcon, Smile, X, XIcon } from 'lucide-react';
import { MdSend } from 'react-icons/md';
import { Hint } from './hint';
import { Delta, Op } from 'quill/core';
import { cn } from '@/lib/utils';
import { EmojiPopover } from './emoji-popover';
import Image from 'next/image';


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
  const [image, setImage] = useState<File | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
 
  
  const containerRef = useRef<HTMLDivElement>(null);    // Estas ref permiten llamar a las props desde dentro del useEffect
  const submitRef = useRef(onSubmit);                   // Callback en la referencia submitRef se llama cuando se envía el formulario.
  const placeHolderRef = useRef(placeHolder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);
  const imageElementRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {                               // Este efecto se ejecuta antes de que el navegador pinte, actualizando las referencias con los valores más recientes de las props.
    submitRef.current = onSubmit;
    placeHolderRef.current = placeHolder;
    quillRef.current = null;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled; 
  }, []);                                              // [] garantiza que las referencias se inicializan correctamente y se mantienen estables durante la vida útil del componente.

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
              // Comportamiento de la tecla enter
              handler: () => { 
                const text = quill.getText();
                const addedImage = imageElementRef.current?.files?.[0] || null;
                
                const isEmpty = !addedImage && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;
                if(isEmpty) return;

                const body = JSON.stringify(quill.getContents()); // Obtiene el contenido del editor como un string JSON.
                submitRef.current?.({ body, image: addedImage }); // Llama al callback de submit con los datos del editor.
                return 
              }
            },
            // Comportamiento de la tecla shift + enter
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

  const onEmojiSelect = (emoji:any) => {                                   // Función para la selección de un emoji 
    const quill = quillRef.current;                                        // Obtiene la instancia de Quill desde la ref
    quill?.insertText(quill?.getSelection()?.index || 0, emoji.native);    // inserta el emoji en la posición actual del cursor. 
  }


  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0; 


  return (
    <div className='flex flex-col'>
      <input 
        type="file" 
        accept='image/*'
        ref={imageElementRef} // 
        onChange={(event) =>  setImage(event.target.files![0])}
        className='hidden'
      />
      <div className='flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white'>
        <div 
          ref={containerRef}
          className='h-full ql-custom'  
        />
        {!!image && (
          <div className='p-2'>
            <div className='relative size-[62px] flex items-center justify-center group/image'>
              <Hint label="Remove image">
                <button
                  onClick={() => {
                    setImage(null)
                    imageElementRef.current!.value = ""
                  }}
                  className='hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] 
                  border-2 border-white items-center justify-center'
                >
                  <XIcon className='size-3.5'/>
                </button>
              </Hint>
              <Image 
                src={URL.createObjectURL(image)}
                alt="uploaded"
                fill
                className='rounded-xl overflow-hidden border object-cover'
              />
            </div>
          </div>
        )}
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
        <EmojiPopover onEmojiSelect={onEmojiSelect}>
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
              onClick={() => imageElementRef.current?.click()} // click en el input de imagen -> onChange -> setImage
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
              onClick={onCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
            <Button
              disabled={disabled || isEmpty}
              size="sm"
                onClick={() => {
                  onSubmit({                                               // Llama a la función de callback onSubmit cuando se hace click
                    body: JSON.stringify(quillRef.current?.getContents()), // Obtiene el contenido del editor como un string JSON. desde la ref de quill
                    image,                                                 // Obtiene el archivo de imagen si está presente
                  })
                }}
              className='bg-[#007a5a] hover:bg-[#007a5a]/80 text-white'
            >
              Save
            </Button>
          </div>
        )}
        {variant === "create" && (
          <Button
            disabled={disabled || isEmpty}
            onClick={() => {
              onSubmit({ 
                body: JSON.stringify(quillRef.current?.getContents()), 
                image,
              })
            }}
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