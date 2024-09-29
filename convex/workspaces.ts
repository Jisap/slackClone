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
    id: v.id("workspaces")                                      // Recibe el id del workspace
  },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx)                     // Comprobamos si el usuario está autenticado
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
})