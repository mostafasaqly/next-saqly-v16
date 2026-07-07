# Section 12: Route Handlers and APIs

> **Next.js Course** — Section 12 of 25 · Level: Intermediate

Route Handlers give you a real HTTP API inside the App Router — useful for webhooks and public endpoints, as opposed to Server Actions which are meant for internal form mutations.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [What are Route Handlers?](#1-what-are-route-handlers)
2. [Creating API Routes in App Router](#2-creating-api-routes-in-app-router)
3. [GET Route Handler](#3-get-route-handler)
4. [POST Route Handler](#4-post-route-handler)
5. [PUT and PATCH Route Handlers](#5-put-and-patch-route-handlers)
6. [DELETE Route Handler](#6-delete-route-handler)
7. [Reading Request Body](#7-reading-request-body)
8. [Returning JSON Responses](#8-returning-json-responses)
9. [Handling Errors](#9-handling-errors)
10. [When to Use Route Handlers vs Server Actions](#10-when-to-use-route-handlers-vs-server-actions)

---

## 1. What are Route Handlers?

### The solution

A `route.ts` file inside `app/` defines a custom API endpoint using the standard Web `Request`/`Response` APIs — no separate server framework needed.

---

## 2. Creating API Routes in App Router

### The solution

Add `route.ts` to any folder under `app/` to expose an endpoint at that path:

```text
app/api/posts/route.ts   →  /api/posts
```

> ⚠️ **Warning:** A folder can't have both `page.tsx` and `route.ts` at the same segment — pick one per path.

---

## 3. GET Route Handler

See [`examples/01-get-route.ts`](./examples/01-get-route.ts).

### The solution

```ts
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await db.post.findMany();
  return NextResponse.json(posts);
}
```

---

## 4. POST Route Handler

See [`examples/02-post-route.ts`](./examples/02-post-route.ts).

### The solution

```ts
export async function POST(request: Request) {
  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const post = await db.post.create({ data: { title: body.title } });
  return NextResponse.json(post, { status: 201 });
}
```

---

## 5. PUT and PATCH Route Handlers

See [`examples/03-put-patch-delete.ts`](./examples/03-put-patch-delete.ts).

### The solution

`PUT` conventionally replaces a whole resource; `PATCH` applies a partial update. Both receive dynamic segment params the same (async) way as pages:

```ts
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const post = await db.post.update({ where: { id }, data: body });
  return NextResponse.json(post);
}
```

---

## 6. DELETE Route Handler

### The solution

```ts
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.post.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
```

---

## 7. Reading Request Body

### The solution

For JSON payloads, `await request.json()`. For form submissions, `await request.formData()`.

---

## 8. Returning JSON Responses

### The solution

`NextResponse.json(data, { status })` sets the correct `Content-Type` header and status code in one call — no manual header wiring.

---

## 9. Handling Errors

See [`examples/04-error-handling.ts`](./examples/04-error-handling.ts).

### The solution

Wrap logic in try/catch and return an appropriate HTTP status code rather than letting an unhandled error surface as a generic 500:

```ts
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await db.post.findUniqueOrThrow({ where: { id } });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
}
```

---

## 10. When to Use Route Handlers vs Server Actions

### The solution

| | Route Handlers | Server Actions |
|---|---|---|
| Best for | Public APIs, webhooks, third-party integrations | Internal form submissions and mutations |
| Called from | Any HTTP client (curl, another service, your own frontend) | React components, directly as a form `action` |
| Returns | An HTTP `Response` you shape yourself | Whatever your function returns, handled by React |

> 💡 **Tip:** If a mobile app or external service needs to call your backend, use a Route Handler. If it's purely your own UI submitting a form, a Server Action is simpler and needs less boilerplate.

---

## ✅ Section Summary

- `route.ts` files define real HTTP endpoints using Web `Request`/`Response` APIs
- Export `GET`, `POST`, `PUT`, `PATCH`, `DELETE` functions per HTTP method needed
- `NextResponse.json()` is the standard way to return structured API responses
- Wrap handler logic in try/catch and return meaningful status codes
- Route Handlers suit public/external consumers; Server Actions suit internal form mutations

---

## Review Questions

1. **Why can't a folder have both `page.tsx` and `route.ts` for the same path segment?**
   Because both would try to define what happens when that exact path is requested — Next.js requires one or the other so there's no ambiguity about whether a request should render UI or return an API response.

2. **When would you choose a Route Handler over a Server Action for a mutation?**
   When the mutation needs to be callable from outside your own React UI — a mobile app, a third-party webhook, or another service — since Route Handlers expose a standard HTTP endpoint that any client can call, while Server Actions are invoked through React's own mechanisms.

---

**Previous:** [Section 11 — Forms and Server Actions](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md)
**Next:** [Section 13 — Error Handling](../Section%2013%20-%20Error%20Handling/README.md)
