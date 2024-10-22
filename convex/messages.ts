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
    body: v.string(),                                  // Obligatorio
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),                   // Obligatorio
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),     // Mensaje que origina una conversación
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

    let _conversationId = args.conversationId  

    // Only possible if we are replying to a message in a thread in 1:1 conversation
    if (!args.conversationId && !args.channelId && args.parentMessageId) {  // Si el mensaje que se está creando no pertenece a un canal o una conversación directamente, pero es una respuesta (parentMessageId), 
      const parentMessage = await ctx.db.get(args.parentMessageId)          // Buscamos en la tabla messages el message al que se esta respondiendo   
      if(!parentMessage){
        throw new Error("Parent message not found")
      }

      _conversationId = parentMessage.conversationId                        // Se reutiliza el conversationId del mensaje padre en el nuevo mensaje de respuesta. Esto asegura que los mensajes pertenezcan a la misma conversación.
    }

    const messageId = await ctx.db.insert("messages", {  // Inserta en la tabla messages
      memberId: member._id,                              // Se incorpora el miembro al mensaje desde el getter getMember
      body: args.body,                                   // Se incorpora el cuerpo del mensaje desde el formulario
      image: args.image,                                 // Se incorpora la imagen del mensaje desde el formulario
      channelId: args.channelId,                         // channelId, workspaceId y parentMessageId desde el hook useCreateMessage donde se use
      conversationId: _conversationId,                   
      workspaceId: args.workspaceId,
      parentMessageId: args.parentMessageId,
      updatedAt: Date.now(),
    });

    return messageId;
  }
})