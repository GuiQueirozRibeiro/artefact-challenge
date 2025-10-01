import { api, HydrateClient } from "~/trpc/server";
import TaskList from "./_components/task-list";
import Link from "next/link";

export default async function HomePage() {
  // Pre-fetch tasks on the server for SSR.
  await api.task.list.prefetch();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Task Manager</h1>
            <Link
              href="/tasks/new"
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
            >
              + Create Task
            </Link>
          </header>
          
          <TaskList enableInfiniteScroll={false} />
        </div>
      </main>
    </HydrateClient>
  );
}