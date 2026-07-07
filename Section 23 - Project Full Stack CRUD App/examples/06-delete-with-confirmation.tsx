// components/DeleteTaskButton.tsx
"use client";

import { deleteTask } from "@/app/actions/tasks";

export default function DeleteTaskButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        if (confirm("Delete this task?")) {
          await deleteTask(id);
        }
      }}
    >
      <button type="submit">Delete</button>
    </form>
  );
}
