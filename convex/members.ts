import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { UserButton } from '../src/features/auth/components/user-button';


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

export const getById = query({                                               // Query para obtener un miembro por su ID
  
  args: { id: v.id("members") },
  handler: async(ctx, args) => {
    
    const userId = await getAuthUserId(ctx);                                // Comprueba que el usuario está autenticado.
    if (!userId) {
      return null;
    }

    const member = await ctx.db.get(args.id);                               // Obtiene el miembro directamente por su ID
    if (!member) {
      return null;
    }

    const currentMember = await ctx.db                                      // Comprueba que el miembro esté en el workspace
      .query("members")
      .withIndex("by_workspace_id_user_id",
        (q) => q.eq("workspaceId", member.workspaceId).eq("userId", userId))
      .unique()

    if (!currentMember) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);                    // Obtiene el usuario asociado al miembro
    if (!user) {
      return null;
    }

    return {                                                                // Devuelve el miembro con su usuario asociado
      ...member,
      user,
    }
  }
})