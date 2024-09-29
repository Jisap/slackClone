import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Loader } from "lucide-react";



export const WorkspaceSidebar = () => {

  const workspaceId = useWorkspaceId();                      // Obtenemos el id del workspace contenido en los params
  const { 
    data: member, 
    isLoading: memberIsLoading 
  } = useCurrentMember({ workspaceId });                     // Nos permite saber si el workspace pertenece al usuario logueado
  const {
    data: workspace,
    isLoading: workspaceIsLoading
  } = useGetWorkspace({ id: workspaceId });                  // Obtenemos los datos ese workspace activo perteneciente al usuario logueado
  
  if(memberIsLoading || workspaceIsLoading) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <Loader />
      </div>)
  }

  return (
    <div>Workspace sidebar</div>
  )
}