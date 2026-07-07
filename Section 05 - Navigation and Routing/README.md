# Section 5: Navigation and Routing

> **Next.js Course** — Section 5 of 25 · Level: Intermediate

With file-based routing established, this section covers how users actually *move* between routes: the `Link` component, programmatic navigation, dynamic segments, search params, and redirects.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Link Component](#1-link-component)
2. [Programmatic Navigation](#2-programmatic-navigation)
3. [useRouter](#3-userouter)
4. [Active Links](#4-active-links)
5. [Dynamic Routes](#5-dynamic-routes)
6. [Route Parameters](#6-route-parameters)
7. [Search Params](#7-search-params)
8. [Optional Routes](#8-optional-routes)
9. [Catch-All Routes](#9-catch-all-routes)
10. [Redirects](#10-redirects)

---

## 1. Link Component

See [`examples/01-link-component.tsx`](./examples/01-link-component.tsx).

### The problem

A plain `<a>` tag causes a full page reload, discarding all client-side state and re-downloading the whole document.

### The solution

`next/link`'s `Link` component does client-side navigation and automatically prefetches linked routes when they enter the viewport, so clicks feel instant:

```tsx
import Link from "next/link";

export default function NavBar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>
  );
}
```

> ⚠️ **Warning:** Use `<Link>` for internal navigation. Plain `<a>` is still correct for external URLs.

---

## 2. Programmatic Navigation

### The problem

Sometimes navigation should happen as a *result* of an action (form submit, button click) rather than a user clicking a link directly.

### The solution

Trigger navigation from an event handler or effect using the router API described next.

---

## 3. useRouter

See [`examples/02-use-router.tsx`](./examples/02-use-router.tsx).

### The solution

`useRouter` (Client Component only) gives you `push`, `replace`, `back`, `forward`, and `refresh`:

```tsx
"use client";
import { useRouter } from "next/navigation";

export default function SaveButton() {
  const router = useRouter();

  async function handleSave() {
    await fetch("/api/save", { method: "POST" });
    router.push("/dashboard");
    router.refresh(); // re-fetches server data for the current route
  }

  return <button onClick={handleSave}>Save</button>;
}
```

> 💡 **Tip:** `router.refresh()` re-runs Server Components for the current route without a full page reload — useful right after a mutation.

---

## 4. Active Links

See [`examples/03-active-link.tsx`](./examples/03-active-link.tsx).

### The solution

`usePathname()` returns the current path so you can compare it against a link's `href` and apply active styling:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Link href={href} className={pathname === href ? "nav-link nav-link--active" : "nav-link"}>
      {children}
    </Link>
  );
}
```

---

## 5. Dynamic Routes

### The problem

You can't create a folder per blog post or per product — the set of URLs is data-driven, not fixed at build time.

### The solution

Bracketed folder names like `[slug]` capture that URL segment as a parameter:

```text
app/blog/[slug]/page.tsx   →  /blog/hello-world  (slug = "hello-world")
```

---

## 6. Route Parameters

See [`examples/04-dynamic-route.tsx`](./examples/04-dynamic-route.tsx).

### The problem

Older Next.js versions passed `params` as a plain object — current versions changed this.

### The solution

In current Next.js, **`params` is a Promise** and must be awaited before use:

```tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>Post: {slug}</h1>;
}
```

> ⚠️ **Warning:** Forgetting to `await params` (or `searchParams`) is the most common upgrade bug when moving from older Next.js code — TypeScript will flag it since the type is a `Promise`.

---

## 7. Search Params

See [`examples/05-search-params.tsx`](./examples/05-search-params.tsx) and [`examples/06-use-search-params-client.tsx`](./examples/06-use-search-params-client.tsx).

### The solution

On the server, `searchParams` is also an async prop:

```tsx
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page = "1" } = await searchParams;
  return <p>Category: {category ?? "all"} — Page: {page}</p>;
}
```

On the client, use the `useSearchParams` hook, typically paired with `useRouter`/`usePathname` to update the URL:

```tsx
"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function SearchBox() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("q", term); else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return <input defaultValue={searchParams.get("q") ?? ""} onChange={(e) => handleChange(e.target.value)} />;
}
```

> 💡 **Tip:** Storing filter/tab state in the URL (instead of `useState`) makes it shareable and bookmarkable for free.

---

## 8. Optional Routes

See [`examples/07-catch-all-routes.txt`](./examples/07-catch-all-routes.txt).

### The solution

Double-bracket syntax `[[...slug]]` makes a catch-all segment optional, so the parent route itself also matches:

```text
app/docs/[[...slug]]/page.tsx
  matches: /docs, /docs/a, /docs/a/b
```

---

## 9. Catch-All Routes

### The solution

Single-bracket `[...slug]` matches one or more nested segments (but not the bare parent route):

```text
app/docs/[...slug]/page.tsx
  matches: /docs/a, /docs/a/b   (NOT /docs itself)
  params.slug: ["a", "b"]
```

---

## 10. Redirects

See [`examples/08-redirects.tsx`](./examples/08-redirects.tsx).

### The solution

Use the `redirect()` function for conditional, code-driven redirects:

```tsx
import { redirect } from "next/navigation";

export default function OldPathPage() {
  redirect("/new-path");
}
```

Or configure static redirects in `next.config.ts` when the mapping is fixed and known ahead of time:

```ts
const nextConfig = {
  async redirects() {
    return [{ source: "/old-blog/:slug", destination: "/blog/:slug", permanent: true }];
  },
};
```

> ⚠️ **Warning:** `redirect()` throws internally to stop rendering — don't wrap it in a `try/catch` that swallows the throw, or the redirect won't happen.

---

## ✅ Section Summary

- Use `<Link>` for client-side navigation with automatic prefetching
- `useRouter` gives programmatic `push`/`replace`/`refresh`; `usePathname` detects the active route
- `params` and `searchParams` are **async** in current Next.js — always `await` them
- `[slug]` = dynamic segment, `[...slug]` = catch-all, `[[...slug]]` = optional catch-all
- Use `redirect()` for conditional redirects, `next.config` redirects for fixed mappings

---

## Review Questions

1. **Why must `params` be awaited in current Next.js instead of accessed directly?**
   Next.js changed route parameter APIs to be asynchronous so the framework can defer resolving them until actually needed, which enables more flexible rendering/caching behavior — TypeScript enforces this by typing `params` as a `Promise`.

2. **When would you store UI state in the URL via search params instead of `useState`?**
   When that state should be shareable or bookmarkable — like active filters, the selected tab, or a search query — since URL state survives page reloads and can be copy-pasted to someone else.

3. **What's the difference between `[...slug]` and `[[...slug]]`?**
   `[...slug]` is a required catch-all that needs at least one segment after the parent path; `[[...slug]]` is optional, so the parent path alone also matches, with `slug` being `undefined` in that case.

---

**Previous:** [Section 4 — App Router Basics](../Section%2004%20-%20App%20Router%20Basics/README.md)
**Next:** [Section 6 — Server Components and Client Components](../Section%2006%20-%20Server%20Components%20and%20Client%20Components/README.md)
