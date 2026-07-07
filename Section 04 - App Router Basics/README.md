# Section 4: App Router Basics

> **Next.js Course** — Section 4 of 25 · Level: Beginner

This section covers the special files that give the App Router its behavior: `page`, `layout`, `template`, `loading`, `error`, and `not-found`. Together they let you build nested UI, route groups, and instant loading/error states purely through file conventions.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Understanding the `app` Folder](#1-understanding-the-app-folder)
2. [Creating Your First Page](#2-creating-your-first-page)
3. [Creating Nested Routes](#3-creating-nested-routes)
4. [Creating Shared Layouts](#4-creating-shared-layouts)
5. [Root Layout](#5-root-layout)
6. [Nested Layouts](#6-nested-layouts)
7. [Templates](#7-templates)
8. [Route Groups](#8-route-groups)
9. [Not Found Pages](#9-not-found-pages)
10. [Loading UI](#10-loading-ui)

---

## 1. Understanding the `app` Folder

### The problem

Without a shared convention, every team invents its own file layout for routes, loading states, and error boundaries — making projects hard to jump between.

### The solution

Next.js reserves specific filenames inside `app/` that each control one piece of route behavior:

| File | Purpose |
|---|---|
| `page.tsx` | The route's UI |
| `layout.tsx` | Shared UI wrapping this route and its children |
| `template.tsx` | Like layout, but re-mounts on navigation |
| `loading.tsx` | Instant loading UI (Suspense boundary) |
| `error.tsx` | Error boundary for this route segment |
| `not-found.tsx` | Custom 404 UI |

---

## 2. Creating Your First Page

### The solution

```tsx
// app/page.tsx
export default function HomePage() {
  return <h1>Homepage</h1>;
}
```

This alone makes `/` render `<h1>Homepage</h1>`.

---

## 3. Creating Nested Routes

### The solution

Nested folders create nested URL segments automatically:

```text
app/
└── blog/
    └── page.tsx    →  /blog
```

No router configuration needed — the folder structure *is* the route table.

---

## 4. Creating Shared Layouts

### The problem

A header and footer shouldn't be copy-pasted into every `page.tsx`.

### The solution

Place a `layout.tsx` in a shared parent folder — every route nested under it renders inside that layout automatically.

---

## 5. Root Layout

### The problem

Every HTML document needs exactly one `<html>` and `<body>` tag — but where should that live in a component tree with many nested layouts?

### The solution

The **root layout** at `app/layout.tsx` is mandatory and is the only layout allowed to render `<html>`/`<body>`:

```tsx
// app/layout.tsx
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

> ⚠️ **Warning:** Next.js will error if you try to render `<html>` or `<body>` in a nested (non-root) layout.

---

## 6. Nested Layouts

See [`examples/03-nested-layout.tsx`](./examples/03-nested-layout.tsx).

### The solution

Child layouts compose inside parent layouts, so different sections of your app can have distinct chrome:

```tsx
// app/dashboard/layout.tsx — nests inside the root layout
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <nav>Dashboard Sidebar</nav>
      <section>{children}</section>
    </div>
  );
}
```

Every route under `app/dashboard/` now renders inside this sidebar shell, in addition to the root layout.

---

## 7. Templates

See [`examples/05-template.tsx`](./examples/05-template.tsx).

### The problem

`layout.tsx` persists across navigation — state inside it isn't reset, and mount animations don't replay when moving between sibling routes.

### The solution

`template.tsx` behaves like a layout but **re-mounts on every navigation**, useful for enter/exit animations or resetting local state per page visit:

```tsx
// app/template.tsx
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
```

> 💡 **Tip:** Default to `layout.tsx`. Reach for `template.tsx` only when you specifically need the remount behavior.

---

## 8. Route Groups

See [`examples/04-route-groups.txt`](./examples/04-route-groups.txt).

### The problem

You want different layouts for, say, marketing pages vs. authenticated app pages — but folder names shouldn't leak into the URL.

### The solution

Wrap a folder name in parentheses, e.g. `(marketing)`, and Next.js excludes it from the URL while still using it to scope a layout:

```text
app/
├── (marketing)/
│   ├── layout.tsx
│   └── page.tsx         →  /
└── (app)/
    ├── layout.tsx
    └── dashboard/
        └── page.tsx       →  /dashboard
```

---

## 9. Not Found Pages

See [`examples/01-not-found.tsx`](./examples/01-not-found.tsx) and [`examples/06-not-found-trigger.tsx`](./examples/06-not-found-trigger.tsx).

### The problem

Unmatched URLs and missing resources (e.g. a deleted product) both need a friendly 404, not a raw error.

### The solution

Define `app/not-found.tsx` for the default 404 UI, and call `notFound()` manually when a resource lookup comes back empty:

```tsx
// app/not-found.tsx
export default function NotFound() {
  return <h2>404 — Page Not Found</h2>;
}
```

```tsx
// app/products/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return <h1>{product.name}</h1>;
}
```

---

## 10. Loading UI

See [`examples/02-loading.tsx`](./examples/02-loading.tsx).

### The problem

A slow data fetch leaves users staring at a blank screen with no feedback.

### The solution

Add `loading.tsx` next to a `page.tsx` and Next.js automatically wraps it in a `<Suspense>` boundary, showing the loading UI instantly while the real content streams in:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <p>Loading dashboard…</p>;
}
```

> 💡 **Tip:** `loading.tsx` applies per route segment — nested routes can each have their own, so only the slow part of the page shows a spinner.

---

## ✅ Section Summary

- Special filenames (`page`, `layout`, `template`, `loading`, `error`, `not-found`) define route behavior by convention
- Exactly one root `layout.tsx` is required and is the only place `<html>`/`<body>` can render
- Nested layouts compose; `template.tsx` re-mounts instead of persisting
- Route groups `(name)` organize files without adding a URL segment
- `loading.tsx` gives instant feedback via an automatic Suspense boundary; `not-found.tsx` + `notFound()` handle missing resources

---

## Review Questions

1. **Why is the root layout special compared to nested layouts?**
   It's the only layout allowed to render `<html>` and `<body>`, since a document can only have one of each — nested layouts just return ordinary JSX that composes inside it.

2. **When would you use `template.tsx` instead of `layout.tsx`?**
   When you need the wrapper to re-mount on every navigation — for exit/enter animations or to reset local component state each time the user visits, which `layout.tsx` won't do since it persists across navigations.

3. **What's the difference between the default 404 behavior and calling `notFound()` manually?**
   The default `not-found.tsx` renders automatically for URLs that don't match any route. Calling `notFound()` inside a page triggers that same UI on demand — useful when the *route* matches (e.g. `/products/123`) but the underlying data doesn't exist.

---

**Previous:** [Section 3 — Next.js Fundamentals](../Section%2003%20-%20Next.js%20Fundamentals/README.md)
**Next:** [Section 5 — Navigation and Routing](../Section%2005%20-%20Navigation%20and%20Routing/README.md)
