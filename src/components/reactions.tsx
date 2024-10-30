import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { cn } from "@/lib/utils";

interface ReactionsProps {
  data: Array<
    Omit<Doc<"reactions">, "memberId"> & { // Se omite el campo "memberId" de cada reacción
      count: number;                       // y se le añade el objeto que contiene el número de reacciones
      memberIds: Id<"members">[]           // y un array de miembros que hicieron la reacción 
    }
  >
  onChange: (value: string) => void
}

export const Reactions = ({ data, onChange }: ReactionsProps) => {

  const workspaceId = useWorkspaceId();                              // workspaceId según el url
  const { data: currentMember } = useCurrentMember({ workspaceId }); // Query para obtener el miembro actualmente logueado del workspace

  const currentMemberId = currentMember?._id;

  if(data.length === 0 || !currentMemberId){
    return null
  }

  return (
    <div className="flex items-center gap-1 mt-1 mb-1">
      {data.map((reaction) => (
        <button className={cn(
          "h-6 px-2 rounded-full bg-slate-200/70 border border-transparent text-slate-800 flex items-center gap-x-1",
          reaction.memberIds.includes(currentMemberId) && "bg-blue-100/70 border-blue-500 text-blue-500"
        )}>
          {reaction.value}
          <span>{reaction.count}</span>
        </button>
      ))}
    </div>
  )
}

export default Reactions