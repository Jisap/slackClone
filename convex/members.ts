import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";


const populateUser = (ctx: QueryCtx, id: Id<"users">) => {                  // Función para obtener un usuario de la base de datos
  return ctx.db.get(id);
}

export const current = query({                                              // Query para obtener el miembro actualmente logueado del workspace
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

export const get = query({                                                   // Query para obtener los miembros de un workspace
  args: { workspaceId: v.id("workspaces") },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if(!userId) {
      return [];
    }

    const member = await ctx.db
      .query("members")                                                      
      .withIndex("by_workspace_id_user_id",                                  
        (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId))   
      .unique()

    if (!member) {
      return [];
    }

    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const members = []

    for(const member of data){
      const user = await populateUser(ctx, member.userId);
      if(user){
        members.push({
          ...member,
          user,
        })
      }
    }

    return members;
  }
})