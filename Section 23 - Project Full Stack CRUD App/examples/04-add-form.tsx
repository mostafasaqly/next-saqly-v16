// app/tasks/new/page.tsx
"use client";

import { useActionState } from "react";
import { createTask } from "@/app/actions/tasks";

export default function NewTaskPage() {
  const [state, formAction, isPending] = useActionState(createTask, { error: null });

  return (
    <form action={formAction}>
      <input name="title" placeholder="Task title" disabled={isPending} />
      <button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Add Task"}</button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
