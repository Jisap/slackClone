import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMemberProps {
  id: Id<"members">
}

export const useGetMember = ({ id }: UseGetMemberProps) => { // Devuelve el miembro con su usuario asociado según id de miembro
  const data = useQuery(api.members.getById, { id });  
  const isLoading = data === undefined;
  return { data, isLoading }
}