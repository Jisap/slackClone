import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from '@convex-dev/auth/server';


export const create = mutation({                                // Mutación para la creación de un workspace
  args:{
    name: v.string(),                                           // Recibe el nombre del workspace
  },
  handler: async(ctx, args) => {                                // El handler recibe el contexto y los argumentos   
    const userId = await getAuthUserId(ctx)                     // Comprobamos si el usuario está autenticado
    
    if(!userId) {
      throw new Error("Unauthorized");
    }

    const joinCode = "123456"; // TODO: Crear un metodo 

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

    const userId = await getAuthUserId(ctx)                     // Comprobamos si el usuario está autenticado
    if(!userId) {
      return [];
    }
    const members = await ctx.db                                // Devuelve un array de registros, donde cada registro  
      .query("members")                                         // indica un workspace al que pertenece el usuario.
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

    return workspaces
  }
});

export const getById = query({
  args: {
    id: v.id("workspaces")
  },
  handler: async(ctx, args) => {
    const userId = await getAuthUserId(ctx)                     // Comprobamos si el usuario está autenticado
    if(!userId) {
      throw new Error("Unauthorized");
    }

    return ctx.db.get(args.id);                                // Obtenemos el workspace con ese id
  }
})