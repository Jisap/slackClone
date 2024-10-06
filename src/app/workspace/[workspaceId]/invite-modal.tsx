import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"


interface InviteModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  name: string
  joinCode: string
}

export const InviteModal = ({ open, setOpen, name, joinCode }: InviteModalProps) => {
  
  const workspaceId = useWorkspaceId();

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}` // Obtenemos el link de invitación del workspace
    navigator.clipboard
      .writeText(inviteLink)                                           // Copiamos el link al portapapeles 
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link to clipboard"))

    setOpen(false) // Cerramos el modal
  }

  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people to { name }</DialogTitle>
          <DialogDescription>
            Use the code below to invite people to your workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-4 items-center justify-center py-10">
          <p className="text-4xl font-bold tracking-widest uppercase">
            {joinCode}
          </p>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
          >
            Copy link
            <CopyIcon className="ml-2 size-4" />
          </Button>
        </div>
      </DialogContent>
      
    </Dialog>
  )
}


