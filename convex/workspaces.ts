import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from '@convex-dev/auth/server';

const generateCode = () => {
  const code = Array.from(
    { length: 6 },
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");

  return code;
}

export const create = mutation({                                // Mutación para la creación de un workspace
  args:{
    name: v.string(),                                           // Recibe el nombre del workspace
  },
  handler: async(ctx, args) => {                                // El handler recibe el contexto y los argumentos   
    const userId = await getAuthUserId(ctx)                     // Comprobamos si el usuario está autenticado
    
    if(!userId) {
      throw new Error("Unauthorized");
    }

    const joinCode = generateCode();                            // Generamos un codigo aleatorio para el workspace

    const workspaceId = await ctx.db.insert("workspaces", {     // Insertamos el workspace en la tabla de workspaces
      name: args.name,
      userId,
      joinCode,
    });

    await ctx.db.insert("members", {                           // Insertamos el miembro (susuario logueado) del workspace en la tabla de members
      userId,
      workspaceId,
      role: "admin",
    });

    await ctx.db.insert("channels", {                          // Insertamos el canal de la tabla de channels
      name: "general",
      workspaceId,
    });

    return workspaceId;                                         // Devolvemos el id del workspace que nos da convex
  }
})

export const get = query({
  args: {},
  handler: async( ctx ) => {

    const userId = await getAuthUserId(ctx)                            // Comprobamos si el usuario está autenticado
    if(!userId) {
      return [];
    }
    const members = await ctx.db                                       // Devuelve un array de registros, donde cada registro  
      .query("members")                                                // indica un workspace al que pertenece el usuario.
      .withIndex("by_user_id", (q) => q.eq("userId", userId))   
      .collect();

    const workspaceIds = members.map((member) => member.workspaceId);  // Se utiliza este array para extraer todos los workspaceId asociados al usuario.

    const workspaces = []

    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);  // Para cada workspaceId del array, se busca el workspace correspondiente en la base de datos
      if(workspace){
        workspaces.push(workspace);                     //  Si el workspace existe, se añade al array workspaces.
      }
    }

    return workspaces                                   // Devuelve el array de workspaces que pertenecen al usuario.
  } 
});

export const getById = query({
  args: {
    id: v.id("workspaces")                                         // Recibe el id del workspace
  },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx)                        // Comprobamos si el usuario está autenticado
    if(!userId) {
      throw new Error("Unauthorized");
    }

    // Se busca si el usuario autenticado es miembro del workspace cuyo ID se ha proporcionado en los argumentos.
    const member = await ctx.db
      .query("members")                                             // Consulta a la tabla de members
      .withIndex("by_workspace_id_user_id",                         // con un índice de combinaciónes de workspaceId y userId
         (q) => q.eq("workspaceId", args.id).eq("userId", userId))  // donde el workspaceId=args.id y el userId=userId
      .unique()                                                      

    if (!member) {                                                  // Si no es miembro, el valor de member será null.
      return null
    }

    return ctx.db.get(args.id);                                     // Si el usuario es miembro, se devuelve el workspace correspondiente.
  }
});

export const getInfoById = query({                                 // Devuelve información básica dek workspace
  args: {
    id: v.id("workspaces")                                         // Recibe el id del workspace
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)                        // Comprobamos si el usuario está autenticado
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")                                            // Consulta a la tabla de members
      .withIndex("by_workspace_id_user_id",                        // con un índice de combinaciónes de workspaceId y userId
        (q) => q.eq("workspaceId", args.id).eq("userId", userId))  // donde el workspaceId=args.id y el userId=userId
      .unique()

    const workspace = await ctx.db.get(args.id);                   // Obtenemos el workspace

    return {
      name: workspace?.name,                                       // Devolvemos el nombre del workspace
      isMember: !!member,                                          // Devolvemos si el usuario es miembro del workspace
    }
  }
}) 


export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)                                // Comprobamos si el usuario está autenticado
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Se busca si el usuario autenticado es miembro del workspace cuyo ID se ha proporcionado en los argumentos.
    const member = await ctx.db
      .query("members")                                                    // Consulta a la tabla de members
      .withIndex("by_workspace_id_user_id",                                // con un índice de combinaciónes de workspaceId y userId
        (q) => q.eq("workspaceId", args.id).eq("userId", userId))          // donde el workspaceId=args.id y el userId=userId
      .unique();
      
    if(!member || member.role !== "admin") {                               // Si no es miembro, el valor de member será null.
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { name: args.name });                      // Si el usuario es miembro, se actualiza el nombre del workspace.
  
    return args.id;                                                        // Devuelve el id del workspace que se ha actualizado.
  }
});

