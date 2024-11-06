import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
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

export const update = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx);                                // Comprueba que el usuario está autenticado.
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);                               // Obtiene el miembro directamente por su ID
    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db                                      // Comprueba que el miembro esté en el workspace
      .query("members")
      .withIndex("by_workspace_id_user_id",
        (q) => q.eq("workspaceId", member.workspaceId).eq("userId", userId))
      .unique()

    if(!currentMember || currentMember.role !== "admin"){
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { role: args.role });                       // Actualiza el role del memeber
    
    return args.id
  }
})

export const remove = mutation({
  args: {
    id: v.id("members"),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);                                // Comprueba que el usuario está autenticado.
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);                               // Obtiene el miembro directamente por su ID
    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db                                      // Comprueba que el miembro esté en el workspace
      .query("members")
      .withIndex("by_workspace_id_user_id",
        (q) => q.eq("workspaceId", member.workspaceId).eq("userId", userId))
      .unique()

    if (!currentMember ) {                                                  // Si el member no pertenece al workspace -> error
      throw new Error("Unauthorized");
    }

    if(member.role === "admin") {                                           // Si el member es admin -> error porque no puede ser removido
      throw new Error("Admin cannot be removed");
    }

    if(currentMember._id === args.id && currentMember.role === "admin"){    // Si el member del actual workspace es el member a eliminar y es ademas admin -> error
      throw new Error("Cannot remove self if self is an admin");
    }

    const  [messages, reactions, conversations] = await Promise.all([       // Se consultan las entradas de las tablas messages, reactions y conversations
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))     // que esten relacionadas con el member
        .collect(),
       ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", member._id))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) => q.or(
          q.eq(q.field("memberOneId"), member._id),
          q.eq(q.field("memberTwoId"), member._id),
        ))
        .collect()
    ])

    for(const message of messages){                                         // Cada uno de esos datos se eleminan con un bucle for
      await ctx.db.delete(message._id)
    }

    for(const reaction of reactions){
      await ctx.db.delete(reaction._id)
    }

    for(const conversation of conversations){
      await ctx.db.delete(conversation._id)
    }

    await ctx.db.delete(args.id,);                                          // finalmente se elimina el propio member utilizando su args.id.

    return args.id
  }
})