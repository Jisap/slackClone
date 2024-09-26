

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCreateWorkspacesModal } from "../store/use-create-workspaces-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";





const CreateWorkspaceModal = () => {

  const router = useRouter();
  const [open, setOpen] = useCreateWorkspacesModal();
  const [name, setName] = useState("");

  const handleClose = () => {
    setOpen(false)
    setName("")
  }

  const  { mutate, isPending, isSuccess, isError, isSettled, data, error } = useCreateWorkspace(); // Hook para la creación de un workspace (data es el id del workspace creado)
  
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {  // Cuando se hace submit en el formulario, se ejecuta el método mutate(name) -> data y demas props
    e.preventDefault();
    
    mutate({ name }, {
      onSuccess(data) {
        toast.success("Workspace created successfully")
        router.push(`/workspace/${data}`) // Se redirige al workspace creado
        handleClose()
      }
    })
  }

  return (
    <Dialog 
      open={open}                   // Cuando el estado global de creación de workspaces es true, se muestra el modal
      onOpenChange={handleClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a workspace</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={ handleSubmit }>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            required
            autoFocus
            minLength={3}
            placeholder="Workspace name"
          />
          <div className="flex justify-end">
            <Button disabled={isPending} >
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateWorkspaceModal