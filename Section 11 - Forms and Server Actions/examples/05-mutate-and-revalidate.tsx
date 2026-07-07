// app/actions/notes.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const NoteSchema = z.object({ text: z.string().min(1).max(500) });

export async function createNote(prevState: unknown, formData: FormData) {
  const parsed = NoteSchema.safeParse({ text: formData.get("text") });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.text?.[0], success: false };
  }

  await db.note.create({ data: { text: parsed.data.text } }); // mutation
  revalidatePath("/notes");                                    // keep the list in sync

  return { error: null, success: true };
}

export async function deleteNote(id: string) {
  await db.note.delete({ where: { id } });
  revalidatePath("/notes");
}
