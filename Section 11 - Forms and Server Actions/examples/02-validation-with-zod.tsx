// app/actions/notes.ts
"use server";

import { z } from "zod";

const NoteSchema = z.object({
  text: z.string().min(1, "Note cannot be empty").max(500),
});

export async function createNote(prevState: unknown, formData: FormData) {
  const parsed = NoteSchema.safeParse({ text: formData.get("text") });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.text?.[0] };
  }

  await db.note.create({ data: { text: parsed.data.text } });
  return { success: true };
}
