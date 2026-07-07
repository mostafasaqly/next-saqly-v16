// app/not-found.tsx
// Renders automatically for unmatched routes, or when notFound() is called.

export default function NotFound() {
  return (
    <div>
      <h2>404 — Page Not Found</h2>
      <p>Could not find the requested resource.</p>
    </div>
  );
}
