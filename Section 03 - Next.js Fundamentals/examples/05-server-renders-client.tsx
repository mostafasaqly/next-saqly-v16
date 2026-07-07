// app/page.tsx
// A Server Component can render a Client Component directly.
// Only Counter's JS ships to the browser — this page itself does not.

import Counter from "./components/Counter";

export default function HomePage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Rendered on the server at request/build time.</p>
      <Counter />
    </main>
  );
}
