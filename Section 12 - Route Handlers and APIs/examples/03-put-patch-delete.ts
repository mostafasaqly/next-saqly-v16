// app/api/posts/[id]/route.ts
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const post = await db.post.update({ where: { id }, data: body }); // full replace
  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const post = await db.post.update({ where: { id }, data: body }); // partial update
  return NextResponse.json(post);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.post.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
