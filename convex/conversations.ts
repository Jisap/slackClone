import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


export const createOrGet = mutation({  // Mutación que maneja la creación o recuperación de una conversación entre dos miembros de un workspace
  args: {
    memberId: v.id("members"),                                     // ID del miembro con quien queremos chatear
    workspaceId: v.id("workspaces"),                               // ID del workspace donde estamos
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);                       // Comprueba que el usuario está autenticado.
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const currentMember = await ctx.db                             // Busca al miembro actualmente logueado usando un índice compuesto
      .query("members")
      .withIndex("by_workspace_id_user_id",
        (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId))
      .unique()

    const otherMember = await ctx.db.get(args.memberId);           // Obtiene el otro miembro directamente por su ID

    if (!currentMember || !otherMember) {
      throw new Error("Member not found");
    }

    const existingConversation = await ctx.db                      // Se  busca una conversación existente en ambas direcciones (ya que el orden de los miembros podría estar invertido).
      .query("conversations")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) => 
        q.or(
          // Caso 1: currentMember es memberOne y otherMember es memberTwo
          q.and(
            q.eq(q.field("memberOneId"), currentMember._id),
            q.eq(q.field("memberTwoId"), otherMember._id)
          ),
          // Caso 2: otherMember es memberOne y currentMember es memberTwo
          q.and(
            q.eq(q.field("memberOneId"), otherMember._id),
            q.eq(q.field("memberTwoId"), currentMember._id),
          )
        )
      )
      .unique();

    if (existingConversation) {                                        // Si encuentra una conversación existente, la retorna
        return existingConversation._id;
    }

      const conversationId = await ctx.db.insert("conversations", {    // Si no encuentra una conversación existente, se crea una nueva
        workspaceId: args.workspaceId,
        memberOneId: currentMember._id,
        memberTwoId: otherMember._id,
      });

      

      return conversationId;                                             // Se retorna la conversación recién creada
  }
})