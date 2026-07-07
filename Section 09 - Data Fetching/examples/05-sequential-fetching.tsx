// app/users/[id]/posts/page.tsx
// Sequential fetching is correct (not a mistake) when the second request
// genuinely depends on the result of the first.

export default async function UserPostsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);               // must resolve first…
  const posts = await getPostsByAuthor(user.id); // …because this needs user.id

  return (
    <div>
      <h1>{user.name}'s Posts</h1>
      <ul>{posts.map((p: { id: string; title: string }) => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}
