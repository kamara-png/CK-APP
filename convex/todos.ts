import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

async function requireUserId(ctx: any) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not signed in");
    return userId;
}

export const getTodos = query ({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        const todos = await ctx.db
            .query("todos")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect()

        // Resolve each attached image's storage id into an actual servable
        // URL here, so the client never has to think about Convex storage.
        return Promise.all(
            todos.map(async (todo) => ({
                ...todo,
                imageUrl: todo.imageId ? await ctx.storage.getUrl(todo.imageId) : null,
            }))
        );
    },
}); 

// Returns a short-lived URL the client can POST an image's bytes to
// directly. Used before addTodo/updateTodo when attaching a photo.
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        await requireUserId(ctx);
        return await ctx.storage.generateUploadUrl();
    },
});

export const addTodo = mutation({
    args: {
        text:v.string(),
        reminderAt: v.optional(v.number()),
        reminderSound: v.optional(v.union(
            v.literal("default"),
            v.literal("alarm"),
            v.literal("chime"),
            v.literal("silent")
        )),
        imageId: v.optional(v.id("_storage")),
    },
    handler: async(ctx,args) => {
        const userId = await requireUserId(ctx);
        const todoId =await ctx.db.insert("todos", {
            userId,
            text: args.text,
            iscompleted: false,
            reminderAt: args.reminderAt,
            reminderSound: args.reminderSound,
            imageId: args.imageId,
        })

        return todoId;
    }
       })

       export const setReminder = mutation({
        args: {
            id: v.id("todos"),
            reminderAt: v.optional(v.number()),
            reminderSound: v.optional(v.union(
                v.literal("default"),
                v.literal("alarm"),
                v.literal("chime"),
                v.literal("silent")
            )),
        },
        handler: async(ctx,args) => {
            const userId = await requireUserId(ctx);
            const todo = await ctx.db.get(args.id)
            if(!todo) throw new ConvexError("Todo not found")
            if(todo.userId !== userId) throw new ConvexError("Not authorized")

            await ctx.db.patch(args.id,{
                reminderAt: args.reminderAt,
                reminderSound: args.reminderSound,
            })
        }
    })

       export const toggleTodo = mutation({
        args:{id:v.id("todos")},
        handler: async(ctx,args) => {
            const userId = await requireUserId(ctx);
            const todo = await ctx.db.get(args.id)
            if(!todo) throw new ConvexError("Todo not found")
            if(todo.userId !== userId) throw new ConvexError("Not authorized")

            const nowCompleted = !todo.iscompleted
            await ctx.db.patch(args.id,{
                iscompleted: nowCompleted,
                completedAt: nowCompleted ? Date.now() : undefined,
            })
        }
    })

    export const deleteTodo = mutation({
        args: {id: v.id("todos") },
        handler: async(ctx,args) => {
            const userId = await requireUserId(ctx);
            const todo = await ctx.db.get(args.id)
            if(!todo) return;
            if(todo.userId !== userId) throw new ConvexError("Not authorized")
            if (todo.imageId) await ctx.storage.delete(todo.imageId);
            await ctx.db.delete(args.id);
        },
    });

    export const updateTodo = mutation({
        args: {
            id: v.id("todos"),
            text: v.string(),
        },
        handler: async(ctx,args) => {
            const userId = await requireUserId(ctx);
            const todo = await ctx.db.get(args.id)
            if(!todo) throw new ConvexError("Todo not found")
            if(todo.userId !== userId) throw new ConvexError("Not authorized")
            await ctx.db.patch(args.id,{
                text: args.text,
            });
        }
    });

    // Attaches, replaces, or clears (pass null) the photo on an existing todo.
    export const setTodoImage = mutation({
        args: {
            id: v.id("todos"),
            imageId: v.union(v.id("_storage"), v.null()),
        },
        handler: async (ctx, args) => {
            const userId = await requireUserId(ctx);
            const todo = await ctx.db.get(args.id);
            if (!todo) throw new ConvexError("Todo not found");
            if (todo.userId !== userId) throw new ConvexError("Not authorized");

            if (todo.imageId && todo.imageId !== args.imageId) {
                await ctx.storage.delete(todo.imageId);
            }
            await ctx.db.patch(args.id, { imageId: args.imageId ?? undefined });
        },
    });



    export const clearAllTodos = mutation({
        handler: async (ctx) => {
            const userId = await requireUserId(ctx);
            const todos = await ctx.db
                .query("todos")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();

            //Deletes all Todos
            for(const todo of todos) {
                if (todo.imageId) await ctx.storage.delete(todo.imageId);
                await ctx.db.delete(todo._id);
            }

            return {deletedCount: todos.length };
        },
    });

    // Bulk-restores todos from an exported backup file. Images aren't part
    // of the JSON export (they're binary), so restored todos start without
    // a photo even if the original had one.
    export const importTodos = mutation({
        args: {
            todos: v.array(v.object({
                text: v.string(),
                iscompleted: v.boolean(),
                completedAt: v.optional(v.number()),
                reminderAt: v.optional(v.number()),
                reminderSound: v.optional(v.union(
                    v.literal("default"),
                    v.literal("alarm"),
                    v.literal("chime"),
                    v.literal("silent")
                )),
            })),
        },
        handler: async (ctx, args) => {
            const userId = await requireUserId(ctx);
            let imported = 0;
            for (const todo of args.todos) {
                await ctx.db.insert("todos", { ...todo, userId });
                imported++;
            }
            return { imported };
        },
    });
