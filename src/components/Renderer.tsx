
import Quill from "quill"
import { useEffect, useRef, useState } from "react"


interface RendererProps {
  value: string;
}


const Renderer = ({ value }:RendererProps) => { // Componente que muestra el contenido de un mensaje en formato HTML
  
  const [isEmpty, setIsEmpty] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(!rendererRef.current) return;
    const container = rendererRef.current;
    const quill = new Quill(document.createElement("div"), {
      theme: "snow",
    });

    quill.enable(false);                        // El editor solo esta en modo lectura
    const contents = JSON.parse(value);
    quill.setContents(contents);

    const isEmpty = quill               
      .getText()                                // obtiene el contenido de texto puro del editor  
      .replace(/<(.|\n)*?>/g, "")               // elimina cualquier etiqueta HTML que pudiera estar en el texto y las reemplaza por una cadena vacía
      .trim()                                   // elimina cualquier espacio en blanco al principio y final del texto
      .length === 0;                            // devuelve true si el texto es vacío

    setIsEmpty(isEmpty);

    container.innerHTML = quill.root.innerHTML; // Reemplaza el contenido HTML del contenedor con el contenido HTML del editor.

    return () => {
      if(container){                            // Si el contenedor existe
        container.innerHTML = '';               // limpia el contenido HTML del contenedor.
      }
    }
  },[value]);

  if(isEmpty) return null;
    

  return (
    <div 
      ref={rendererRef}
      className="q-editor ql-renderer"
    >

    </div>
  )
}

export default Renderer