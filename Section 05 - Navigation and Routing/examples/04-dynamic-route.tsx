// app/blog/[slug]/page.tsx
// Next.js 16: `params` is async — you must await it.

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <h1>Post: {slug}</h1>;
}
