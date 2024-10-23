import { v } from "convex/values";
import { mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { timeStamp } from "console";

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => { // Busca un registro específico utilizando el ID proporcionado.
  return ctx.db.get(userId)
}

const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => { // Lo mismo para el member
  return ctx.db.get(memberId)
}

const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => { // Busca todas las reacciones a un mensaje, utilizado en la tabla reactions
  return ctx.db.query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))      // Para ello se utiliza la indexado de la tabla reactions por mensaje
    .collect()
}

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => { //  Trata de obtener todos los mensajes que forman parte de un hilo (thread) de conversación, 
  const messages = await ctx.db                                              //  Osea aquellos mensajes que tienen un mensaje "padre" específico, identificado por messageId. 
    .query("messages")
    .withIndex("by_parent_message_id", (q) => q.eq("parentMessageId", messageId))
    .collect()
  
  if(messages.length === 0){
    return {
      count: 0,
      image: undefined,
      timeStamp: 0,
    }
  }

  const lastMessages = messages[messages.length - 1];
  const lastMessageMember = await populateMember(ctx, lastMessages.memberId)

  if(!lastMessageMember){
    return{
      count: messageId.length,
      image: undefined,
      timeStamp: 0,
    }
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId)
  
  return {
    count: messageId.length,
    image: lastMessageUser?.image,
    timeStamp: lastMessages._creationTime
  }
}

const getMember = async( // Busca un registro específico utilizando el ID del workspace y el ID del usuario dentro de la tabla members
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