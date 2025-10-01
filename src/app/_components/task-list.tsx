"use client";

import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useEffect, useRef, useCallback } from "react";
import { formatDate } from "~/lib/utils";

interface TaskListProps {
  enableInfiniteScroll?: boolean;
}

export default function TaskList({ enableInfiniteScroll = false }: TaskListProps) {
  const utils = api.useUtils();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Regular query with polling
  const regularQuery = api.task.list.useQuery(undefined, {
    enabled: !enableInfiniteScroll,
    refetchInterval: 1000, // Poll every 1 second
    refetchIntervalInBackground: true,
  });

  const infiniteQuery = api.task.listPaginated.useInfiniteQuery(
    { limit: 10 },
    {
      enabled: enableInfiniteScroll,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 1000, // Poll every 1 second
      refetchIntervalInBackground: true,
    }
  );

  const { data: tasks, isLoading } = enableInfiniteScroll
    ? { 
        data: infiniteQuery.data?.pages.flatMap((page) => page.items),
        isLoading: infiniteQuery.isLoading 
      }
    : regularQuery;

  // Auto-refresh on mount and when returning to the page
  useEffect(() => {
    void utils.task.list.invalidate();
  }, [utils.task.list]);

  // Handle task deletion with optimistic updates
  const deleteMutation = api.task.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.task.list.cancel();
      const previousTasks = utils.task.list.getData();
      
      utils.task.list.setData(undefined, (old) => 
        old?.filter((task) => task.id !== id) ?? []
      );
      
      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        utils.task.list.setData(undefined, context.previousTasks);
      }
      toast.error(`Failed to delete: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
    },
    onSettled: () => {
      void utils.task.list.invalidate();
      if (enableInfiniteScroll) {
        void utils.task.listPaginated.invalidate();
      }
    },
  });

  // Setup intersection observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target?.isIntersecting && infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
        void infiniteQuery.fetchNextPage();
      }
    },
    [infiniteQuery]
  );

  useEffect(() => {
    if (!enableInfiniteScroll || !observerTarget.current) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    });

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [handleObserver, enableInfiniteScroll]);

  // Rest of the component remains the same...
  if (isLoading) {
    return <LoadingState />;
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onDelete={() => deleteMutation.mutate({ id: task.id })}
          isDeleting={deleteMutation.isPending}
        />
      ))}
      
      {enableInfiniteScroll && (
        <>
          <div ref={observerTarget} className="h-10" />
          {infiniteQuery.isFetchingNextPage && (
            <div className="text-center py-4">
              <span className="text-gray-500">Loading more tasks...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Individual task card component
interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    createdAt: Date;
  };
  onDelete: () => void;
  isDeleting: boolean;
}

function TaskCard({ task, onDelete, isDeleting }: TaskCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow hover:shadow-lg transition-shadow bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">{task.title}</h2>
          {task.description && (
            <p className="text-gray-600 mt-2 line-clamp-2">{task.description}</p>
          )}
          <p className="text-sm text-gray-400 mt-3">
            Created: {formatDate(task.createdAt)}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Link
            href={`/tasks/${task.id}/edit`}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
            aria-label={`Delete task: ${task.title}`}
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">No tasks yet.</p>
      <Link 
        href="/tasks/new" 
        className="text-blue-500 hover:underline mt-2 inline-block"
      >
        Create your first task →
      </Link>
    </div>
  );
}
