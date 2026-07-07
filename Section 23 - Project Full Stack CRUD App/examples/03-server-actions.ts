// app/actions/tasks.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const TaskSchema = z.object({ title: z.string().min(1, "Title is required").max(200) });

export async function createTask(prevState: unknown, formData: FormData) {
  const parsed = TaskSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] };
  }

  await db.task.create({ data: { title: parsed.data.title } });
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function updateTask(id: string, prevState: unknown, formData: FormData) {
  const parsed = TaskSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.title?.[0] };
  }

  await db.task.update({ where: { id }, data: { title: parsed.data.title } });
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function toggleTaskDone(id: string, done: boolean) {
  await db.task.update({ where: { id }, data: { done } });
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  await db.task.delete({ where: { id } });
  revalidatePath("/tasks");
}
