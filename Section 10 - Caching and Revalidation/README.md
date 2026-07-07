# Section 10: Caching and Revalidation

> **Next.js Course** — Section 10 of 25 · Level: Advanced

Caching is what makes Next.js fast by default, but it's also the topic that confuses developers most when moving from a plain SPA. This section maps out every cache layer and how to invalidate each one deliberately.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [What is Caching?](#1-what-is-caching)
2. [Next.js Caching Overview](#2-nextjs-caching-overview)
3. [Static Rendering](#3-static-rendering)
4. [Dynamic Rendering](#4-dynamic-rendering)
5. [Request Memoization](#5-request-memoization)
6. [Data Cache](#6-data-cache)
7. [Full Route Cache](#7-full-route-cache)
8. [Router Cache](#8-router-cache)
9. [Time-Based Revalidation](#9-time-based-revalidation)
10. [On-Demand Revalidation](#10-on-demand-revalidation)
11. [revalidatePath](#11-revalidatepath)
12. [revalidateTag](#12-revalidatetag)

---

## 1. What is Caching?

### The solution

Caching means storing a computed result (a rendered page, a fetch response) so a later request can reuse it instead of redoing the work — trading a bit of staleness for speed.

---

## 2. Next.js Caching Overview

### The solution

Next.js layers four distinct caches, each with its own scope and invalidation rules:

| Layer | Scope | What it stores |
|---|---|---|
| Request Memoization | Single render pass | Deduped `fetch()` results |
| Data Cache | Across requests & deployments | `fetch()` results (persistent) |
| Full Route Cache | Across requests | Rendered HTML/RSC payload of static routes |
| Router Cache | Client-side, per browser session | Visited route segments, for instant back/forward |

> ⚠️ **Warning:** These are four *different* caches. Clearing one (e.g. calling `revalidatePath`) doesn't automatically clear the others — understanding which layer you're targeting matters.

---

## 3. Static Rendering

See [`examples/01-static-vs-dynamic.tsx`](./examples/01-static-vs-dynamic.tsx).

### The solution

A route with no request-specific data (no `cookies()`, no `no-store` fetch) is rendered once at build time and served as static HTML from the Full Route Cache:

```tsx
export default function AboutPage() {
  return <h1>About Us</h1>;
}
```

---

## 4. Dynamic Rendering

### The solution

Reading request-specific data — cookies, headers, search params, or a `fetch` with `cache: "no-store"` — opts a route into rendering fresh on every request:

```tsx
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;
  return <p>Theme: {theme}</p>;
}
```

---

## 5. Request Memoization

### The solution

Within a **single render pass**, identical `fetch()` calls (same URL + options) are automatically deduplicated — calling the same data function from a layout and a page only hits the network once. This cache is cleared at the end of every request.

---

## 6. Data Cache

### The solution

Unlike Request Memoization, the Data Cache **persists across requests and deployments**. A `fetch()` result cached with `force-cache` or `next.revalidate` stays available until it's explicitly revalidated or its time window expires.

---

## 7. Full Route Cache

### The solution

For statically rendered routes, Next.js caches the entire rendered output (HTML + RSC payload), so a repeat visit doesn't re-render the component tree at all — it serves the cached result directly.

---

## 8. Router Cache

### The solution

On the client, Next.js keeps a cache of visited route segments in memory, so navigating back to a previously visited page is instant — no new request, no re-render.

---

## 9. Time-Based Revalidation

See [`examples/02-time-based-revalidation.tsx`](./examples/02-time-based-revalidation.tsx).

### The solution

Set a `revalidate` interval (in seconds) so cached data refreshes automatically after that window elapses:

```tsx
export const revalidate = 60; // route-segment level

// or per-fetch:
await fetch(url, { next: { revalidate: 60 } });
```

---

## 10. On-Demand Revalidation

### The problem

A 60-second cache window means content can be stale for up to a minute after an editor publishes a change — sometimes that's too slow.

### The solution

Trigger cache invalidation manually, in response to an event like a CMS webhook, using `revalidatePath` or `revalidateTag` (below) instead of waiting for the timer.

---

## 11. revalidatePath

See [`examples/03-revalidate-path.tsx`](./examples/03-revalidate-path.tsx).

### The solution

Invalidate the cache for one specific route, typically called right after a mutation:

```ts
"use server";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  await db.post.create({ data: { title: formData.get("title") as string } });
  revalidatePath("/posts");
}
```

---

## 12. revalidateTag

See [`examples/04-revalidate-tag.tsx`](./examples/04-revalidate-tag.tsx).

### The solution

Tag related `fetch()` calls, then invalidate all of them at once — across any route that uses that tag — which is more flexible than targeting one path at a time:

```ts
// tag the fetch
await fetch(url, { next: { tags: ["posts"] } });

// invalidate everywhere it's used
import { revalidateTag } from "next/cache";
revalidateTag("posts");
```

> 💡 **Tip:** Use `revalidatePath` when only one route needs refreshing; use `revalidateTag` when the same data appears on multiple routes (e.g. a post shown on both a list page and a detail page).

---

## ✅ Section Summary

- Next.js has four cache layers: Request Memoization, Data Cache, Full Route Cache, Router Cache
- Static rendering happens when no request-specific data is read; dynamic rendering kicks in otherwise
- `revalidate` (time-based) refreshes cached data after N seconds automatically
- `revalidatePath` and `revalidateTag` invalidate on demand — typically called inside a Server Action right after a mutation

---

## Review Questions

1. **What's the difference between Request Memoization and the Data Cache?**
   Request Memoization deduplicates identical `fetch()` calls only within a single render pass and clears at the end of that request; the Data Cache persists `fetch()` results across requests and even deployments until explicitly revalidated.

2. **When should you use `revalidateTag` instead of `revalidatePath`?**
   When the same underlying data appears on more than one route — tagging the fetch once and calling `revalidateTag` invalidates it everywhere, whereas `revalidatePath` would need to be called once per affected route.

3. **What causes a route to switch from static to dynamic rendering?**
   Reading any request-specific data — `cookies()`, `headers()`, `searchParams`, or a `fetch` call using `cache: "no-store"` — forces Next.js to render that route fresh on every request instead of serving cached static HTML.

---

**Previous:** [Section 9 — Data Fetching](../Section%2009%20-%20Data%20Fetching/README.md)
**Next:** [Section 11 — Forms and Server Actions](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md)
