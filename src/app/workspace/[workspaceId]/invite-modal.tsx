import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useNewJoinCode } from "@/features/workspaces/api/use-new-join-code"
import { useConfirm } from "@/hooks/use-confirm"
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { DialogClose } from "@radix-ui/react-dialog"
import { CopyIcon, RefreshCcw } from "lucide-react"
import { toast } from "sonner"


interface InviteModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  name: string
  joinCode: string
}

export const InviteModal = ({ open, setOpen, name, joinCode }: InviteModalProps) => {
  
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure ?",
    "This will deactivate the current invite code and generate a new one."
  );

  const { mutate, isPending } = useNewJoinCode() // Hook para actualizar el codigo de unión a un workspace

  const handleNewCode = async() => {                  // Llamada al mutation para actualizar el codigo de unión
    
    const ok = await confirm();                       // Se confirma el modal

    if(!ok) return;                                   // Si el usuario no confirma, se cierra el modal
    
    mutate({ workspaceId }, {
      onSuccess: () => {
        toast.success("New code generated")
      },
      onError: () => {
        toast.error("Failed to generate new code")
      }
    })
  }

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/join/${workspaceId}` // Obtenemos el link de invitación del workspace
    navigator.clipboard
      .writeText(inviteLink)                                           // Copiamos el link al portapapeles 
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link to clipboard"))
  }

  
  return (
    <>
      <ConfirmDialog />
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
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isPending}
              onClick={handleNewCode}
              variant="outline"  
            >
              New code
              <RefreshCcw className="ml-2 size-4" />
            </Button>
            <DialogClose asChild>
              <Button>
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
        
      </Dialog>
    </>
  )
}


