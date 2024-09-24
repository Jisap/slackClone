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


    return workspaceId;                                         // Devolvemos el id del workspace que nos da convex
  }
})

export const get = query({
  args: {},
  handler: async( ctx ) => {
    return await ctx.db.query("workspaces").collect();  // Obtiene los datos de la tabla workspaces
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