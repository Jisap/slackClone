import { query } from "./_generated/server";
import { auth } from "./auth"
import { getAuthUserId } from "@convex-dev/auth/server"


// endpoint users.current
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx) // Obtenemos el id del usuario autenticado

    if (userId === null) {
      return null;
    }

    return await ctx.db.get(userId);        // Obtenemos el objeto del usuario en base a su id
  }
})