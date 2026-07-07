# Section 9: Data Fetching

> **Next.js Course** — Section 9 of 25 · Level: Intermediate

Data fetching in the App Router happens directly inside `async` Server Components — no `useEffect`, no client-side loading library required for the initial render.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Data Fetching Overview](#1-data-fetching-overview)
2. [Fetching Data in Server Components](#2-fetching-data-in-server-components)
3. [Fetch API in Next.js](#3-fetch-api-in-nextjs)
4. [Loading States](#4-loading-states)
5. [Error States](#5-error-states)
6. [Parallel Data Fetching](#6-parallel-data-fetching)
7. [Sequential Data Fetching](#7-sequential-data-fetching)
8. [Reusing Data Fetching Logic](#8-reusing-data-fetching-logic)
9. [Fetching from External APIs](#9-fetching-from-external-apis)
10. [Data Fetching Best Practices](#10-data-fetching-best-practices)

---

## 1. Data Fetching Overview

### The problem

In plain React (SPA-style), data fetching means `useEffect` + `useState` + a loading flag — three moving parts for what should be simple.

### The solution

Server Components can be `async` functions. Fetch data with `await`, and the resolved value is just what you render — no effect, no client-side state:

```tsx
export default async function PostsPage() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

---

## 2. Fetching Data in Server Components

See [`examples/01-fetch-in-server-component.tsx`](./examples/01-fetch-in-server-component.tsx).

### The solution

Call `fetch()` or a database client directly in the component body — it runs on the server, so credentials and internal URLs are safe to use here.

---

## 3. Fetch API in Next.js

See [`examples/02-fetch-caching-options.tsx`](./examples/02-fetch-caching-options.tsx).

### The solution

Next.js extends the native `fetch()` with a second-argument options object controlling caching:

```ts
await fetch(url, { cache: "force-cache" });               // cache indefinitely
await fetch(url, { cache: "no-store" });                   // always fresh, opts into dynamic rendering
await fetch(url, { next: { revalidate: 60 } });             // cache, refresh every 60s
await fetch(url, { next: { tags: ["posts"] } });             // cache, invalidate on demand via revalidateTag
```

> 💡 **Tip:** `cache: "no-store"` on any fetch in a route makes that whole route render dynamically per-request — it's the fastest way to opt out of static rendering for one specific data source.

---

## 4. Loading States

See [`examples/03-loading-and-error.tsx`](./examples/03-loading-and-error.tsx).

### The solution

Pair a data-fetching `page.tsx` with a sibling `loading.tsx` — Next.js wraps the route in a Suspense boundary automatically:

```tsx
// app/posts/loading.tsx
export default function Loading() {
  return <p>Loading posts…</p>;
}
```

---

## 5. Error States

### The solution

A sibling `error.tsx` (must be a Client Component) catches fetch/render errors for that route segment:

```tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 6. Parallel Data Fetching

See [`examples/04-parallel-fetching.tsx`](./examples/04-parallel-fetching.tsx).

### The problem

Awaiting requests one after another when they don't depend on each other wastes time — this is called a request waterfall.

### The solution

Kick off independent requests together with `Promise.all`:

```tsx
async function ParallelFast() {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);
  return { user, posts };
}
```

> ⚠️ **Warning:** `await getUser(); await getPosts();` on separate lines is a waterfall even though it looks harmless — the second request doesn't start until the first fully resolves.

---

## 7. Sequential Data Fetching

See [`examples/05-sequential-fetching.tsx`](./examples/05-sequential-fetching.tsx).

### The solution

When a request genuinely needs the result of a previous one, sequential awaiting is correct, not a mistake:

```tsx
const user = await getUser(id);
const posts = await getPostsByAuthor(user.id); // needs user.id — must come after
```

---

## 8. Reusing Data Fetching Logic

See [`examples/06-shared-fetch-dedupe.tsx`](./examples/06-shared-fetch-dedupe.tsx).

### The solution

Extract fetch functions into a shared module. If multiple components call the same function with the same arguments during one render, Next.js automatically **deduplicates** identical `fetch()` calls — only one actual network request happens.

---

## 9. Fetching from External APIs

### The solution

Call third-party REST or GraphQL APIs directly from Server Components exactly like any other `fetch()` — API keys can be read from environment variables safely since this code never reaches the browser.

---

## 10. Data Fetching Best Practices

- Fetch data as close as possible to where it's used, rather than fetching everything in a top-level layout
- Use `Promise.all` whenever requests are independent
- Choose the caching strategy (`force-cache`, `no-store`, `revalidate`) deliberately per data source — don't default to `no-store` everywhere out of caution, or you lose the performance benefits of caching
- Avoid client-side fetching (`useEffect` + `fetch`) for data available at render time — it delays the user seeing content and adds a loading flicker Server Components don't need

---

## ✅ Section Summary

- `async` Server Components fetch data directly with `await` — no effects or client loading state needed
- `fetch()` caching is controlled via `cache` and `next.revalidate`/`next.tags` options
- `loading.tsx` and `error.tsx` give automatic Suspense and error-boundary behavior per route
- Use `Promise.all` for independent requests; sequential awaits only when one request depends on another
- Identical `fetch()` calls within a render are deduped automatically — safe to call a shared fetch function from multiple components

---

## Review Questions

1. **What's the difference between `cache: "no-store"` and `next: { revalidate: 60 }`?**
   `no-store` never caches — every request hits the network fresh, making the route dynamic. `revalidate: 60` caches the response but treats it as stale after 60 seconds, refetching in the background on the next request after that window.

2. **Why is `Promise.all` preferred over two separate `await` statements for independent requests?**
   Separate sequential awaits create a waterfall where the second request doesn't start until the first resolves, doubling the wait time; `Promise.all` starts both requests immediately so the total time is just the slower of the two.

3. **Why doesn't calling the same shared fetch function from two different components cause two network requests?**
   Next.js automatically deduplicates `fetch()` calls with identical URLs and options within a single render pass (Request Memoization), so multiple components can safely call the same data-fetching function without duplicating work.

---

**Previous:** [Section 8 — Assets, Images, and Metadata](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md)
**Next:** [Section 10 — Caching and Revalidation](../Section%2010%20-%20Caching%20and%20Revalidation/README.md)
