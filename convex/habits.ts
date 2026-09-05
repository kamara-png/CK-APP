import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const CHECKIN_HISTORY_LIMIT = 400; // ~13 months of daily check-ins, plenty for a streak calc

export const getHabitsOverview = query({
    args: {},
    handler: async (ctx) => {
        const habits = await ctx.db.query("habits").order("desc").take(200);

        const overview = [];
        for (const habit of habits) {
            const checkins = await ctx.db
                .query("habitCheckins")
                .withIndex("by_habit", (q) => q.eq("habitId", habit._id))
                .order("desc")
                .take(CHECKIN_HISTORY_LIMIT);

            overview.push({
                habit,
                dateKeys: checkins.map((c) => c.dateKey),
            });
        }

        return overview;
    },
});

export const createHabit = mutation({
    args: {
        name: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        const habitId = await ctx.db.insert("habits", {
            name: args.name,
            color: args.color,
            createdAt: Date.now(),
        });
        return habitId;
    },
});

export const deleteHabit = mutation({
    args: { id: v.id("habits") },
    handler: async (ctx, args) => {
        const checkins = await ctx.db
            .query("habitCheckins")
            .withIndex("by_habit", (q) => q.eq("habitId", args.id))
            .collect();
        for (const checkin of checkins) {
            await ctx.db.delete(checkin._id);
        }
        await ctx.db.delete(args.id);
    },
});

// The client computes `dateKey` from its own local calendar date, so a
// check-in always counts for the day the person actually did it in their
// own timezone rather than the server's.
export const toggleCheckin = mutation({
    args: {
        habitId: v.id("habits"),
        dateKey: v.string(),
    },
    handler: async (ctx, args) => {
        const habit = await ctx.db.get(args.habitId);
        if (!habit) throw new ConvexError("Habit not found");

        const existing = await ctx.db
            .query("habitCheckins")
            .withIndex("by_habit_date", (q) =>
                q.eq("habitId", args.habitId).eq("dateKey", args.dateKey)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { checkedIn: false };
        }

        await ctx.db.insert("habitCheckins", {
            habitId: args.habitId,
            dateKey: args.dateKey,
        });
        return { checkedIn: true };
    },
});
