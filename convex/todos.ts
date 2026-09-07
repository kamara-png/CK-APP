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
        return todos;
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
    },
    handler: async(ctx,args) => {
        const userId = await requireUserId(ctx);
        const todoId =await ctx.db.insert("todos", {
            userId,
            text: args.text,
            iscompleted: false,
            reminderAt: args.reminderAt,
            reminderSound: args.reminderSound,
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



    export const clearAllTodos = mutation({
        handler: async (ctx) => {
            const userId = await requireUserId(ctx);
            const todos = await ctx.db
                .query("todos")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();

            //Deletes all Todos
            for(const todo of todos) {
                await ctx.db.delete(todo._id);
            }

            return {deletedCount: todos.length };
        },
    });
