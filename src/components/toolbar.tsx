interface ToolbarProps {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (value: string) => void;
  hidethreadButton?: boolean;
}

export const Toolbar = ({
  isAuthor, 
  isPending, 
  handleEdit, 
  handleThread, 
  handleDelete, 
  handleReaction, 
  hidethreadButton
}: ToolbarProps) => {
  return (
    <div>toolbar</div>
  )
}

