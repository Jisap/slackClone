"use client"


import { Sidebar } from './sidebar';
import {Toolbar } from './toolbar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"



interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
}

const WorkspaceIdLayout = ({ children }: WorkspaceIdLayoutProps) => {
  return (
    <div className='h-full'>
      <Toolbar />
      <div className='flex h-[calc(100vh-40px)] w-full'>
        <Sidebar />
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <div>
              Chanels sidebar
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default WorkspaceIdLayout