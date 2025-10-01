"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import TaskForm from "~/app/_components/task-form";

export default function CreateTaskPage() {
  const router = useRouter();
  const utils = api.useUtils();

  const createMutation = api.task.create.useMutation({
    onSuccess: async (newTask) => {
      // Manually update the cache to avoid a full refetch.
      utils.task.list.setData(undefined, (oldData) => {
        // Prepend the new task to the existing list for an instant UI update.
        return [newTask, ...(oldData ?? [])];
      });

      // Invalidate the paginated query so it's fresh on the next visit.
      await utils.task.listPaginated.invalidate();

      toast.success("Task created successfully");
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <main className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Create New Task</h1>
      
      <TaskForm
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data);
        }}
        submitLabel="Create Task"
        isSubmitting={createMutation.isPending}
      />
    </main>
  );
}