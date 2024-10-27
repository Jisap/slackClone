import { MessageSquareTextIcon, Pencil, Smile, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";

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
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
        <EmojiPopover 
          hint="Add reaction"
          onEmojiSelect={(emoji) => handleReaction(emoji.native)}
        >
          <Button
            variant="ghost"
            size="iconSm"
            disabled={isPending}
          >
            <Smile className="size-4"/>
          </Button>
        </EmojiPopover>

        {!hidethreadButton && ( // Si hidethreadButton es falso (variant del message != thread), se muestra el botón de "Reply in thread" para poder responder en el hilo del mensaje.
          <Hint label="Reply in thread">
            <Button
              variant="ghost"
              size="iconSm"
              disabled={isPending}
            >
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}

        {isAuthor && (
          <Hint label="Edit Message">
            <Button
              variant="ghost"
              size="iconSm"
              disabled={isPending}
            >
              <Pencil className="size-4" />
            </Button>
          </Hint>
        )}

        {isAuthor && (
          <Hint label="Delete message">
            <Button
              variant="ghost"
              size="iconSm"
              disabled={isPending}
            >
              <Trash className="size-4" />
            </Button>
          </Hint>
        )}
      </div>
    </div>
  )
}

