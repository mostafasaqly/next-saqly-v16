// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const postUrls = posts.map((post: { slug: string; updatedAt: string }) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [
    { url: "https://example.com", lastModified: new Date() },
    { url: "https://example.com/about", lastModified: new Date() },
    ...postUrls,
  ];
}
// Automatically generates /sitemap.xml
