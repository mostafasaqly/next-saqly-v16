// app/components/NoteForm.tsx
"use client";

import { useActionState } from "react";
import { createNote } from "../actions/notes";

export default function NoteForm() {
  const [state, formAction, isPending] = useActionState(createNote, { error: null, success: false });

  return (
    <form action={formAction}>
      <input name="text" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Add Note"}
      </button>
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">Saved!</p>}
    </form>
  );
}
