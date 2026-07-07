// app/dashboard/page.tsx

// ❌ Sequential — each await blocks the next, total time = sum of both
async function SequentialSlow() {
  const user = await getUser();
  const posts = await getPosts(); // doesn't start until getUser() finishes
  return { user, posts };
}

// ✅ Parallel — both requests start immediately, total time = the slower of the two
async function ParallelFast() {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);
  return { user, posts };
}

export default async function DashboardPage() {
  const { user, posts } = await ParallelFast();
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>{posts.length} posts</p>
    </div>
  );
}
