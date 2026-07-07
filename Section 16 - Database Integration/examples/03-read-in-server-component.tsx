// app/posts/page.tsx
import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.post.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          {post.title} — by {post.author.email}
        </li>
      ))}
    </ul>
  );
}
