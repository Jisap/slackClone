import { LucideIcon } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { IconType } from "react-icons/lib";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import Link from "next/link";

interface SidebarItemProps {
  label: string;
  icon: LucideIcon | IconType;
  id: string;
}

const SidebarItem = ({ label, icon:Icon, id }: SidebarItemProps) => {

  const workspaceId = useWorkspaceId();

  return (
    <Button 
      asChild
      variant="transparent"  
      size="sm"
    >
      <Link href={`/workspace/${workspaceId}/channel/${id}`}>
        <Icon />
        {label}
      </Link>
    </Button>
  )
}

export default SidebarItem