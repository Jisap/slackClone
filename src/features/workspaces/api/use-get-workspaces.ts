import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"




export const useGetWorkspaces = () => {
  const data = useQuery(api.workspaces.get);  // Llamamos al hook useQuery para obtener los datos de la tabla workspaces
  const isLoading = data === undefined;
  return { data, isLoading }
}