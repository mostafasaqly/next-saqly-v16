// app/actions/notes.ts
"use server";

export async function deleteNote(prevState: unknown, id: string) {
  try {
    await db.note.delete({ where: { id } });
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Could not delete note. Please try again." };
  }
}

// app/components/DeleteButton.tsx
"use client";

import { useActionState } from "react";
import { deleteNote } from "../actions/notes";

export default function DeleteButton({ id }: { id: string }) {
  const [state, formAction] = useActionState(deleteNote.bind(null, id), { success: false, error: null });

  return (
    <form action={formAction}>
      <button type="submit">Delete</button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
