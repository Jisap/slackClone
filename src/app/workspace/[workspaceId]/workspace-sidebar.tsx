import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { WorkspaceHeader } from "./workspaceHeader";



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
        <Loader className="size-10 animate-spin text-white" />
      </div>)
  }

  if (!workspace || !member) {
    return (
      <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
        <AlertTriangle className="size-10 text-white" />
        <p className="text-white text-sm">
          Workspace not found
        </p>
      </div>)
  }

  return (
    <div className="flex flex-col bg-[#5E2C5F] h-full">
      <WorkspaceHeader workspace={workspace} />
    </div>
  )
}