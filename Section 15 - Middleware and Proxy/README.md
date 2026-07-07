# Section 15: Middleware and Proxy

> **Next.js Course** — Section 15 of 25 · Level: Advanced

Code that needs to run **before** a request completes — for route protection, redirects, or logging — lives in a single file at the project root. In current Next.js, this file is named **`proxy.ts`**, replacing the older `middleware.ts`.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [What is Middleware/Proxy?](#1-what-is-middlewareproxy)
2. [Creating Proxy Logic](#2-creating-proxy-logic)
3. [Matching Routes](#3-matching-routes)
4. [Protecting Routes](#4-protecting-routes)
5. [Redirecting Users](#5-redirecting-users)
6. [Reading Cookies](#6-reading-cookies)
7. [Authentication Proxy Example](#7-authentication-proxy-example)
8. [Migrating from middleware.ts](#8-migrating-from-middlewarets)
9. [Middleware/Proxy Best Practices](#9-middlewareproxy-best-practices)

---

## 1. What is Middleware/Proxy?

### The solution

A `proxy.ts` file at the project root exports a function that runs before matching requests reach your routes — it can inspect the request, rewrite it, redirect it, or block it entirely.

> 💡 **Tip:** If you've seen `middleware.ts` in older tutorials, it's the same concept — current Next.js renamed the file (and exported function) to `proxy.ts`/`proxy` for clarity.

---

## 2. Creating Proxy Logic

See [`examples/01-basic-proxy.ts`](./examples/01-basic-proxy.ts).

### The solution

```ts
// proxy.ts — project root, sibling of app/
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  console.log(`Incoming request: ${request.nextUrl.pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## 3. Matching Routes

See [`examples/02-matcher-config.ts`](./examples/02-matcher-config.ts).

### The problem

Running proxy logic on every single request — including static assets — wastes work and can slow down unrelated pages.

### The solution

The `matcher` config scopes which paths trigger the proxy:

```ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

## 4. Protecting Routes

### The solution

Check for a valid session cookie/token at the top of the proxy function before allowing the request through — see the full example below.

---

## 5. Redirecting Users

### The solution

Return a redirect response to send unauthenticated users elsewhere:

```ts
return NextResponse.redirect(new URL("/login", request.url));
```

---

## 6. Reading Cookies

### The solution

`request.cookies.get("name")?.value` reads a cookie directly from the incoming request inside the proxy — no need for the async `cookies()` API here, since the proxy already has the raw request object.

---

## 7. Authentication Proxy Example

See [`examples/03-auth-proxy.ts`](./examples/03-auth-proxy.ts).

### The solution

A full example gating `/dashboard` behind a valid session:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = { matcher: ["/dashboard/:path*"] };
```

---

## 8. Migrating from middleware.ts

See [`examples/04-migrating-from-middleware.txt`](./examples/04-migrating-from-middleware.txt).

### The solution

1. Rename `middleware.ts` → `proxy.ts`
2. Rename the exported function `middleware` → `proxy`
3. Everything else (`NextResponse`, `NextRequest`, `matcher` config, cookie access) stays identical

> ⚠️ **Warning:** If you're following an older tutorial or working in a project still on an earlier Next.js version, `middleware.ts` may still be what's expected — check your Next.js version before assuming `proxy.ts` applies.

---

## 9. Middleware/Proxy Best Practices

- Keep proxy logic **lightweight and fast** — it runs on every matched request, so expensive work here adds latency to the whole app
- Scope the `matcher` as tightly as possible; don't run auth checks against static assets or API routes that don't need them
- Do the actual authorization *decision* here (redirect or allow), but keep detailed session/role logic in your session utilities, not duplicated inline

---

## ✅ Section Summary

- `proxy.ts` (formerly `middleware.ts`) runs before matching requests complete
- The `matcher` config controls which paths trigger it — keep it as narrow as possible
- Use it to check cookies/tokens and redirect unauthenticated users before a protected route ever renders
- Migrating from `middleware.ts` is a rename of the file and exported function — the API surface is unchanged

---

## Review Questions

1. **Why should proxy logic be kept as lightweight as possible?**
   Because it runs on every request matching its `matcher` config, adding latency to every one of those requests — slow logic here (like an unindexed database call) degrades performance across the whole matched section of the app.

2. **What's the practical difference between renaming `middleware.ts` to `proxy.ts`?**
   None functionally — it's the same mechanism with a clearer name and a renamed exported function (`proxy` instead of `middleware`); the `NextRequest`/`NextResponse` APIs and `matcher` config work identically.

---

**Previous:** [Section 14 — Authentication](../Section%2014%20-%20Authentication/README.md)
**Next:** [Section 16 — Database Integration](../Section%2016%20-%20Database%20Integration/README.md)
