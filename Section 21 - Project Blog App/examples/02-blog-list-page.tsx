// app/page.tsx
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
