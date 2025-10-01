import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { taskRouter } from "~/server/api/routers/task";

export const appRouter = createTRPCRouter({
  task: taskRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);