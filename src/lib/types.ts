import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/api/root';

// Helper type to infer the output of tRPC procedures
type RouterOutputs = inferRouterOutputs<AppRouter>;

// This is our single source of truth for the Task type on the client-side
export type Task = RouterOutputs['task']['list'][number];