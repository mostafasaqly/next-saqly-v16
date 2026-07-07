# Section 19: SEO and Production Readiness

> **Next.js Course** — Section 19 of 25 · Level: Intermediate

Beyond per-page metadata (covered in Section 8), a production-ready site needs a sitemap, a robots policy, structured data for rich search results, and a final pre-launch checklist.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [SEO Overview](#1-seo-overview)
2. [Static Metadata](#2-static-metadata)
3. [Dynamic Metadata](#3-dynamic-metadata)
4. [Sitemap](#4-sitemap)
5. [Robots File](#5-robots-file)
6. [Open Graph Images](#6-open-graph-images)
7. [Structured Data Overview](#7-structured-data-overview)
8. [Accessibility Basics](#8-accessibility-basics)
9. [Production Checklist](#9-production-checklist)

---

## 1. SEO Overview

### The solution

Server-rendered HTML (the Next.js default), fast load times, and structured metadata are the three biggest levers for search visibility — all three come mostly for free with the App Router's defaults.

---

## 2. Static Metadata

### The solution

Covered in [Section 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#6-metadata-api) — export a `metadata` object for fixed titles/descriptions.

---

## 3. Dynamic Metadata

### The solution

Covered in [Section 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#7-dynamic-metadata) — use `generateMetadata` for per-route dynamic titles/descriptions.

---

## 4. Sitemap

See [`examples/01-sitemap.ts`](./examples/01-sitemap.ts).

### The problem

Search engines need a list of every crawlable URL, including dynamic ones (like every blog post) — maintaining this by hand doesn't scale.

### The solution

A `sitemap.ts` file generates `/sitemap.xml` dynamically:

```ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const postUrls = posts.map((post) => ({ url: `https://example.com/blog/${post.slug}`, lastModified: post.updatedAt }));
  return [{ url: "https://example.com", lastModified: new Date() }, ...postUrls];
}
```

---

## 5. Robots File

See [`examples/02-robots.ts`](./examples/02-robots.ts).

### The solution

A `robots.ts` file generates `/robots.txt`, controlling which crawlers can access which paths:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

---

## 6. Open Graph Images

### The solution

Covered in [Section 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#9-open-graph-metadata) — an `opengraph-image.tsx` file generates dynamic social preview images via the `ImageResponse` API.

---

## 7. Structured Data Overview

See [`examples/03-json-ld.tsx`](./examples/03-json-ld.tsx).

### The problem

Search engines can show rich results (star ratings, article previews, FAQ dropdowns) — but only if they can parse structured data describing the content type.

### The solution

Embed JSON-LD directly in the page:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  datePublished: post.publishedAt,
  author: { "@type": "Person", name: post.author.name },
};

<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

> ⚠️ **Warning:** `dangerouslySetInnerHTML` is normally a red flag for XSS, but here you're serializing a plain JS object you constructed yourself — as long as no unsanitized user input flows directly into it, this specific usage is safe and is the standard pattern for JSON-LD.

---

## 8. Accessibility Basics

### The solution

- Use semantic HTML (`<nav>`, `<main>`, `<article>`, proper heading order) instead of `<div>` soup
- Add meaningful `alt` text to every image
- Ensure all interactive elements are reachable and operable via keyboard

---

## 9. Production Checklist

### The solution

Before launch, verify:

- All required environment variables are set in the hosting platform (not just `.env.local`)
- Error monitoring is wired up (e.g. Sentry) to catch runtime failures
- Caching/revalidation strategy is deliberate per route, not accidental
- A production build (`next build`) runs cleanly with no warnings
- Core Web Vitals have been checked on a representative page, not just the homepage

---

## ✅ Section Summary

- `sitemap.ts` and `robots.ts` generate `/sitemap.xml` and `/robots.txt` dynamically
- JSON-LD structured data enables rich search results for supported content types
- Accessibility basics (semantic HTML, alt text, keyboard nav) are part of production readiness, not optional polish
- A pre-launch checklist should cover env vars, error monitoring, caching strategy, and a clean production build

---

## Review Questions

1. **Why generate `sitemap.xml` dynamically instead of writing a static file?**
   Because a site with dynamic content (like blog posts) has URLs that change over time — a `sitemap.ts` file can query the database and include every current post, whereas a static file would immediately go stale as content is added or removed.

2. **Why is `dangerouslySetInnerHTML` considered safe for JSON-LD structured data specifically?**
   Because the content being injected is a JSON object you constructed from known, controlled fields — the risk `dangerouslySetInnerHTML` normally guards against is injecting unsanitized *user-supplied* HTML/script, which isn't happening here as long as none of the JSON-LD fields come directly from unescaped user input.

---

**Previous:** [Section 18 — Performance Optimization](../Section%2018%20-%20Performance%20Optimization/README.md)
**Next:** [Section 20 — Deployment](../Section%2020%20-%20Deployment/README.md)
