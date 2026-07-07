# Section 8: Assets, Images, and Metadata

> **Next.js Course** — Section 8 of 25 · Level: Intermediate

This section covers everything that lives in the `<head>` and in `public/`: optimized images, favicons, and the Metadata API that drives SEO and social previews.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Static Assets](#1-static-assets)
2. [Public Folder](#2-public-folder)
3. [Next Image Component](#3-next-image-component)
4. [Image Optimization](#4-image-optimization)
5. [Favicon and Icons](#5-favicon-and-icons)
6. [Metadata API](#6-metadata-api)
7. [Dynamic Metadata](#7-dynamic-metadata)
8. [SEO Basics in Next.js](#8-seo-basics-in-nextjs)
9. [Open Graph Metadata](#9-open-graph-metadata)

---

## 1. Static Assets

### The solution

Files can be imported directly into components (e.g. images used by `next/image`), giving you build-time width/height inference and cache-busting hashed filenames.

---

## 2. Public Folder

### The solution

Anything in `public/` is served from the root URL unchanged — `public/logo.png` is reachable at `/logo.png`. Use this for files that need a stable, predictable URL (robots.txt references, downloadable PDFs, etc.).

---

## 3. Next Image Component

See [`examples/01-next-image.tsx`](./examples/01-next-image.tsx).

### The problem

Unoptimized `<img>` tags serve full-size images regardless of viewport, causing slow loads and layout shift.

### The solution

`next/image` automatically resizes, serves modern formats (WebP/AVIF), and lazy-loads by default:

```tsx
import Image from "next/image";
import heroImage from "@/public/hero.jpg";

export default function HomePage() {
  return <Image src={heroImage} alt="Hero banner" priority />;
}
```

> 💡 **Tip:** Use `priority` only for above-the-fold images (like a hero banner) — it disables lazy loading so the image is fetched immediately.

---

## 4. Image Optimization

See [`examples/02-remote-image-config.ts`](./examples/02-remote-image-config.ts).

### The problem

`next/image` needs to know it's allowed to fetch and optimize images from a given remote domain, for security reasons.

### The solution

Whitelist remote hosts in `next.config.ts`:

```ts
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.example.com" }],
  },
};
```

> ⚠️ **Warning:** Using a remote image URL without adding its domain to `remotePatterns` throws a runtime error — this is intentional, to prevent arbitrary external image optimization.

---

## 5. Favicon and Icons

### The solution

Drop `favicon.ico`, `icon.png`, or `apple-icon.png` directly into `app/` — Next.js automatically wires up the correct `<link>` tags, no manual `<head>` editing required.

---

## 6. Metadata API

See [`examples/03-static-metadata.tsx`](./examples/03-static-metadata.tsx).

### The solution

Export a `metadata` object from any `page.tsx` or `layout.tsx` to control that route's `<head>` tags:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about our company and mission.",
};
```

---

## 7. Dynamic Metadata

See [`examples/04-dynamic-metadata.tsx`](./examples/04-dynamic-metadata.tsx).

### The problem

A static `metadata` object can't reflect per-post titles/descriptions on a dynamic route.

### The solution

Export an async `generateMetadata` function instead — it receives the same (async) `params` as the page:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post.title, description: post.excerpt };
}
```

---

## 8. SEO Basics in Next.js

### The solution

- Use one clear `<h1>` per page and semantic HTML (`<article>`, `<nav>`, `<section>`)
- Write accurate, unique `title`/`description` metadata per route
- Prefer Server Component rendering for content that should be crawlable — server-rendered HTML is immediately visible to crawlers

---

## 9. Open Graph Metadata

See [`examples/05-open-graph-image.tsx`](./examples/05-open-graph-image.tsx).

### The solution

Define `openGraph` fields in `metadata`/`generateMetadata` for rich link previews, and optionally generate a dynamic preview image with `ImageResponse`:

```tsx
import { ImageResponse } from "next/og";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return new ImageResponse(<div style={{ fontSize: 64 }}>{post.title}</div>, { width: 1200, height: 630 });
}
```

A file named `opengraph-image.tsx` next to a `page.tsx` is picked up automatically — no manual `<meta>` tag needed.

---

## ✅ Section Summary

- `public/` serves files at a stable, unchanged URL path
- `next/image` handles resizing, format conversion, and lazy loading automatically
- Remote image domains must be explicitly whitelisted in `next.config.ts`
- `metadata` (static) and `generateMetadata` (dynamic, async) control `<head>` tags per route
- `opengraph-image.tsx` generates dynamic social preview images with the `ImageResponse` API

---

## Review Questions

1. **Why does `next/image` require remote domains to be whitelisted in `next.config.ts`?**
   To prevent the app from being used to optimize and proxy arbitrary external images, which could be a resource-abuse or security vector — explicitly listing trusted hosts closes that gap.

2. **When would you use `generateMetadata` instead of a static `metadata` export?**
   When the title/description/OG data depends on route params or fetched content — like a blog post's title — since a static `metadata` object has no way to read the current route's dynamic data.

---

**Previous:** [Section 7 — Styling in Next.js](../Section%2007%20-%20Styling%20in%20Next.js/README.md)
**Next:** [Section 9 — Data Fetching](../Section%2009%20-%20Data%20Fetching/README.md)
