// lib/posts.ts — fetches posts from a headless CMS / REST API
interface Post {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  contentHtml: string;
}

export async function getAllPosts(): Promise<Post[]> {
  const res = await fetch("https://cms.example.com/api/posts", {
    next: { revalidate: 3600 }, // re-check for new posts every hour
  });
  return res.json();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await fetch(`https://cms.example.com/api/posts/${slug}`, {
    next: { revalidate: 3600 },
  });
  if (res.status === 404) return null;
  return res.json();
}
