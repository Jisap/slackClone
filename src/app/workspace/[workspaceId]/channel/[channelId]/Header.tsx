import { Button } from "@/components/ui/button"
import { FaChevronDown } from "react-icons/fa"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { TrashIcon } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useChannelId } from "@/hooks/use-channel-id"
import { useUpdateChannel } from "@/features/channels/api/use-update-channel"
import { toast } from "sonner"
import { useDeleteChannel } from "@/features/channels/api/use-delete-channel"
import { useConfirm } from "@/hooks/use-confirm"
import { useRouter } from "next/navigation"
import { useWorkspaceId } from "@/hooks/use-workspace-id"



interface HeaderProps {
  name: string
}

export const Header = ({ name }: HeaderProps) => {

  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this channel?",
    "You are about to delete this channel. This action cannot be undone."
  )

  const [value, setValue] = useState(name);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: updateChannel, isPending: isUpdatingChannel } = useUpdateChannel();
  const { mutate: removeChannel, isPending: isRemovingChannel } = useDeleteChannel();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value.replace(/\s+/g, "").toLowerCase(); // Limpiamos el espacio en blanco y quitamos los acentos
    setValue(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateChannel({ id: channelId, name: value }, {
      onSuccess: () => {
        toast.success("Channel name updated successfully");
        setEditOpen(false);
      },
      onError: () => {
        toast.error("Something went wrong");
      },  
    });
  }

  const handleDelete = async() => {
  
    const ok = await confirm();
    if (!ok) return
  
    removeChannel({ id: channelId }, {
      onSuccess: () => {
        toast.success("Channel deleted successfully");
        router.push(`/workspace/${workspaceId}`)
      },
      onError: () => {
        toast.error("Failed to delete channel");
      },  
    });
  }

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <ConfirmDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-lg font-semibold px-2 overflow-hidden w-auto"
            size="sm"
          >
            <span className="truncate"># {name}</span>
            <FaChevronDown className="size-2.5 ml-2"/>
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>
              # {name}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Channel name</p>
                    <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                      Edit
                    </p>
                  </div>
                  <p className="text-sm"># {name}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Rename this channel
                  </DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <Input 
                    value={value}
                    disabled={isUpdatingChannel}
                    onChange={handleChange}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder="Channel name"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        disabled={isUpdatingChannel}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdatingChannel}>
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <button
              onClick={handleDelete}
              disabled={isRemovingChannel}
              className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">Delete Channel</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
