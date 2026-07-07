// app/blog/[slug]/loading.tsx
export default function Loading() {
  return <p>Loading post…</p>;
}

// app/blog/[slug]/error.tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Failed to load this post: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