export const remove= mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)                                 // Comprobamos si el usuario está autenticado
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Se busca si el usuario autenticado es miembro del workspace cuyo ID se ha proporcionado en los argumentos.
    const member = await ctx.db
      .query("members")                                                      // Consulta a la tabla de members
      .withIndex("by_workspace_id_user_id",                                  // con un índice de combinaciónes de workspaceId y userId
        (q) => q.eq("workspaceId", args.id).eq("userId", userId))            // donde el workspaceId=args.id y el userId=userId
      .unique();

    if (!member || member.role !== "admin") {                                // Si no es miembro, el valor de member será null.
      throw new Error("Unauthorized");
    }

    const [
      members, 
      channels, 
      conversations, 
      messages, 
      reactions
    ] = await Promise.all([     // Si es miembro se obtienen todos los miembros del workspace, los channels, conversaciones, mensajes y reacciones
      ctx.db
        .query("members")                                                    // Para ello se consulta a la tabla de members
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))   // con un índice de combinaciónes de workspaceId
        .collect(),                                                          // donde el workspaceId=args.id 
      ctx.db
        .query("channels")                                                    
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))   // idem
        .collect(),
      ctx.db
        .query("conversations")                                                    
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))   // idem
        .collect(),
      ctx.db
        .query("messages")                                                   // idem
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))    
        .collect(),
      ctx.db
        .query("reactions")                                                  // idem
        .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))    
        .collect()      
    ])                                                                       

    for (const member of members) {                                          // Se iteran todos los miembros del workspace
      await ctx.db.delete(member._id)                                        // y se borran sus registros de la tabla de members
    }

    for (const channel of channels) {                                         
      await ctx.db.delete(channel._id)                                        
    }

    for (const conversation of conversations) {                                          
      await ctx.db.delete(conversation._id)                                        
    }

    for (const message of messages) {                                          
      await ctx.db.delete(message._id)                                        
    }

    for (const reaction of reactions) {                                          
      await ctx.db.delete(reaction._id)                                        
    }

    await ctx.db.delete(args.id );                                           // y acontinuación se borra el workspace con el id proporcionado en los argumentos.

    return args.id;                                                          // Devuelve el id del workspace que se ha borrado.
  }
});

export const newJoinCode = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)                                 // Comprobamos si el usuario está autenticado
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db                                             // Se busca si el usuario autenticado es miembro del workspace cuyo ID se ha proporcionado en los argumentos.
      .query("members")                                                     // Consulta a la tabla de members
      .withIndex("by_workspace_id_user_id",                                 // con un índice de combinaciónes de workspaceId y userId
        (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId))  // donde el workspaceId=args.workspaceId y el userId=userId
      .unique();

    if (!member || member.role !== "admin") {                               // Si no es miembro, el valor de member será null.
      throw new Error("Unauthorized");
    }

    const joinCode = generateCode();                                        // Generamos un codigo aleatorio para el workspace
  
    await ctx.db.patch(args.workspaceId, { joinCode });                     // Si el usuario es miembro, se actualiza el codigo de unión del workspace.
  
    return args.workspaceId;                                                // Devuelve el id del workspace que se ha actualizado.
  }
});

export const join = mutation({
  args: {
    joinCode: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)                                // Comprobamos si el usuario está autenticado
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const workspace = await ctx.db.get(args.workspaceId)                   // Obtenemos el workspace
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if(workspace.joinCode !== args.joinCode.toLocaleLowerCase()) {         // Comprobamos que el codigo de unión sea correcto
      throw new Error("Invalid join code");
    }

    const existingMember = await ctx.db                                     // Se busca si el usuario autenticado es miembro del workspace cuyo ID se ha proporcionado en los argumentos.
      .query("members")                                                     // Consulta a la tabla de members
      .withIndex("by_workspace_id_user_id",                                 // con un índice de combinaciónes de workspaceId y userId
        (q) => q.eq("workspaceId", args.workspaceId).eq("userId", userId))  // donde el workspaceId=args.workspaceId y el userId=userId
      .unique();

    if (existingMember) {                                                   // Si no es miembro del workspace
      throw new Error("Already an active member on this workspace");        // Se lanza una excepción
    }

    await ctx.db.insert("members", {                                        // Se inserta el miembro en la tabla de members
      userId,
      workspaceId: workspace._id,
      role: "member",
    });

    return workspace._id;                                                   // Devuelve el id del workspace que se ha unido. 
  }
})
    