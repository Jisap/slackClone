import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// .index("nombre_del_indice", ["campo1", "campo2"])

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

  conversations: defineTable({
    workspaceId: v.id("workspaces"),
    memberOneId: v.id("members"),                                 // member que inicia la conversación
    memberTwoId: v.id("members"), 
  })
    .index("by_workspace_id", ["workspaceId"]),
  
  messages: defineTable({ // 
    body: v.string(),                                             // Cuerpo del mensaje
    image: v.optional(v.id("_storage")),                          // Imagen asociada al mensaje
    memberId: v.id("members"),                                    // Id del miembro del workspace
    workspaceId: v.id("workspaces"),                              // Id del workspace al que pertenece el mensaje
    channelId: v.optional(v.id("channels")),                      // Id del channel al que pertenece el mensaje (mensajes públicos)
    parentMessageId: v.optional(v.id("messages")),                // Id del mensaje padre al que pertenece el mensaje
    conversationId: v.optional(v.id("conversations")),            // Id de la conversación al que pertenece el mensaje (mensajes privados)
    updatedAt: v.number(),
  })
    .index("by_workspace_id", ["workspaceId"])                    // Permite buscar todos los mensajes en un workspace.
    .index("by_member_id", ["memberId"])                          // Permite buscar todos los mensajes enviados por un miembro específico.
    .index("by_channel_id", ["channelId"])                        // Permite buscar mensajes dentro de un canal específico en un workspace
    .index("by_conversation_id", ["conversationId"])              // Permite buscar todos los mensajes de una conversación específica.
    .index("by_channel_id_parent_message_id_conversation", [
      "channelId",
      "parentMessageId",
      "conversationId", 
    ]),
    
  reactions: defineTable({
    workspaceId: v.id("workspaces"),
    messageId: v.id("messages"),
    memberId: v.id("members"),
    value: v.string()
  })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_message_id", ["messageId"])
    .index("by_member_id", ["memberId"])
})

export default schema;