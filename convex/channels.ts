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
      .withIndex("by_workspace_id", (q) => 
        q.eq("workspaceId", args.workspaceId)    // donde el workspaceId=args.id
      )
      .collect();

    return channels;
  }
});

export const create = mutation({                                     // Mutación para crear un channel
  args: {
    name: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx);                         // El usuario tiene que estar logueado

    if(!userId) {
      return null;
    }

    const member = await ctx.db                                      // Vemos si el usuario logueado es miembro del workspace
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique()

    if(!member || member.role !== "admin"){                          // Si el usuario no es miembro del workspace o no es admin, se devuelve un error
      return new Error("Unauthorized");
    }

    const parsedName = args.name.replace(/\s+/g, "").toLowerCase();

    const channelId = await ctx.db                                    // Si el usurio es admin o es miembro se crea el channel
      .insert("channels", { 
        name: parsedName,
        workspaceId: args.workspaceId,
      })
      
    return channelId;
  }
});

export const update = mutation({                                     // Mutación para actualizar el nombre de un channel
  args: {
    id: v.id("channels"),
    name: v.string(),
  },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx);                         // El usuario tiene que estar logueado

    if (!userId) {
      return null;
    }

    const channel = await ctx.db.get(args.id);                      // Validamos que el canal exista
    if (!channel) {
      throw new Error("Channel not found");
    }

    const member = await ctx.db                                     // Vemos si el usuario logueado es miembro del workspace
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique()

    if (!member || member.role !== "admin") {                        // Si el usuario no es miembro del workspace o no es admin, se devuelve un error
      return new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {                                    // Si el usuario es admin o es miembro se actualiza el channel
      name: args.name
    })

    return args.id
  }
});

export const remove = mutation({                                     // Mutación para borrar un channel
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);                         // El usuario tiene que estar logueado

    if (!userId) {
      return null;
    }

    const channel = await ctx.db.get(args.id);                      // Validamos que el canal exista
    if (!channel) {
      throw new Error("Channel not found");
    }

    const member = await ctx.db                                     // Vemos si el usuario logueado es miembro del workspace
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique()

    if (!member || member.role !== "admin") {                        // Si el usuario no es miembro del workspace o no es admin, se devuelve un error
      return new Error("Unauthorized");
    }

    // Remove associated messages
    const [messages] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete( args.id )                                   // Si el usuario es admin o es miembro se borra el channel

    return args.id
  }
})

export const getById = query({
  args: {
    id: v.id("channels"),
  },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    if(!userId) {
      return null;
    }

    const channel = await ctx.db.get(args.id)
  
    if(!channel) {
      return null;
    }

    const member = await ctx.db                                             // Vemos si el usuario logueado es miembro de un canal
      .query("members")                                                     // Consulta a la tabla de members
      .withIndex("by_workspace_id_user_id", (q) =>                          // con un índice de combinaciónes de workspaceId y userId
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)       // donde el campo workspaceId es igual al workspaceId del canal al que se está accediendo.
    )                                                                       // y el userId coincide con el ID del usuario autenticado.
      .unique()

      if(!member){
        return null;
      }
      
    return channel;
  }
})



