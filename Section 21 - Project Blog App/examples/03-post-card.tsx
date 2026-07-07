// components/PostCard.tsx
import Link from "next/link";
import Image from "next/image";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="post-card">
      <Image src={post.coverImage} alt={post.title} width={400} height={225} />
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </Link>
  );
}
