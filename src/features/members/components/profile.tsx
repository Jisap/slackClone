import { Id } from "convex/_generated/dataModel"


interface ProfileProps {
  memberId: Id<"members">
  onClose: () => void
}

export const Profile = ({ memberId, onClose }: ProfileProps) => {
  return (
    <div>
      profile
    </div>
  )
}

