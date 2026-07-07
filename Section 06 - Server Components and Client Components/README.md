# Section 6: Server Components and Client Components

> **Next.js Course** — Section 6 of 25 · Level: Intermediate

This is the single biggest mental shift when moving from plain React to Next.js. This section nails down exactly when a component runs on the server vs. the browser, and the rules for mixing the two.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [What are Server Components?](#1-what-are-server-components)
2. [What are Client Components?](#2-what-are-client-components)
3. [When to Use Server Components](#3-when-to-use-server-components)
4. [When to Use Client Components](#4-when-to-use-client-components)
5. [The "use client" Directive](#5-the-use-client-directive)
6. [Passing Props Between Server and Client Components](#6-passing-props-between-server-and-client-components)
7. [Browser APIs in Client Components](#7-browser-apis-in-client-components)
8. [Common Server and Client Component Mistakes](#8-common-server-and-client-component-mistakes)

---

## 1. What are Server Components?

See [`examples/01-server-component.tsx`](./examples/01-server-component.tsx).

### The solution

Server Components render on the server — during the request or at build time — and never ship their JavaScript to the browser. They can be `async` and query a database or call a secret-holding API directly:

```tsx
import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.post.findMany();
  return <ul>{posts.map((post) => <li key={post.id}>{post.title}</li>)}</ul>;
}
```

---

## 2. What are Client Components?

See [`examples/02-client-component.tsx`](./examples/02-client-component.tsx).

### The solution

Client Components hydrate and run in the browser, so they can hold state, respond to events, and use effects:

```tsx
"use client";
import { useState } from "react";

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  return <button onClick={() => setLikes((n) => n + 1)}>❤️ {likes}</button>;
}
```

---

## 3. When to Use Server Components

### The solution

Default to Server Components for:

- Fetching data (no client-side loading spinner needed for the initial render)
- Accessing secrets, environment variables, or a database directly
- Anything that doesn't need interactivity — reducing what ships to the browser

---

## 4. When to Use Client Components

### The solution

Reach for a Client Component when you need:

- Local state (`useState`, `useReducer`)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser-only APIs (`window`, `localStorage`)
- Custom hooks that depend on any of the above

---

## 5. The "use client" Directive

### The solution

Place `"use client"` as the very first line of a file to mark that module — and everything it imports — as part of the client bundle:

```tsx
"use client";

export default function Toggle() {
  // ...
}
```

> ⚠️ **Warning:** `"use client"` marks a *boundary*, not just one component. Every component that file imports also becomes part of the client bundle, even if those imports don't use state themselves.

---

## 6. Passing Props Between Server and Client Components

See [`examples/03-passing-server-children-to-client.tsx`](./examples/03-passing-server-children-to-client.tsx) and [`examples/04-serializable-props.tsx`](./examples/04-serializable-props.tsx).

### The problem

You often need interactivity (a modal, a toggle) to wrap content that itself needs server-side data fetching.

### The solution

A Server Component can render a Client Component and pass it **serializable** props (strings, numbers, plain objects, arrays — not functions or class instances):

```tsx
// Server Component
import LikeButton from "./components/LikeButton";

export default async function PostPage() {
  const likes = await getLikeCount();
  return <LikeButton initialLikes={likes} />;
}
```

A Client Component can also accept a Server Component as `children` — the server-rendered output is passed down as already-rendered content:

```tsx
// Client Component
export default function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>{open && <div className="modal">{children}</div>}</>;
}

// Server Component using it
<Modal>
  <ServerRenderedStats />
</Modal>
```

---

## 7. Browser APIs in Client Components

### The solution

`window`, `document`, `localStorage`, and DOM event listeners only exist in the browser — they're safe to use only inside Client Components, typically inside `useEffect` to avoid running during any server-side render pass:

```tsx
"use client";
import { useEffect } from "react";

useEffect(() => {
  const stored = localStorage.getItem("theme");
  // ...
}, []);
```

---

## 8. Common Server and Client Component Mistakes

### The solution — avoid these

| Mistake | Why it breaks |
|---|---|
| Importing server-only code (DB clients, secrets) into a `"use client"` file | That code would be bundled and potentially exposed to the browser |
| Marking an entire page `"use client"` for one interactive element | Unnecessarily ships JS for content that could have stayed server-rendered |
| Passing a function as a prop from Server to Client Component | Functions aren't serializable across the server/client boundary |
| Using `useState`/`useEffect` in a file without `"use client"` | Server Components never run in the browser — there's no lifecycle to hook into |

> 💡 **Tip:** When in doubt, start every new component as a Server Component and only add `"use client"` once you hit a concrete need for state, effects, or events.

---

## ✅ Section Summary

- Server Components run on the server, ship no JS, and can access backend resources directly
- Client Components run in the browser and are required for state, effects, events, and browser APIs
- `"use client"` marks a whole module (and its imports) as client-side
- Props from Server → Client Components must be serializable; Server Components can still be passed as `children`
- Default to Server Components; opt into Client Components only where interactivity is truly needed

---

## Review Questions

1. **Why can't you pass a function as a prop from a Server Component to a Client Component?**
   Server-to-client props are serialized and sent across the network boundary as part of the React payload; functions have no serializable representation, so only plain data (strings, numbers, objects, arrays) can cross that boundary.

2. **Why is it still fine to render a Server Component as `children` of a Client Component?**
   Because the Server Component is already rendered to its output on the server before being passed down — the Client Component just receives the resulting markup as `children`, not the component itself needing to run in the browser.

3. **What's wrong with adding `"use client"` to the top of `app/page.tsx` just because one button needs `onClick`?**
   It forces the entire page and everything it imports into the client bundle, discarding the zero-JS benefit of Server Components for all the surrounding static content — the fix is to extract just the interactive piece into its own small Client Component.

---

**Previous:** [Section 5 — Navigation and Routing](../Section%2005%20-%20Navigation%20and%20Routing/README.md)
**Next:** [Section 7 — Styling in Next.js](../Section%2007%20-%20Styling%20in%20Next.js/README.md)
