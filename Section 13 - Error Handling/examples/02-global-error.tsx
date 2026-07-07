// app/global-error.tsx
// Catches errors that escape every nested error.tsx boundary — including
// errors thrown from the root layout itself. Must render its own <html>/<body>
// since it replaces the root layout when active.
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>A critical error occurred.</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
