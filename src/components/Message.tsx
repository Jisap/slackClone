import { Doc, Id } from "../../convex/_generated/dataModel"


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
  return (
    <div>
      {JSON.stringify(body)}
    </div>
  )
}

