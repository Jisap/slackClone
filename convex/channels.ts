import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from '@convex-dev/auth/server';



export const get = query ({
  args: { 
    workspaceId: v.id("workspaces"),
  },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if(!userId) {
      return null;
    }
  
    const member = await ctx.db                                             // Vemos si el usuario logueado es miembro del workspace
      .query("members")                                                     // Consulta a la tabla de members
      .withIndex("by_workspace_id_user_id",                                 // con un índice de combinaciónes de workspaceId y userId
        (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId))  // donde el workspaceId=args.id y el userId=userId
      .unique()

    if(!member){
      return [];
    }

    const channels = await ctx.db                // Si el usuario es miembro, se devuelve el array de channels
      .query("channels")                         // Consulta a la tabla de channels
      .withIndex("by_worspace_id", (q) => 
        q.eq("workspaceId", args.workspaceId)    // donde el workspaceId=args.id
      )
      .collect();

    return channels;
  }
});

export const create = mutation({
  args: {
    name: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if(!userId) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique()

    if(!member || member.role !== "admin"){
      return new Error("Unauthorized");
    }

    const parsedName = args.name.replace(/\s+/g, "").toLowerCase();

    const channelId = await ctx.db
      .insert("channels", { 
        name: parsedName,
        workspaceId: args.workspaceId,
      })
      
    return channelId;
  }
})



