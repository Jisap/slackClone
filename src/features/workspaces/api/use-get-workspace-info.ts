import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetWorkspaceInfoProps {
  id: Id<"workspaces">
}


export const useGetWorkspaceInfo = ({ id }: UseGetWorkspaceInfoProps ) => {
  const data = useQuery(api.workspaces.getInfoById, { id });  // Llamamos al hook useQuery para obtener los datos de uno de los registros de la tabla workspaces
  const isLoading = data === undefined;
  return { data, isLoading }
}