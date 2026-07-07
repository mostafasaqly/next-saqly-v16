# Section 14: Authentication

> **Next.js Course** — Section 14 of 25 · Level: Advanced

Authentication in the App Router is built from a few composable pieces: password hashing, a signed session token stored in an HTTP-only cookie, and server-side checks before rendering protected content.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Authentication Flow Overview](#1-authentication-flow-overview)
2. [Login Page](#2-login-page)
3. [Register Page](#3-register-page)
4. [Password Validation](#4-password-validation)
5. [Sessions Overview](#5-sessions-overview)
6. [JWT Overview](#6-jwt-overview)
7. [Cookies in Next.js](#7-cookies-in-nextjs)
8. [Middleware for Protected Routes](#8-middleware-for-protected-routes)
9. [Role-Based Access](#9-role-based-access)
10. [Logout](#10-logout)
11. [Authentication Best Practices](#11-authentication-best-practices)

---

## 1. Authentication Flow Overview

### The solution

The typical flow: user submits credentials → server verifies them → server issues a session (cookie or token) → subsequent requests are checked against that session → protected routes redirect unauthenticated users to login.

---

## 2. Login Page

See [`examples/02-login-action-with-session.ts`](./examples/02-login-action-with-session.ts).

### The solution

A form submits to a Server Action that verifies credentials and issues a session cookie — see the code for the full flow, covered together with sessions below.

---

## 3. Register Page

See [`examples/01-register-action.ts`](./examples/01-register-action.ts).

### The solution

Collect and validate new user data with Zod, check for an existing account, then create the record with a hashed password:

```ts
"use server";
import bcrypt from "bcrypt";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function register(prevState: unknown, formData: FormData) {
  const parsed = RegisterSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: { email: ["Email already in use"] } };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.user.create({ data: { email: parsed.data.email, passwordHash } });
  return { success: true };
}
```

---

## 4. Password Validation

### The solution

Enforce a minimum length/complexity with Zod, and **always hash** before storing — never store plaintext passwords, ever:

```ts
const passwordHash = await bcrypt.hash(password, 10);
```

> ⚠️ **Warning:** Storing plaintext passwords, even temporarily in logs or error messages, is a critical security failure. Hash immediately and never log the raw password value.

---

## 5. Sessions Overview

### The solution

A server-managed session stores user state (who's logged in) and is referenced by an identifier the client holds — in this course, that identifier is a signed JWT stored in an HTTP-only cookie.

---

## 6. JWT Overview

See [`examples/02-login-action-with-session.ts`](./examples/02-login-action-with-session.ts).

### The solution

A JWT encodes claims (like `userId`, `role`) and is cryptographically signed, so it can be verified without a server-side session store:

```ts
import { SignJWT } from "jose";

const token = await new SignJWT({ userId: user.id, role: user.role })
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("7d")
  .sign(secret);
```

---

## 7. Cookies in Next.js

See [`examples/02-login-action-with-session.ts`](./examples/02-login-action-with-session.ts) and [`examples/03-read-session-server-component.tsx`](./examples/03-read-session-server-component.tsx).

### The solution

The `cookies()` API (async in current Next.js) reads and writes cookies from Server Components, Server Actions, and Route Handlers:

```ts
import { cookies } from "next/headers";

const cookieStore = await cookies();
cookieStore.set("session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
```

Reading it back to identify the current user:

```ts
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}
```

> ⚠️ **Warning:** Server Components can only *read* cookies, not set them — cookie writes must happen in a Server Action or Route Handler.

---

## 8. Middleware for Protected Routes

### The solution

Guard authenticated routes before they render — see [Section 15 (Middleware and Proxy)](../Section%2015%20-%20Middleware%20and%20Proxy/README.md) for the full pattern using `proxy.ts`, or check the session directly at the top of a page as shown next.

---

## 9. Role-Based Access

See [`examples/04-role-based-access.tsx`](./examples/04-role-based-access.tsx).

### The solution

Restrict a route or piece of UI based on the role stored in the session:

```tsx
export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");
  return <h1>Admin Panel</h1>;
}
```

---

## 10. Logout

See [`examples/05-logout-action.ts`](./examples/05-logout-action.ts).

### The solution

Delete the session cookie and redirect:

```ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
```

---

## 11. Authentication Best Practices

- Always store session tokens in **HTTP-only** cookies — inaccessible to client-side JavaScript, which mitigates token theft via XSS
- Set `secure: true` so cookies are only sent over HTTPS
- Hash passwords with bcrypt (or argon2); never store or log plaintext
- Validate credentials and sessions **on the server** — never trust a role or user ID sent from the client
- Give JWTs a reasonable expiration and re-issue rather than using tokens that never expire

> 💡 **Tip:** Treat the session cookie exactly like a password — anyone who obtains it can impersonate that user until it expires or is revoked.

---

## ✅ Section Summary

- Auth flow: verify credentials → issue a session → check the session on protected routes
- Passwords are hashed with bcrypt before storage, never stored in plaintext
- Sessions here use a signed JWT stored in an HTTP-only, secure cookie
- `cookies()` is async — Server Components can read it, but only Server Actions/Route Handlers can write it
- Role-based access is just a server-side check against the session payload before rendering

---

## Review Questions

1. **Why is `httpOnly: true` important for a session cookie?**
   It prevents the cookie from being read by client-side JavaScript, so even if an attacker injects a script via XSS, they can't steal the session token directly from `document.cookie`.

2. **Why can Server Components read cookies but not set them?**
   Setting a cookie requires sending a `Set-Cookie` HTTP header, which must happen as part of a response being constructed — Server Actions and Route Handlers control that response directly, while Server Components only produce rendered output within an already-in-flight response.

3. **Why hash passwords instead of encrypting them?**
   Hashing is one-way — even if the database is compromised, the original password can't be recovered from the hash. Encryption is reversible and would let anyone with the decryption key read the real passwords, which is never necessary for authentication.

---

**Previous:** [Section 13 — Error Handling](../Section%2013%20-%20Error%20Handling/README.md)
**Next:** [Section 15 — Middleware and Proxy](../Section%2015%20-%20Middleware%20and%20Proxy/README.md)
