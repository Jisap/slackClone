"use client"


import { Sidebar } from './sidebar';
import {Toolbar } from './toolbar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { WorkspaceSidebar } from './workspace-sidebar';
import { usePanel } from '@/hooks/use-panel';
import { Loader } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';
import { Thread } from '@/features/messages/components/thread';
import { Profile } from '@/features/members/components/profile';




interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
}

const WorkspaceIdLayout = ({ children }: WorkspaceIdLayoutProps) => {

  const { parentMessageId, profileMemberId, onClose } = usePanel();     // Obtenemos el valor de parentMessageId y profileMemberId desde la url
  const showPanel = !!parentMessageId || !!profileMemberId;             // Si parentMessageId o profileMemberId no es null, mostramos el panel

  return (
    <div className='h-full'>
      <Toolbar />
      <div className='flex h-[calc(100vh-40px)] w-full'>
        <Sidebar />
        <ResizablePanelGroup 
          direction="horizontal"
          autoSaveId="ca-workspace-layout"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className='bg-[#5E2C5F]'
          >
            <WorkspaceSidebar />
            <div>
              Chanels sidebar
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel 
            defaultSize={80}
            minSize={20}
          >
            {children}
          </ResizablePanel>
          {showPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={20} defaultSize={29}>
                {parentMessageId ? (
                  <Thread 
                    messageId={parentMessageId as Id<"messages">}
                    onClose={onClose}
                  />
                ) : profileMemberId ? (
                  <Profile 
                    memberId={profileMemberId as Id<"members">}
                    onClose={onClose}
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <Loader className="animate-spin size-5 text-muted-foreground"/>
                  </div>

                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default WorkspaceIdLayout