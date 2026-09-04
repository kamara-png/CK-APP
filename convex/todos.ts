import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTodos = query ({
    handler: async (ctx) => {
        const todos = await ctx.db.query("todos").order("desc").collect()
        return todos;
    },
}); 

export const addTodo = mutation({
    args: {
        text:v.string(),
        reminderAt: v.optional(v.number()),
        reminderSound: v.optional(v.union(v.literal("default"), v.literal("silent"))),
    },
    handler: async(ctx,args) => {
        const todoId =await ctx.db.insert("todos", {
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
            reminderSound: v.optional(v.union(v.literal("default"), v.literal("silent"))),
        },
        handler: async(ctx,args) => {
            const todo = await ctx.db.get(args.id)
            if(!todo) throw new ConvexError("Todo not found")

            await ctx.db.patch(args.id,{
                reminderAt: args.reminderAt,
                reminderSound: args.reminderSound,
            })
        }
    })

       export const toggleTodo = mutation({
        args:{id:v.id("todos")},
        handler: async(ctx,args) => {
            const todo = await ctx.db.get(args.id)
            if(!todo) throw new ConvexError("Todo not found")

            await ctx.db.patch(args.id,{
                iscompleted: !todo.iscompleted
            })
        }
    })

    export const deleteTodo = mutation({
        args: {id: v.id("todos") },
        handler: async(ctx,args) => {
            await ctx.db.delete(args.id);
        },
    });

    export const updateTodo = mutation({
        args: {
            id: v.id("todos"),
            text: v.string(),
        },
        handler: async(ctx,args) => {
            await ctx.db.patch(args.id,{
                text: args.text,
            });
        }
    });



    export const clearAllTodos = mutation({
        handler: async (ctx) => {
            const todos = await ctx.db.query("todos").collect();

            //Deletes all Todos
            for(const todo of todos) {
                await ctx.db.delete(todo._id);
            }

            return {deletedCount: todos.length };
        },
    });
    