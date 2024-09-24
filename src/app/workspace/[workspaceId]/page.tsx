"use client"

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { useParams } from "next/navigation"


const WorkSpaceIdPage = () => {

  const workspaceId = useWorkspaceId();                     // Obtenemos el id del workspace contenido en los params       
  const { data } = useGetWorkspace({ id: workspaceId });    // Llamamos al hook useGetWorkspace para obtener los datos del workspace

  return (
    <div>
      ID: {JSON.stringify(data)}    
    </div>
  )
}

export default WorkSpaceIdPage