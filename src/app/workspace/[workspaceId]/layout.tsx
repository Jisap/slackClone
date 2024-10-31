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




interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
}

const WorkspaceIdLayout = ({ children }: WorkspaceIdLayoutProps) => {

  const { parentMessageId, onClose } = usePanel(); //Obtenemos el valor de parentMessageId desde la url
  const showPanel = !!parentMessageId;             // Si parentMessageId no es null, mostramos el panel

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
            minSize={20}
          >
            {children}
          </ResizablePanel>
          {showPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={20} defaultSize={29}>
                Load thread
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default WorkspaceIdLayout