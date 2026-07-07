# Section 21: Project — Blog App

> **Next.js Course** — Section 21 of 25 · Capstone Project 1 of 4

The first capstone project: a statically-generated blog with a homepage listing posts and individual post pages, pulling content from a headless CMS/REST API. This combines everything from Sections 3–10: routing, layouts, Server Components, metadata, and caching.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Creating the App Layout](#2-creating-the-app-layout)
3. [Creating Blog List Page](#3-creating-blog-list-page)
4. [Creating Blog Details Page](#4-creating-blog-details-page)
5. [Dynamic Routes for Posts](#5-dynamic-routes-for-posts)
6. [Loading and Error UI](#6-loading-and-error-ui)
7. [Adding Metadata](#7-adding-metadata)
8. [Fetching Posts from API](#8-fetching-posts-from-api)
9. [Creating Reusable Components](#9-creating-reusable-components)
10. [Final Refactoring](#10-final-refactoring)

---

## 1. Project Overview

### What we're building

A blog with:

- A homepage (`/`) listing all posts as cards
- A dynamic post page (`/blog/[slug]`) pre-rendered at build time
- Per-post SEO metadata and Open Graph previews
- Loading and error states for the post page

---

## 2. Creating the App Layout

See [`examples/01-app-layout.tsx`](./examples/01-app-layout.tsx).

### The solution

A shared header/footer via the root layout, plus a `title` template so every page's `<title>` automatically gets a consistent `" | My Blog"` suffix:

```tsx
export const metadata = {
  title: { default: "My Blog", template: "%s | My Blog" },
  description: "A statically-generated blog built with Next.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header><h1>My Blog</h1></header>
        <main>{children}</main>
        <footer>© {new Date().getFullYear()} My Blog</footer>
      </body>
    </html>
  );
}
```

---

## 3. Creating Blog List Page

See [`examples/02-blog-list-page.tsx`](./examples/02-blog-list-page.tsx) and [`examples/03-post-card.tsx`](./examples/03-post-card.tsx).

### The solution

A Server Component fetches all posts and renders a `PostCard` grid:

```tsx
export default async function HomePage() {
  const posts = await getAllPosts();
  return <div className="post-grid">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div>;
}
```

---

## 4. Creating Blog Details Page

See [`examples/04-blog-detail-page.tsx`](./examples/04-blog-detail-page.tsx).

### The solution

A dynamic `[slug]` route fetches and renders a single post, calling `notFound()` when the slug doesn't match anything.

---

## 5. Dynamic Routes for Posts

### The problem

Rendering every post on-demand at request time works, but re-does the same rendering work on every visit for content that rarely changes.

### The solution

`generateStaticParams` tells Next.js every possible `slug` value ahead of time, so all posts are pre-rendered at build time:

```tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

---

## 6. Loading and Error UI

See [`examples/05-loading-error.tsx`](./examples/05-loading-error.tsx).

### The solution

`loading.tsx` and `error.tsx` for the `blog/[slug]` segment, following the patterns from Sections 9 and 13.

---

## 7. Adding Metadata

### The solution

`generateMetadata` builds a per-post title, description, and Open Graph image — see the full code in [`examples/04-blog-detail-page.tsx`](./examples/04-blog-detail-page.tsx).

---

## 8. Fetching Posts from API

See [`examples/06-lib-posts.ts`](./examples/06-lib-posts.ts).

### The solution

A shared `lib/posts.ts` module wraps the CMS/API calls with a sensible revalidation window:

```ts
export async function getAllPosts(): Promise<Post[]> {
  const res = await fetch("https://cms.example.com/api/posts", { next: { revalidate: 3600 } });
  return res.json();
}
```

---

## 9. Creating Reusable Components

### The solution

`PostCard` (shown above) is used identically on the homepage and could be reused anywhere else a post preview is needed — extract shared UI once it's used in more than one place.

---

## 10. Final Refactoring

### The solution

Clean up by:

- Moving all fetch logic into `lib/posts.ts` (already shown) so pages stay thin
- Extracting shared TypeScript types (`Post`) into a single location imported by both the list and detail pages
- Confirming `generateStaticParams` covers every published post, and that new posts trigger a rebuild or on-demand revalidation via `revalidateTag`

---

## ✅ Section Summary

- Static generation (`generateStaticParams`) pre-renders every blog post at build time
- `generateMetadata` gives each post accurate, unique SEO and Open Graph data
- `loading.tsx`/`error.tsx` handle the async states of fetching a single post
- Shared fetch logic lives in one `lib/posts.ts` module, reused by both list and detail pages

---

## Review Questions

1. **Why use `generateStaticParams` for the blog post pages instead of rendering them dynamically on every request?**
   Because blog content changes infrequently compared to how often it's read — pre-rendering every post at build time serves cached static HTML instantly, while dynamic rendering would redo the same fetch and render work on every single visit for no benefit.

2. **What would happen if `generateMetadata` were omitted and only a static `metadata` object were used instead?**
   Every blog post would show the same generic title and description in search results and social previews, since a static `metadata` object has no access to the current post's data — defeating the purpose of per-post SEO.

---

**Previous:** [Section 20 — Deployment](../Section%2020%20-%20Deployment/README.md)
**Next:** [Section 22 — Project: Dashboard App](../Section%2022%20-%20Project%20Dashboard%20App/README.md)
