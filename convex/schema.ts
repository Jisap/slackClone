import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";



const schema = defineSchema({
  ...authTables,
  workspaces: defineTable({                                      // Tabla para almacenar los workspaces
    name: v.string(),
    userId: v.id("users"),
    joinCode: v.string(),
  }),
  members: defineTable({                                          // Tabla para almacenar los roles de los miembros de un workspace
    userId: v.id("users"),                                        // Id del usuario que es miembro del workspace
    workspaceId: v.id("workspaces"),                              // Id del workspace del que son miembros los usuarios
    role: v.union(v.literal("admin"), v.literal("member")),       // Role de los usuarios en el workspace
  })
    .index("by_user_id", ["userId"])                              // Indexación por userId
    .index("by_workspace_id", ["workspaceId"])                    // Indexación por workspaceId
    .index("by_workspace_id_user_id", ["workspaceId", "userId"]), // Indexación por workspaceId y userId

  channels: defineTable({                                         // Tabla para almacenar los channels de un workspace
    name: v.string(),                                             // Nombre del channel
    workspaceId: v.id("workspaces"),
  })
    .index("by_worspace_id", ["workspaceId"]),
  
  messages: defineTable({
    body: v.string(),                                             // Cuerpo del mensaje
    image: v.optional(v.id("_storage")),                          // Imagen asociada al mensaje
    memberId: v.id("members"),                                    // Id del miembro del workspace
    workspaceId: v.id("workspaces"),                              // Id del workspace al que pertenece el mensaje
    channelId: v.optional(v.id("channels")),                      // Id del channel al que pertenece el mensaje
    parentMessageId: v.optional(v.id("messages")),                // Id del mensaje padre al que pertenece el mensaje
    //TODO: add conversationId
    updatedAt: v.number(),
  })
})

export default schema;