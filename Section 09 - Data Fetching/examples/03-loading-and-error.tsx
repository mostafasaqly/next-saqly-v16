// app/posts/loading.tsx
export default function Loading() {
  return <p>Loading posts…</p>;
}

// app/posts/error.tsx
"use client"; // error.tsx must be a Client Component

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
