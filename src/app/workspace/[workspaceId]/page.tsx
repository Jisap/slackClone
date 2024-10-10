"use client"

import { useRouter } from "next/navigation"
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useEffect, useMemo } from "react";
import { Loader, TriangleAlert } from "lucide-react";
import { useCurrentMember } from "@/features/members/api/use-current-member";

const ChanneIdPage = () => {

  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [open, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });             // Datos del usuario actual ( si es o no miembro del workspace )
  const { data: workspace, isLoading: workspaceIsLoading } = useGetWorkspace({ id: workspaceId });  // Datos del workspace
  const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });           // Datos de los channels del workspace


  const channelId = useMemo(() => channels?.[0]?._id, [channels]);          // Memorizamos el id del primer channel del workspace
  const isAdmin = useMemo(() => member?.role === "admin", [member?.role]);  // Memorizamos si el usuario actual es admin

  useEffect(() => {
    if (
      workspaceIsLoading || 
      channelsLoading || 
      !workspace ||
      member ||
      memberLoading
    ) return   // Si el workspace no esta cargado o los channels no estan cargados, o el member no está cargado, no hacemos nada.

    if (channelId) {                                                 // Si el id del channel es valido, 
      router.push(`/workspace/${workspaceId}/channel/${channelId}`); // redirigimos al channel
    } else if (!open && isAdmin) {                                   // Si el id del channel no es valido y el modal de creación de channel no esta abierto
      setOpen(true)                                                  // abrimos el modal de creación de channel
    }
  }, [
    channelId,
    workspaceIsLoading,
    channelsLoading, ,
    workspace,
    open,
    setOpen,
    router,
    workspaceId,
    member,
    memberLoading,
    isAdmin
  ]);

  if (workspaceIsLoading || channelsLoading || memberLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!workspace || !member) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Workspace not found
        </span>
      </div>
    )
  }

  return (
    <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
      <TriangleAlert className="size-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Channel not found
      </span>
    </div>
  )
}

export default ChanneIdPage