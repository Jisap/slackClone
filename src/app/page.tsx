"use client"

import { UserButton } from "@/features/auth/components/user-button";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useMemo } from "react";



export default function Home() {

  const { data, isLoading } = useGetWorkspaces();             // Llamamos al hook useGetWorkspaces para obtener los datos de la tabla workspaces
  const workspaceId = useMemo(() => data?.[0]?._id, [data]);  // Obtenemos el id del workspace actual

  useEffect(() => {
    if(isLoading) return 
    
    if(workspaceId) {
      console.log("Redirect to workspace");
    }else{
      console.log("Open creation modal");
    }
  },[workspaceId, isLoading])

  return (
      <div className="flex items-center gap-x-2">
        <UserButton />
      </div>
  );
}
