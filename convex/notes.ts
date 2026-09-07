import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

async function requireUserId(ctx: any) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not signed in");
    return userId;
}

export const getNotes = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        // Most-recently-edited first, like Obsidian's default note list ordering.
        const notes = await ctx.db
            .query("notes")
            .withIndex("by_user_updatedAt", (q) => q.eq("userId", userId))
            .order("desc")
            .take(500);
        return notes;
    },
});

export const getNote = query({
    args: { id: v.id("notes") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const note = await ctx.db.get(args.id);
        if (!note || note.userId !== userId) return null;
        return note;
    },
});

export const createNote = mutation({
    args: {
        title: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const noteId = await ctx.db.insert("notes", {
            userId,
            title: args.title,
            content: args.content,
            updatedAt: Date.now(),
        });
        return noteId;
    },
});

export const updateNote = mutation({
    args: {
        id: v.id("notes"),
        title: v.string(),
        content: v.string(),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const note = await ctx.db.get(args.id);
        if (!note) throw new ConvexError("Note not found");
        if (note.userId !== userId) throw new ConvexError("Not authorized");

        await ctx.db.patch(args.id, {
            title: args.title,
            content: args.content,
            color: args.color,
            updatedAt: Date.now(),
        });
    },
});

export const deleteNote = mutation({
    args: { id: v.id("notes") },
    handler: async (ctx, args) => {
        const userId = await requireUserId(ctx);
        const note = await ctx.db.get(args.id);
        if (!note) return;
        if (note.userId !== userId) throw new ConvexError("Not authorized");
        await ctx.db.delete(args.id);
    },
});

export const findNoteByTitle = query({
    args: { title: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        const target = args.title.trim().toLowerCase();
        if (!target) return null;
        // Personal-scale note counts, so a bounded scan is fine here.
        const notes = await ctx.db
            .query("notes")
            .withIndex("by_user_updatedAt", (q) => q.eq("userId", userId))
            .take(1000);
        return notes.find((n) => n.title.trim().toLowerCase() === target) ?? null;
    },
});

export const getBacklinks = query({
    args: { title: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        const target = args.title.trim().toLowerCase();
        if (!target) return [];
        const needle = `[[${target}]]`;
        const notes = await ctx.db
            .query("notes")
            .withIndex("by_user_updatedAt", (q) => q.eq("userId", userId))
            .take(1000);
        return notes
            .filter((n) => n.content.toLowerCase().includes(needle))
            .map((n) => ({ _id: n._id, title: n.title }));
    },
});
