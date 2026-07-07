// app/posts/page.tsx
// Server Component — can be async, can query a database directly.

import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.post.findMany();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
