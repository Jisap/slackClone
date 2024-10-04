import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCreateChannelModal } from "../store/use-create-channel-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCreateChannel } from "../api/use-create-channel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";



export const CreateChannelModal = () => {

  const workspaceId = useWorkspaceId()
  const [open, setOpen] = useCreateChannelModal();
  const [name, setName] = useState("");

  const { mutate, isPending } = useCreateChannel()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value.replace(/\s+/g, "").toLowerCase(); // Limpiamos el espacio en blanco y quitamos los acentos
    setName(value);
  };

  const handleClose = () => {
    setName("")
    setOpen(false)
  }

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      {name, workspaceId },
      {
        onSuccess: (id) => {
          //TODO: redirect to channel
          handleClose();
        }
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            value={name}
            disabled={isPending}
            onChange={handleChange}
            required
            autoFocus
            minLength={3}
            maxLength={80}
            placeholder="Channel name"
          />
          <div className="flex justify-end">
            <Button
              disabled={false}
            >
              Create
            </Button>
          </div>
        </form>
      </DialogContent>

    </Dialog>

  )
}