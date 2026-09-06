import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
    todos:defineTable({
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
}),
    notes: defineTable({
        title: v.string(),
        content: v.string(),
        updatedAt: v.number(),
        color: v.optional(v.string()),
    }).index("by_updatedAt", ["updatedAt"]),

    habits: defineTable({
        name: v.string(),
        color: v.string(),
        createdAt: v.number(),
    }),

    habitCheckins: defineTable({
        habitId: v.id("habits"),
        // Local calendar date the check-in counts for, e.g. "2026-09-05".
        dateKey: v.string(),
    })
        .index("by_habit", ["habitId"])
        .index("by_habit_date", ["habitId", "dateKey"]),
})
