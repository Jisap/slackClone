

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





const CreateWorkspaceModal = () => {

  const [open, setOpen] = useCreateWorkspacesModal();
  const [name, setName] = useState("");
  const handleClose = () => setOpen(false);

  const  { mutate, isPending, isSuccess, isError, isSettled, data, error } = useCreateWorkspace();
  
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    mutate({ name }, {
      onSuccess(data) {
        console.log(data);
      }
    })
  }

  return (
    <Dialog 
      open={open} 
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