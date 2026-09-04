import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
    todos:defineTable({
        text:v.string(),
        iscompleted:v.boolean(),
        reminderAt: v.optional(v.number()),
        reminderSound: v.optional(v.union(v.literal("default"), v.literal("silent"))),
}),
    notes: defineTable({
        title: v.string(),
        content: v.string(),
        updatedAt: v.number(),
    }).index("by_updatedAt", ["updatedAt"]),
})
