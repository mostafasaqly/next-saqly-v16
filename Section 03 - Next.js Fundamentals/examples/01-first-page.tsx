// app/page.tsx
// A Server Component by default — no directive needed.
// This runs on the server; nothing here is shipped to the browser as JS.

export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Next.js</h1>
      <p>This page is rendered on the server.</p>
    </main>
  );
}
