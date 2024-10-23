import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { timeStamp } from "console";
import { paginationOptsValidator } from "convex/server";

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

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => { // Trata de obtener todos los mensajes que forman parte de un hilo (thread) de conversación,
                                                                             // Osea aquellos mensajes que tienen un mensaje "padre" específico, identificado por messageId.
  // 1. Obtiene todos los mensajes que pertenecen al hilo
  const messages = await ctx.db                                               
    .query("messages")
    .withIndex("by_parent_message_id", (q) => q.eq("parentMessageId", messageId))
    .collect()
  
  // 2. Si no hay mensajes en el hilo, retorna un objeto con valores por defecto
  if(messages.length === 0){
    return {
      count: 0,
      image: undefined,
      timeStamp: 0,
    }
  }

  // 3. Obtiene el último mensaje del hilo
  const lastMessages = messages[messages.length - 1];

  // 4. Member que escribió el último mensaje
  const lastMessageMember = await populateMember(ctx, lastMessages.memberId)

  // 5. Si no se encuentra el member, retorna un objeto con valores por defecto
  if(!lastMessageMember){
    return{
      count: 0,
      image: undefined,
      timeStamp: 0,
    }
  }

  // 6. Si se encontro el member se busca el usuario que lo escribio
  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId)
  
  // 7. Retorna la cantidad de mensajes, la imagen del usuario que escribió el último mensaje, y el timestamp del último mensaje
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

export const get = query({ // Endpoint para manejar la recuperación de mensajes en diferentes contextos (por canal, conversación o mensajes en un hilo)
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => { 
    const userId = await getAuthUserId(ctx);
    if(!userId){
      throw  new Error("Unauthorized")
    }

    let _conversationId = args.conversationId

    if(!args.conversationId && !args.channelId && args.parentMessageId){  // Si no tenemos el id de la conversation y tampoco el id del channel
      const parentMessage = await ctx.db.get(args.parentMessageId)        // se obtiene el ID de la conversación a partir del mensaje padre:

      if(!parentMessage){
        throw new Error("Parent message not found")
      }

      _conversationId = parentMessage.conversationId                      // Se asigna el id del parentMessage al de la conversation
    }

    const results = await ctx.db                                          
      .query("messages")                                                  // Se consulta a la tabla messages
      .withIndex("by_channel_id_parent_message_id_conversation", q =>     // con el índice definido en el schema
        q                                                                 // para filtrar mensajes según el channelId, parentMessageId, y conversationId.
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", _conversationId)
      )
        .order("desc")
        .paginate(args.paginationOpts)

    return results // Finalmente, se devuelven los resultados paginados de la consulta a la tabla "messages"
  }
})

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