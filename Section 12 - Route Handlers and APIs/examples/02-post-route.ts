// app/api/posts/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const post = await db.post.create({ data: { title: body.title } });
  return NextResponse.json(post, { status: 201 });
}
