// app/posts/page.tsx
// Route-segment-level revalidation: refresh this page's cache at most every 60s.
export const revalidate = 60;

export default async function PostsPage() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();
  return <ul>{posts.map((p: { id: string; title: string }) => <li key={p.id}>{p.title}</li>)}</ul>;
}
