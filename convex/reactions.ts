import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


const getMember = async ( // Busca un registro específico utilizando el ID del workspace y el ID del usuario dentro de la tabla members
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

export const toggle = mutation({ // Este endpoint tiene la finalidad de alternar (agregar o eliminar) una reacción de un miembro a un mensaje específico.
  args: {
    messageId: v.id("messages"),
    value: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx); // Obtenemos el ID del usuario autenticado
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const message = await ctx.db.get(args.messageId); // Obtenemos el mensaje especificado en los argumentos
    if(!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId); // Obtenemos el miembro correspondiente al mensaje y al usuario autenticado
    if(!member) {
      throw new Error("Member not found");
    }

    const existingMessageReaction = await ctx.db        // Consulta la tabla reactions para verificar si ya existe una reacción
      .query("reactions")
      .filter((q) => 
        q.and(
          q.eq(q.field("messageId"), args.messageId),   // messageId igual al mensaje actual.
          q.eq(q.field("memberId"), member._id),        // memberId igual al ID del miembro actual.
          q.eq(q.field("value"), args.value),           // value igual al tipo de reacción (args.value) especificado.
        )
      )
      .first();

    if (existingMessageReaction) {                               // Si ya existe esta combinación (reacción duplicada), la eliminamos
      await ctx.db.delete(existingMessageReaction._id);
      return existingMessageReaction._id
      
    }else{
      const newReactionID = await ctx.db.insert("reactions", {   // Si la reacción especificada no existe, se inserta un nuevo registro en la tabla reactions
        value: args.value,
        memberId: member._id,
        messageId: message._id,
        workspaceId: message.workspaceId,
      });

      return newReactionID
    }
  }
})