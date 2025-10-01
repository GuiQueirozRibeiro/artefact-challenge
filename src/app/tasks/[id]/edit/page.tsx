"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import TaskForm from "~/app/_components/task-form";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTaskPage({ params }: PageProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const { id } = use(params);

  const { data: task, isLoading, error } = api.task.getById.useQuery({ id });

  const updateMutation = api.task.update.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch
      await utils.task.list.invalidate();
      await utils.task.getById.invalidate({ id });
      
      toast.success("Task updated successfully");
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </main>
    );
  }

  if (error || !task) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Task not found</h2>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-blue-500 hover:underline"
          >
            ← Back to tasks
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Edit Task</h1>
      
      <TaskForm
        initialData={{
          title: task.title,
          description: task.description,
        }}
        onSubmit={async (data) => {
          await updateMutation.mutateAsync({ id, ...data });
        }}
        submitLabel="Update Task"
        isSubmitting={updateMutation.isPending}
      />
    </main>
  );
}