import { v } from "convex/values";
import { mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";


const getMember = async(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) => {
  return ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();
}

export const create = mutation({
  args: {
    body: v.string(),                             // Obligatorio
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),              // Obligatorio
    channelId: v.optional(v.id("channels")),
    parentMessageId: v.optional(v.id("messages")),
    //TODO: add conversationId
  },
  handler: async( ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(!userId){
      throw new Error("Unauthorized");
    }

    const member = await getMember(ctx, args.workspaceId, userId);
    if(!member){
      throw new Error("Unauthorized");
    }

    //TODO: Handle conversationId

    const messageId = await ctx.db.insert("messages", {  // Inserta en la tabla messages
      memberId: member._id,                              // Se incorpora el miembro al mensaje desde el getter getMember
      body: args.body,                                   // Se incorpora el cuerpo del mensaje desde el formulario
      image: args.image,                                 // Se incorpora la imagen del mensaje desde el formulario
      channelId: args.channelId,                         // channelId, workspaceId y parentMessageId desde el hook useCreateMessage donde se use
      workspaceId: args.workspaceId,
      parentMessageId: args.parentMessageId,
      updatedAt: Date.now(),
    });

    return messageId;
  }
})