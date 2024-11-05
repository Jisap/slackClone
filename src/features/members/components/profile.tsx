import { Id } from "convex/_generated/dataModel"
import { useGetMember } from "../api/use-get-member"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader, XIcon } from "lucide-react"


interface ProfileProps {
  memberId: Id<"members">
  onClose: () => void
}

export const Profile = ({ memberId, onClose }: ProfileProps) => {

  const { data: member, isLoading: isLoadingMember } = useGetMember({ id: memberId });

  if (isLoadingMember) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center px-4  h-[49px] border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button
            onClick={onClose}
            size="iconSm"
            variant="ghost"
          >
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className='flex flex-col gap-y-2 h-full items-center justify-center'>
          <Loader className="animate-spin size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Profile not found</p>
        </div>
      </div>
    )
  }

  if (!member) {
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center px-4  h-[49px] border-b">
        <p className="text-lg font-bold">Profile</p>
        <Button
          onClick={onClose}
          size="iconSm"
          variant="ghost"
        >
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>
      <div className='flex flex-col gap-y-2 h-full items-center justify-center'>
        <AlertTriangle className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Member not found</p>
      </div>
    </div>
  }

  return (
    <div>
      profile
    </div>
  )
}

