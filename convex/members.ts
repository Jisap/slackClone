import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";


export const current = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if(!userId) {
      return null;
    }

    // Se busca si el usuario autenticado es miembro del workspace cuyo ID se ha proporcionado en los argumentos.
    const member = await ctx.db 
      .query("members")                                                      // Consulta a la tabla de members
      .withIndex("by_workspace_id_user_id",                                  // con un índice de combinaciónes de workspaceId y userId
         (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId))  // donde el workspaceId=args.id y el userId=userId
      .unique()

      if(!member){
        return null;
      }

      return member;
  }
})