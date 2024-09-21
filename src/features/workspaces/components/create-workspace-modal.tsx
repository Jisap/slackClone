

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCreateWorkspacesModal } from "../store/use-create-workspaces-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";




const CreateWorkspaceModal = () => {

  const [open, setOpen] = useCreateWorkspacesModal();
  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a workspace</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <Input 
            value=""
            disabled={false}
            required
            autoFocus
            minLength={3}
            placeholder="Workspace name"
          />
          <div className="flex justify-end">
            <Button disabled={false} >
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateWorkspaceModal