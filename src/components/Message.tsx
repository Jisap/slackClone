import dynamic from "next/dynamic";
import { Doc, Id } from "../../convex/_generated/dataModel"
import { format, isToday, isYesterday, set } from "date-fns";
import { Hint } from "./hint";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Thumbnail } from "./Thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { update } from '../../convex/messages';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import Reactions from "./reactions";





const Renderer = dynamic(() => import("@/components/Renderer"), {ssr: false});
const Editor = dynamic(() => import("@/components/editor"), {ssr: false});

interface MessageProps {
  id:  Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & { // Tiene todas las propiedades de Doc<"reactions"> excepto memberId.
      count: number;                       // y se le agrega el objeto que contiene count y el array de memberIds
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image:string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
}

const formatFullTime = (date: Date) => {
  return `${
    isToday(date) 
      ? "Today" 
      : isYesterday(date) 
        ? "Yesterday" 
        : format(date, "MMM d, yyyy")
  } at ${format(date, "h:mm:ss a")}`;
}

export const Message = ({
  id,
  memberId,
  authorImage,
  authorName="Member",
  isAuthor,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  threadImage,
  threadTimestamp,
}: MessageProps) => {

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Message",
    "Are you sure you want to delete this message? This cannot be undone.",
  );

  const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction();

  const isPending = isUpdatingMessage;

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage({ id, body }, {
      onSuccess: () => {
        toast.success("Message updated");
        setEditingId(null);
      },
      onError: (error) => {
        toast.error("Failed to update message");
      }
    });
  }

  const handleRemove = async() => {
    const ok = await confirm();
    if (!ok) return;

    removeMessage({ id }, {
      onSuccess: () => {
        toast.success("Message deleted")
        // TODO: Close thread if opened.
      },
      onError: () => {
        toast.error("Failed to delete message");
      },
    })
  }

  const handleReaction = (value:string) => {
    toggleReaction({messageId: id, value},{
      onError: () => {
        toast.error("Failed to toggle reaction")
      }
    })
  }

  // Formato compacto si los mensajes se encuentran en la misma "burbuja de conversación" (según el timestamp)
  if(isCompact){
    return (
      <>
        <ConfirmDialog />
        <div className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
          isRemovingMessage && "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}>
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline"> 
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>

            {isEditing ? (
              <div className="w-full h-full">
                <Editor 
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={body}/>
                <Thumbnail url={image} />
                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                ) : null}
                <Reactions
                  data={reactions}
                  onChange={handleReaction}
                />
              </div>
            )}
          </div>

          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isPending}
              handleEdit={() => setEditingId(id)} // Establece el estado editingId en el mensaje actual -> MessageList (isEditing={editingId === message._id}) -> Message renderizara o no el éditor
              handleThread={() => { }}
              handleDelete={handleRemove}
              handleReaction={handleReaction}
              hidethreadButton={hideThreadButton}
            />
          )}
        </div>
      </>
    )
  }

  const avatarFallback = authorName.charAt(0).toUpperCase();

  return (
    <>
      <ConfirmDialog />
      {/* Cuando se pincha en el mensaje principal para editarlo se aplica un background color al mensaje */}
      <div className={cn( 
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
        isRemovingMessage && "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
      )}>
        <div className="flex items-start gap-2">
          <button>
            <Avatar>
              <AvatarImage 
                src={authorImage} 
              />
              <AvatarFallback>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </button>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor 
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button 
                  onClick={() => {}}  
                  className="font-bold text-primary hover:underline"
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {format(new Date(createdAt), "h:mm a")}
                  </button>
                </Hint>
              </div>
              <Renderer value={body} /> 
              <Thumbnail url={image} />
              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(edited)</span>
              ): null }
              <Reactions
                data={reactions}
                onChange={handleReaction}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => {}}
            handleDelete={handleRemove}
            handleReaction={handleReaction}
            hidethreadButton={hideThreadButton}
          />
        )}
      </div>
    </>
  )
}

