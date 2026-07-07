// lib/data.ts — shared fetch function used by multiple components
export async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

// app/layout.tsx and app/page.tsx can BOTH call getUser("42") during the
// same render pass — Next.js automatically dedupes identical fetch() calls
// (same URL + options) within a single request, so it only hits the network once.
