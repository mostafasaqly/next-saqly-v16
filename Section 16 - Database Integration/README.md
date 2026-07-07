# Section 16: Database Integration

> **Next.js Course** — Section 16 of 25 · Level: Advanced

Because Server Components and Server Actions run on the server, they can talk to a database directly — no separate backend service required. This section uses **Prisma**, a type-safe ORM, as the example throughout.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Database Integration Overview](#1-database-integration-overview)
2. [Choosing a Database](#2-choosing-a-database)
3. [Prisma Overview](#3-prisma-overview)
4. [Installing Prisma](#4-installing-prisma)
5. [Creating a Data Model](#5-creating-a-data-model)
6. [Running Migrations](#6-running-migrations)
7. [Reading Data from Database](#7-reading-data-from-database)
8. [Creating Data](#8-creating-data)
9. [Updating Data](#9-updating-data)
10. [Deleting Data](#10-deleting-data)
11. [Database Best Practices](#11-database-best-practices)

---

## 1. Database Integration Overview

### The solution

Server Components and Server Actions execute in a trusted server environment, so they can import a database client and query it directly — the same way a traditional backend controller would.

---

## 2. Choosing a Database

### The solution

- **Relational (Postgres, MySQL)** — best default for most apps: strong consistency, relations, mature tooling
- **NoSQL (MongoDB, etc.)** — better fit for flexible/nested document shapes or very high write throughput with looser consistency needs

This course uses **Postgres** with Prisma throughout.

---

## 3. Prisma Overview

### The solution

Prisma is a type-safe ORM: you declare your schema once, and Prisma generates a fully-typed client — autocomplete and compile-time errors for every query.

---

## 4. Installing Prisma

### The solution

```bash
npm install prisma @prisma/client
npx prisma init
```

This scaffolds a `prisma/schema.prisma` file and a `.env` with a `DATABASE_URL` placeholder.

---

## 5. Creating a Data Model

See [`examples/01-prisma-schema.prisma`](./examples/01-prisma-schema.prisma).

### The solution

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  createdAt DateTime @default(now())
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}

model User {
  id    String @id @default(cuid())
  email String @unique
  posts Post[]
}
```

---

## 6. Running Migrations

### The solution

```bash
npx prisma migrate dev --name init
```

This applies the schema to your database and generates the typed client.

---

## 7. Reading Data from Database

See [`examples/02-prisma-client-singleton.ts`](./examples/02-prisma-client-singleton.ts) and [`examples/03-read-in-server-component.tsx`](./examples/03-read-in-server-component.tsx).

### The solution

Query directly inside a Server Component using the generated client:

```tsx
import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.post.findMany({ include: { author: true }, orderBy: { createdAt: "desc" } });
  return <ul>{posts.map((post) => <li key={post.id}>{post.title} — by {post.author.email}</li>)}</ul>;
}
```

---

## 8. Creating Data

See [`examples/04-create-update-delete.ts`](./examples/04-create-update-delete.ts).

### The solution

```ts
"use server";
export async function createPost(authorId: string, formData: FormData) {
  await db.post.create({ data: { title: formData.get("title") as string, authorId } });
  revalidatePath("/posts");
}
```

---

## 9. Updating Data

### The solution

```ts
export async function updatePost(id: string, formData: FormData) {
  await db.post.update({ where: { id }, data: { title: formData.get("title") as string } });
  revalidatePath("/posts");
}
```

---

## 10. Deleting Data

### The solution

```ts
export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });
  revalidatePath("/posts");
}
```

---

## 11. Database Best Practices

See [`examples/02-prisma-client-singleton.ts`](./examples/02-prisma-client-singleton.ts) and [`examples/05-avoid-n-plus-1.ts`](./examples/05-avoid-n-plus-1.ts).

### Keep the Prisma client as a singleton

Creating a new `PrismaClient` on every hot-reload during development quickly exhausts database connections:

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### Avoid N+1 queries

```ts
// ❌ one query per post, inside a loop
for (const post of posts) {
  const author = await db.user.findUnique({ where: { id: post.authorId } });
}

// ✅ fetch related data in a single query
const postsWithAuthors = await db.post.findMany({ include: { author: true } });
```

### Validate input before writes

Never pass raw `formData` values straight into a database write — validate with Zod first (see [Section 11](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md#5-form-validation)).

> ⚠️ **Warning:** Prisma protects against SQL injection by parameterizing queries automatically — but that protection only covers Prisma's own query API. If you ever drop down to raw SQL (`$queryRawUnsafe`), you're responsible for sanitization yourself.

---

## ✅ Section Summary

- Server Components/Actions can query a database directly — no separate API layer required
- Prisma provides a type-safe, autocomplete-friendly client generated from a schema file
- `prisma migrate dev` applies schema changes; the generated client exposes `.findMany`, `.create`, `.update`, `.delete`, etc.
- Keep the Prisma client as a module-level singleton to avoid connection exhaustion in development
- Use `include` to fetch relations in one query instead of looping and querying per row (N+1)

---

## Review Questions

1. **Why is a Prisma client singleton necessary in development but less of a concern in production?**
   Next.js hot-reloading in development re-executes modules on every file change, which would create a new `PrismaClient` (and new database connections) each time without a singleton guard — production builds don't hot-reload, so this specific issue doesn't occur there, though a singleton is still good practice.

2. **What is the N+1 query problem, and how does `include` solve it?**
   It's when fetching a list triggers one additional query per item to get related data (e.g., one query per post to fetch its author), multiplying database round trips. `include` tells Prisma to fetch the related data as part of the original query, reducing N+1 queries to just one.

---

**Previous:** [Section 15 — Middleware and Proxy](../Section%2015%20-%20Middleware%20and%20Proxy/README.md)
**Next:** [Section 17 — State Management](../Section%2017%20-%20State%20Management/README.md)
