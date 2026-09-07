import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
    ...authTables,

    todos:defineTable({
        userId: v.id("users"),
        text:v.string(),
        iscompleted:v.boolean(),
        completedAt: v.optional(v.number()),
        reminderAt: v.optional(v.number()),
        reminderSound: v.optional(v.union(
            v.literal("default"),
            v.literal("alarm"),
            v.literal("chime"),
            v.literal("silent")
        )),
}).index("by_user", ["userId"]),
    notes: defineTable({
        userId: v.id("users"),
        title: v.string(),
        content: v.string(),
        updatedAt: v.number(),
        color: v.optional(v.string()),
    }).index("by_user_updatedAt", ["userId", "updatedAt"]),

    habits: defineTable({
        userId: v.id("users"),
        name: v.string(),
        color: v.string(),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    habitCheckins: defineTable({
        habitId: v.id("habits"),
        // Local calendar date the check-in counts for, e.g. "2026-09-05".
        dateKey: v.string(),
    })
        .index("by_habit", ["habitId"])
        .index("by_habit_date", ["habitId", "dateKey"]),
})
