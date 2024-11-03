"use client"

import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

const MemberIdPage = () => {

  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();

  return (
    <div>
      {JSON.stringify({memberId, workspaceId})}
    </div>
  )
}

export default MemberIdPage