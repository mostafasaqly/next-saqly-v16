// app/actions/notes.ts
"use server";

export async function createNote(formData: FormData) {
  const text = formData.get("text") as string;
  await db.note.create({ data: { text } });
}

// app/page.tsx
import { createNote } from "./actions/notes";

export default function NotesPage() {
  return (
    <form action={createNote}>
      <input name="text" />
      <button type="submit">Add Note</button>
    </form>
  );
}
