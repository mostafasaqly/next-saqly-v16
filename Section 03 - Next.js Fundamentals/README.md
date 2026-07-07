# Section 3: Next.js Fundamentals

> **Next.js Course** — Section 3 of 25 · Level: Beginner

This is the conceptual core of Next.js. Once you understand file-based routing, Server vs. Client Components, and the different rendering strategies, everything in later sections is just building on top of these ideas.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [What Makes Next.js Different?](#1-what-makes-nextjs-different)
2. [React Inside Next.js](#2-react-inside-nextjs)
3. [File-Based Routing](#3-file-based-routing)
4. [App Router Overview](#4-app-router-overview)
5. [Pages and Layouts](#5-pages-and-layouts)
6. [Server Components by Default](#6-server-components-by-default)
7. [Client Components](#7-client-components)
8. [Rendering Strategies Overview](#8-rendering-strategies-overview)

---

## 1. What Makes Next.js Different?

### The problem

Plain React (via Vite or Create React App) gives you components and a virtual DOM — but no routing, no server rendering, and no built-in optimization. You'd have to choose and wire up a router, a data-fetching pattern, an image pipeline, and a bundler yourself.

### The solution

Next.js is **convention-based**: folders and files under `app/` automatically become routes, every component is server-rendered unless you opt out, and images/fonts/scripts are optimized without extra configuration.

> 💡 **Tip:** Think of Next.js as "React, plus the decisions most teams end up making anyway, made for you."

---

## 2. React Inside Next.js

### The problem

If Next.js still renders React components, what's actually different about *where* and *when* they run?

### The solution

Next.js changes the **execution environment** of your components: some run on the server (during the request or at build time), some run in the browser. This is the single most important new idea to internalize — see Sections 6 and 7 for the precise rules.

---

## 3. File-Based Routing

See [`examples/03-file-based-routing.txt`](./examples/03-file-based-routing.txt).

### The problem

In plain React, you install a router library (like React Router) and manually declare every route and its component.

### The solution

In the App Router, folders *are* routes. Create `app/about/page.tsx` and `/about` exists — no router configuration, no route table to keep in sync.

```text
app/
├── page.tsx            →  /
├── about/
│   └── page.tsx         →  /about
└── blog/
    ├── page.tsx          →  /blog
    └── [slug]/
        └── page.tsx       →  /blog/:slug
```

> ⚠️ **Warning:** Only a file literally named `page.tsx` (or `.jsx`/`.js`) becomes a route. Other files in the same folder (components, helpers) are not exposed as URLs — this is intentional and lets you colocate related code.

---

## 4. App Router Overview

### The problem

Next.js has two routing systems historically: the older Pages Router (`pages/`) and the current App Router (`app/`). Tutorials from a few years ago may still reference the old one.

### The solution

**Always use the App Router** for new projects — it's the current, recommended system, built around React Server Components, nested layouts, and streaming. This entire course uses the App Router exclusively.

---

## 5. Pages and Layouts

See [`examples/01-first-page.tsx`](./examples/01-first-page.tsx) and [`examples/02-root-layout.tsx`](./examples/02-root-layout.tsx).

### The problem

Every route needs UI, and most routes share common chrome (headers, navigation) that shouldn't be duplicated in every file.

### The solution

`page.tsx` defines a route's unique content; `layout.tsx` wraps it (and any nested routes) with shared UI that persists across navigation without re-mounting.

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Next.js</h1>
      <p>This page is rendered on the server.</p>
    </main>
  );
}
```

```tsx
// app/layout.tsx — required at the root of every app
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

> 💡 **Tip:** The root `layout.tsx` is the *only* place allowed to render `<html>` and `<body>` — nested layouts just return their own JSX wrapping `children`.

---

## 6. Server Components by Default

### The problem

In plain React, every component ships its JavaScript to the browser, whether it needs interactivity or not — inflating bundle size for content that's just static text and markup.

### The solution

In the App Router, **every component is a Server Component unless you opt out**. Server Components render on the server, can access backend resources directly (databases, file system, secrets), and send zero JavaScript to the client for that component.

```tsx
// This is a Server Component — no directive, no client JS shipped
export default async function PostList() {
  const posts = await db.post.findMany();
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

> ⚠️ **Warning:** You cannot use `useState`, `useEffect`, or browser APIs inside a Server Component — it never runs in the browser, so there's no state to hold or DOM to attach listeners to.

---

## 7. Client Components

See [`examples/04-client-component.tsx`](./examples/04-client-component.tsx) and [`examples/05-server-renders-client.tsx`](./examples/05-server-renders-client.tsx).

### The problem

Some UI genuinely needs interactivity — a counter, a form with local validation, a dropdown toggle — which requires state and event handlers running in the browser.

### The solution

Add `"use client"` at the top of the file to opt that component (and everything it imports) into client-side rendering:

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>;
}
```

A Server Component can render a Client Component directly — only the Client Component's JS is sent to the browser:

```tsx
import Counter from "./components/Counter";

export default function HomePage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Counter />
    </main>
  );
}
```

> 💡 **Tip:** Push `"use client"` as far down the tree as possible. Marking a whole page as a Client Component just because one button needs `onClick` throws away the Server Component benefits for everything else on that page.

---

## 8. Rendering Strategies Overview

### The problem

Not every route has the same performance needs — a marketing page never changes, a dashboard needs fresh data every request, and a large page might benefit from showing partial content while the rest loads.

### The solution

Next.js automatically picks between:

- **Static rendering** — no dynamic data, rendered once at build time, served from cache
- **Dynamic rendering** — uses request-specific data (cookies, headers, search params), renders fresh per request
- **Streaming** — sends HTML in chunks as it becomes ready, so slow parts don't block fast ones

You'll see exactly how Next.js decides which strategy applies in Section 10 (Caching and Revalidation).

---

## ✅ Section Summary

- Next.js uses **file-based routing** — folders under `app/` become URL segments automatically
- The **App Router** (not the legacy Pages Router) is the current standard, built on Server Components
- `page.tsx` defines route content; `layout.tsx` provides shared, persistent UI
- **Server Components are the default** — zero client JS, direct backend access, no state/effects
- **Client Components** opt in via `"use client"` for interactivity and browser APIs
- Next.js automatically chooses static, dynamic, or streaming rendering per route

---

## Review Questions

1. **Why does only a file named `page.tsx` become a route, and not every file in that folder?**
   Because the App Router lets you colocate components, helpers, and other non-route files right next to the page that uses them — only files matching the special `page` convention are exposed as URLs.

2. **What happens if you add `useState` to a component without `"use client"`?**
   It errors at build/runtime — Server Components never execute in the browser, so there's no mechanism to hold React state or re-render in response to it. `"use client"` is required for any component using state, effects, or event handlers.

3. **Why should `"use client"` be placed as far down the component tree as possible?**
   Because everything a Client Component imports also becomes part of the client bundle. Marking a whole page as client just for one interactive button forces unrelated static content to ship as JS unnecessarily.

---

**Previous:** [Section 2 — Development Environment Setup](../Section%2002%20-%20Development%20Environment%20Setup/README.md)
**Next:** [Section 4 — App Router Basics](../Section%2004%20-%20App%20Router%20Basics/README.md)
