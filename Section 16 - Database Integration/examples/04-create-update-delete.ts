// app/actions/posts.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createPost(authorId: string, formData: FormData) {
  await db.post.create({
    data: { title: formData.get("title") as string, authorId },
  });
  revalidatePath("/posts");
}

export async function updatePost(id: string, formData: FormData) {
  await db.post.update({
    where: { id },
    data: { title: formData.get("title") as string },
  });
  revalidatePath("/posts");
}

export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });
  revalidatePath("/posts");
}
