// app/tasks/page.tsx
import { db } from "@/lib/db";
import Link from "next/link";
import DeleteTaskButton from "@/components/DeleteTaskButton";

export default async function TasksPage() {
  const tasks = await db.task.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <Link href="/tasks/new">+ Add Task</Link>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} {task.done && "✅"}
            <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
            <DeleteTaskButton id={task.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
