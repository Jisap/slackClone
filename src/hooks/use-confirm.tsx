import { Button } from "@/components/ui/button";
import { useState, use } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"



export const useConfirm = (
  title: string,
  message: string,
): [() => JSX.Element, () => Promise<unknown>] => {

  const [promise, setPromise] = useState<{                  // Estado que almacena un objeto, 
    resolve: (value: boolean) => void                       // con la función resolve que se ejecutará cuando se confirma o se cancele el modal
  } | null>(null);                                          // y null si el modal no está abierto

  // Funciones para manejar la promesa
  const confirm = () => new Promise((resolve, reject) => {  // Devuelve una nueva promesa que el usuario confirma o no en el modal
    setPromise({ resolve });                                // estableciendo su estado con la función resolve
  });

  const handleClose = () => {                               // Esta función cierra el diálogo estableciendo el estado promise de nuevo en null.
    setPromise(null);
  }

  // Funciones para manejar el modal en btns
  const handleCancel = () => {                              // El usuario cancela el modal 
    promise?.resolve(false);                                // resolviendo la promesa en false
    handleClose();                                          // cierra el modal y establece el estado promise de nuevo en null
  }

  const handleConfirm = () => {                             // El usuario confirma el modal 
    promise?.resolve(true);                                 // resolviendo la promesa en true
    handleClose();                                          // cierra el modal y establece el estado promise de nuevo en null
  }

  const ConfirmDialog = () => (
    // Si la promesa no es null, se renderiza el modal
    <Dialog open={promise !== null}>  
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )


  return [
    ConfirmDialog, confirm
  ]
}

