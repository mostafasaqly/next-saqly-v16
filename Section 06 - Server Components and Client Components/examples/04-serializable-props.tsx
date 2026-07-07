// app/page.tsx (Server Component)
import LikeButton from "./components/LikeButton";

export default async function PostPage() {
  const likes = await getLikeCount(); // number — serializable, OK to pass

  return <LikeButton initialLikes={likes} />;
}

// ❌ This would fail: passing a function from Server to Client Component
// export default async function PostPage() {
//   function onLike() { console.log("liked"); } // functions aren't serializable
//   return <LikeButton onLike={onLike} />;
// }
