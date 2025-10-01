import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
}

// Use Map for better performance
let taskStore: Map<string, Task> = new Map();
let taskIdCounter = 1;

const taskInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500).optional(),
});

export const taskRouter = createTRPCRouter({
  // Create a new task
  create: publicProcedure
    .input(taskInputSchema)
    .mutation(({ input }) => {
      const task: Task = {
        id: `task_${taskIdCounter++}_${Date.now()}`,
        title: input.title.trim(),
        description: input.description?.trim(),
        createdAt: new Date(),
      };
      
      taskStore.set(task.id, task);
      return task;
    }),

  // List all tasks sorted by newest first
  list: publicProcedure.query(() => {
    return Array.from(taskStore.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }),

  // List tasks with pagination
  listPaginated: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().min(0).default(0),
      })
    )
    .query(({ input }) => {
      const { limit, cursor } = input;
      const allTasks = Array.from(taskStore.values())
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      const paginatedTasks = allTasks.slice(cursor, cursor + limit);
      const hasMore = cursor + limit < allTasks.length;
      
      return {
        items: paginatedTasks,
        nextCursor: hasMore ? cursor + limit : undefined,
        totalCount: allTasks.length,
      };
    }),

  // Get single task by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const task = taskStore.get(input.id);
      
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task with ID ${input.id} not found`,
        });
      }
      
      return task;
    }),

  // Update existing task
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        ...taskInputSchema.shape,
      })
    )
    .mutation(({ input }) => {
      const existingTask = taskStore.get(input.id);
      
      if (!existingTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task with ID ${input.id} not found`,
        });
      }
      
      const updatedTask: Task = {
        ...existingTask,
        title: input.title.trim(),
        description: input.description?.trim(),
      };
      
      taskStore.set(input.id, updatedTask);
      return updatedTask;
    }),

  // Delete task by ID
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const task = taskStore.get(input.id);
      
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task with ID ${input.id} not found`,
        });
      }
      
      taskStore.delete(input.id);
      return { success: true, deletedTask: task };
    }),
});