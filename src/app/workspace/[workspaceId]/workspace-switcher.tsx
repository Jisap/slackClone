

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspace";
import { useCreateWorkspacesModal } from "@/features/workspaces/store/use-create-workspaces-modal";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";




export const WorkspaceSwitcher = () => {

  const router = useRouter();
  const workspaceId = useWorkspaceId();                              // Obtenemos el id del workspace contenido en los params
  
  const { 
    data: workspace,
    isLoading: workspaceLoading
  } = useGetWorkspace({ id: workspaceId });                          // Llamamos al hook useGetWorkspace para obtener los datos ese workspace activo perteneciente al usuario logueado
  
  const { 
    data: workspaces,
    isLoading: workspacesLoading
  } = useGetWorkspaces();                                            // Llamamos al hook useGetWorkspaces para obtener los datos de la tabla workspaces pertenecientes al usuario logueado

  const filteredWorkspaces = workspaces?.filter(
    (w) => w._id !== workspaceId);                                   // Filtramos los workspaces que no son el actual (actual = esta en los params)

  const [_open, setOpen] = useCreateWorkspacesModal();               // Estado global del modal de creación de workspaces con atom

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-9 relative overflow-hidden bg-[#ABABAD] hover:bg-[#ABABAD]/80 text-slate-800 font-semibold text-xl">
          {workspaceLoading ? (
            <Loader className="size-5 animate-spin shrink-0" />
          ) : (
            workspace?.name.charAt(0).toUpperCase()
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-64">
        <DropdownMenuItem 
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
          className="cursor-pointer flex flex-col justify-start items-start capitalize"
        >
          {workspace?.name}
          <span className="text-xs text-muted-foreground">
            Active workspace
          </span>
        </DropdownMenuItem>
        {filteredWorkspaces?.map((workspace) => (
          <DropdownMenuItem
            key={workspace._id}
            className="cursor-pointer capitalize overflow-hidden"
            onClick={() => router.push(`/workspace/${workspace._id}`)}
          >
            <div className="shrink-0 size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-lg rounded-md flex items-center justify-center mr-2">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <p className="truncate">
              {workspace.name}
            </p>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <div className="size-9 relative overflow-hidden bg-[#F2F2F2] text-slate-800 font-semibold text-lg rounded-md flex items-center justify-center mr-2"> 
            <Plus />
          </div>
          Create a new workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}