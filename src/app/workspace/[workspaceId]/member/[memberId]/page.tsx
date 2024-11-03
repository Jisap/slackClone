"use client"

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversations";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { useEffect } from "react";

const MemberIdPage = () => {

  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();

  const { data, mutate, isPending } = useCreateOrGetConversation();

  useEffect(() => {
    mutate({ workspaceId, memberId })
  },[memberId, workspaceId, mutate]);

  if(isPending){
    return(
      <div className="h-full flex-1 flex items-center justify-center">
        <Loader className="animate-spin size-5 text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <AlertTriangle className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    )
  }

  return (
    <div>
      
    </div>
  )
}

export default MemberIdPage