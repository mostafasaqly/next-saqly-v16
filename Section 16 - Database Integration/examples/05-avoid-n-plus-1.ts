// ❌ N+1 problem: one query for posts, then one extra query PER post for its author
const posts = await db.post.findMany();
for (const post of posts) {
  const author = await db.user.findUnique({ where: { id: post.authorId } }); // N extra queries!
}

// ✅ Fetch related data in a single query using `include`
const postsWithAuthors = await db.post.findMany({
  include: { author: true },
});
