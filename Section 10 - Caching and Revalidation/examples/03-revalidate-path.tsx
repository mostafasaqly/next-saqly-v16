// app/actions/posts.ts
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  await db.post.create({ data: { title: formData.get("title") as string } });

  revalidatePath("/posts"); // clears the cache for /posts so it reflects the new post
}
