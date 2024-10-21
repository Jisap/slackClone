import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async(ctx) => {

  return await ctx.storage.generateUploadUrl(); // Este método genera una URL temporal a la que el cliente puede enviar un archivo.
})