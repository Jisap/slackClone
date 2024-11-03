import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, HashIcon, Loader, MessageSquareText, SendHorizonal, Sidebar } from "lucide-react";
import { WorkspaceHeader } from "./workspaceHeader";
import SidebarItem from "./sidebar-Item";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./WorkspaceSection";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { UserItem } from "./user-item";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMemberId } from "@/hooks/use-member-id";



export const WorkspaceSidebar = () => {

  const memberId = useMemberId();
  const channelId = useChannelId();                          // Obtenemos el id del chanel contenido en los params
  const workspaceId = useWorkspaceId();                      // Obtenemos el id del workspace contenido en los params
  
  const [_open, setOpen] = useCreateChannelModal();          // Estado global del modal de creación de channels con atom

  const { 
    data: member, 
    isLoading: memberIsLoading 
  } = useCurrentMember({ workspaceId });                     // Nos permite saber si el usuario logueado pertenece/es miembro al workspace 
  
  const {
    data: workspace,
    isLoading: workspaceIsLoading
  } = useGetWorkspace({ id: workspaceId });                  // Obtenemos los datos ese workspace activo perteneciente al usuario logueado
  
  const {
    data: channels,
    isLoading: channelsLoading,                            
  } = useGetChannels({ workspaceId })                       // Obtenemos los datos de los channels del workspace

  const { 
    data: members, 
    isLoading: membersLoading 
  } = useGetMembers({ workspaceId });                       // Obtenemos los datos de los miembros del workspace

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
      <WorkspaceHeader 
        workspace={workspace} 
        isAdmin={member.role === "admin"}  
      />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem 
          label="Thread"
          icon={MessageSquareText}
          id="threads"
        />
        <SidebarItem
          label="Draft & Sent"
          icon={SendHorizonal}
          id="drafts"
        />
      </div>

      <WorkspaceSection
        label="Channels"
        hint="New channel"
        onNew={member.role === "admin" ? () => setOpen(true) : undefined} // Abre el modal de creación de channel si eres admin
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            icon={HashIcon}
            label={item.name}
            id={item._id}
            variant={channelId === item._id ? "active" : "default"} // Si estamos en la página de un channel añadimos la clase active
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection
        label="Direct Messages"
        hint="New Direct Message"
        onNew={() => {}}
      >
        {members?.map((item) => (
          <UserItem 
            key={item._id}
            id={item._id}
            label={item.user.name}
            image={item.user.image}
            variant={item._id === memberId ? "active" : "default"} // Si estamos en la página de un channel añadimos la clase active
          />
        ))}
      </WorkspaceSection>
    </div>
  )
}