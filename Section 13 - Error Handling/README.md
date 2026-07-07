# Section 13: Error Handling

> **Next.js Course** — Section 13 of 25 · Level: Intermediate

Next.js layers React error boundaries with special files so every level of the app — a route segment, the whole layout tree, an API call, a form submission — has a defined way to fail gracefully.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Error Handling Overview](#1-error-handling-overview)
2. [error.tsx](#2-errortsx)
3. [Route-Level Errors](#3-route-level-errors)
4. [Global Errors](#4-global-errors)
5. [notFound()](#5-notfound)
6. [Custom 404 Page](#6-custom-404-page)
7. [Handling API Errors](#7-handling-api-errors)
8. [Handling Server Action Errors](#8-handling-server-action-errors)
9. [Error Boundaries Best Practices](#9-error-boundaries-best-practices)

---

## 1. Error Handling Overview

### The solution

Next.js uses React error boundaries under the hood, exposed through special files: `error.tsx` per route segment, `global-error.tsx` at the root, plus `notFound()`/`not-found.tsx` for missing-resource cases.

---

## 2. error.tsx

See [`examples/01-error-boundary.tsx`](./examples/01-error-boundary.tsx).

### The solution

A sibling `error.tsx` automatically wraps its route segment in an error boundary. It **must** be a Client Component (error boundaries rely on React lifecycle methods only available client-side):

```tsx
"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong on the dashboard.</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

`reset()` re-renders the segment, giving the user a retry without a full page reload.

---

## 3. Route-Level Errors

### The solution

Each nested segment can define its own `error.tsx` — an error deep in a dashboard sub-page is caught locally, without tearing down the whole dashboard shell around it.

---

## 4. Global Errors

See [`examples/02-global-error.tsx`](./examples/02-global-error.tsx).

### The problem

An error thrown from the root layout itself has no parent boundary to catch it.

### The solution

`app/global-error.tsx` catches errors that escape every nested boundary. Because it replaces the root layout when active, it must render its own `<html>`/`<body>`:

```tsx
"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <h2>A critical error occurred.</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
```

---

## 5. notFound()

See [`examples/03-not-found-custom.tsx`](./examples/03-not-found-custom.tsx).

### The solution

Call `notFound()` from `next/navigation` when a route matches but the underlying resource doesn't exist:

```tsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return <h1>{product.name}</h1>;
}
```

---

## 6. Custom 404 Page

### The solution

Define `app/not-found.tsx` to replace the default Next.js 404 UI, used both for unmatched URLs and for manual `notFound()` calls.

---

## 7. Handling API Errors

### The solution

Return meaningful status codes and error payloads from Route Handlers — see [Section 12](../Section%2012%20-%20Route%20Handlers%20and%20APIs/README.md#9-handling-errors) for the pattern.

---

## 8. Handling Server Action Errors

See [`examples/04-server-action-error-state.tsx`](./examples/04-server-action-error-state.tsx).

### The solution

Catch failures inside the action and return them as part of the action's state, then surface that state in the form UI via `useActionState`:

```ts
"use server";
export async function deleteNote(prevState: unknown, id: string) {
  try {
    await db.note.delete({ where: { id } });
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Could not delete note. Please try again." };
  }
}
```

---

## 9. Error Boundaries Best Practices

- Keep `error.tsx` close to where failures actually occur — a dashboard sub-route's error shouldn't take down the entire dashboard
- Always provide a retry path (`reset()`), not just a dead-end error message
- Never let a Server Action throw an unhandled error to the client — catch it and return a structured error state
- Reserve `global-error.tsx` as a last-resort catch-all; most errors should be caught by a more local `error.tsx`

> ⚠️ **Warning:** `error.tsx` does **not** catch errors thrown in Server Actions or Route Handlers called from that page — those need their own try/catch, since they execute outside the React render tree that the error boundary wraps.

---

## ✅ Section Summary

- `error.tsx` wraps a route segment in an error boundary; must be a Client Component
- `global-error.tsx` is the last-resort boundary and must render its own `<html>`/`<body>`
- `notFound()` + `not-found.tsx` handle "route matches, resource doesn't exist" cases
- Server Action and Route Handler errors need explicit try/catch — error boundaries don't catch them automatically
- Keep error boundaries granular and always offer a retry

---

## Review Questions

1. **Why must `error.tsx` be a Client Component?**
   Error boundaries rely on React lifecycle methods (`getDerivedStateFromError`/`componentDidCatch`-equivalent behavior) that only exist in the client rendering runtime — Server Components have no such mechanism since they don't re-render in the browser.

2. **Why doesn't a route's `error.tsx` automatically catch an error thrown inside a Server Action called from that route?**
   Server Actions execute as server-side function calls outside of the React component tree that the error boundary wraps — the boundary only catches errors thrown during rendering, so Server Action errors must be caught explicitly with try/catch and returned as state.

3. **When would `notFound()` be more appropriate than throwing a generic error?**
   When the route itself is valid but the specific resource being requested doesn't exist — like a deleted blog post — since `notFound()` renders a proper 404 UI instead of triggering the generic error boundary meant for unexpected failures.

---

**Previous:** [Section 12 — Route Handlers and APIs](../Section%2012%20-%20Route%20Handlers%20and%20APIs/README.md)
**Next:** [Section 14 — Authentication](../Section%2014%20-%20Authentication/README.md)
