// lib/data.ts
export async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { tags: ["posts"] },
  });
  return res.json();
}

// app/api/webhook/route.ts — e.g. called by a CMS when content changes
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  revalidateTag("posts"); // invalidates every fetch tagged "posts", across ANY route
  return NextResponse.json({ revalidated: true });
}
