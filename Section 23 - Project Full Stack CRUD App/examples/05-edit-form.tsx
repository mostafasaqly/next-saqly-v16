// app/tasks/[id]/edit/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditTaskForm from "@/components/EditTaskForm";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await db.task.findUnique({ where: { id } });
  if (!task) notFound();

  return <EditTaskForm task={task} />;
}

// components/EditTaskForm.tsx
"use client";

import { useActionState } from "react";
import { updateTask } from "@/app/actions/tasks";

export default function EditTaskForm({ task }: { task: { id: string; title: string } }) {
  const updateWithId = updateTask.bind(null, task.id);
  const [state, formAction, isPending] = useActionState(updateWithId, { error: null });

  return (
    <form action={formAction}>
      <input name="title" defaultValue={task.title} disabled={isPending} />
      <button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Update Task"}</button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
