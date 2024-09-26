

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
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";




export const WorkspaceSwitcher = () => {

  const router = useRouter();
  const workspaceId = useWorkspaceId();                               // Obtenemos el id del workspace contenido en los params
  const { 
    data: workspace,
    isLoading: workspaceLoading
  } = useGetWorkspace({ id: workspaceId });                           // Llamamos al hook useGetWorkspace para obtener los datos de uno de los registros de la tabla workspaces
  const { 
    data: workspaces,
    isLoading: workspacesLoading
  } = useGetWorkspaces();                                            // Llamamos al hook useGetWorkspaces para obtener los datos de la tabla workspaces

  const filteredWorkspaces = workspaces?.filter(
    (w) => w._id !== workspaceId);                                   // Filtramos los workspaces que no son el actual

  const [_open, setOpen] = useCreateWorkspacesModal();                             // Estado global del modal de creación de workspaces con atom

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}