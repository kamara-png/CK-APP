import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getNotes = query({
    args: {},
    handler: async (ctx) => {
        // Most-recently-edited first, like Obsidian's default note list ordering.
        const notes = await ctx.db.query("notes").withIndex("by_updatedAt").order("desc").take(500);
        return notes;
    },
});

export const getNote = query({
    args: { id: v.id("notes") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const createNote = mutation({
    args: {
        title: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const noteId = await ctx.db.insert("notes", {
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
        const note = await ctx.db.get(args.id);
        if (!note) throw new ConvexError("Note not found");

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
        await ctx.db.delete(args.id);
    },
});

export const findNoteByTitle = query({
    args: { title: v.string() },
    handler: async (ctx, args) => {
        const target = args.title.trim().toLowerCase();
        if (!target) return null;
        // Personal-scale note counts, so a bounded scan is fine here.
        const notes = await ctx.db.query("notes").take(1000);
        return notes.find((n) => n.title.trim().toLowerCase() === target) ?? null;
    },
});

export const getBacklinks = query({
    args: { title: v.string() },
    handler: async (ctx, args) => {
        const target = args.title.trim().toLowerCase();
        if (!target) return [];
        const needle = `[[${target}]]`;
        const notes = await ctx.db.query("notes").take(1000);
        return notes
            .filter((n) => n.content.toLowerCase().includes(needle))
            .map((n) => ({ _id: n._id, title: n.title }));
    },
});
