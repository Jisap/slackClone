import { useParams } from "next/navigation";
import { Id } from '../../convex/_generated/dataModel';


export const useWorkspaceId = () => {

  const params = useParams();                              // Obtenemos los parámetros de la URL
  return params.workspaceId as Id<"workspaces">            // Devolvemos el id del workspace contenido en el parámetro
}