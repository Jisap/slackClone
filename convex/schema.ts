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
    .index("by_workspace_id_user_id", ["workspaceId", "userId"])  // Indexación por workspaceId y userId
});

export default schema;