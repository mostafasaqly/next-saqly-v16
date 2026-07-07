// app/components/LikeButton.tsx
"use client";

import { useState } from "react";

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);

  return <button onClick={() => setLikes((n) => n + 1)}>❤️ {likes}</button>;
}
