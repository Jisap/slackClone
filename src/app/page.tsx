"use client"

import { UserButton } from "@/features/auth/components/user-button";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspacesModal } from "@/features/workspaces/store/use-create-workspaces-modal";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";



export default function Home() {

  const router = useRouter();
  const [open, setOpen] = useCreateWorkspacesModal();         // Estado global del modal de creación de workspaces con atom
  const { data, isLoading } = useGetWorkspaces();             // Llamamos al hook useGetWorkspaces para obtener los datos de la tabla workspaces
  const workspaceId = useMemo(() => data?.[0]?._id, [data]);  // Obtenemos el id del workspace actual

  useEffect(() => {
    if(isLoading) return 
    
    if(workspaceId) {
      router.replace(`/workspace/${workspaceId}`);
    }else if (!open){
      console.log("Open creation modal");
      setOpen(true);
    }
  },[workspaceId, isLoading, open, setOpen])

  return (
      <div className="flex items-center gap-x-2">
        <UserButton />
      </div>
  );
}
