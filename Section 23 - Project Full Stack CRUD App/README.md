# Section 23: Project — Full Stack CRUD App

> **Next.js Course** — Section 23 of 25 · Capstone Project 3 of 4

The third capstone project: a complete Create-Read-Update-Delete task manager backed by a real Postgres database via Prisma — combining Sections 11 and 16 into one cohesive app.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Setting Up Prisma](#2-setting-up-prisma)
3. [Creating Database Models](#3-creating-database-models)
4. [Creating List Page](#4-creating-list-page)
5. [Creating Add Form](#5-creating-add-form)
6. [Creating Server Actions](#6-creating-server-actions)
7. [Creating Edit Form](#7-creating-edit-form)
8. [Updating Data](#8-updating-data)
9. [Deleting Data](#9-deleting-data)
10. [Revalidating Pages](#10-revalidating-pages)
11. [Adding Validation](#11-adding-validation)
12. [Final Project Review](#12-final-project-review)

---

## 1. Project Overview

### What we're building

A task manager with full CRUD: a list page, an add form, an edit form, and delete with confirmation — all backed by Postgres via Prisma, with every mutation going through a validated Server Action.

---

## 2. Setting Up Prisma

### The solution

```bash
npm install prisma @prisma/client
npx prisma init
```

Connect it to a Postgres database via `DATABASE_URL` in `.env` — see [Section 16](../Section%2016%20-%20Database%20Integration/README.md#4-installing-prisma).

---

## 3. Creating Database Models

See [`examples/01-prisma-setup.prisma`](./examples/01-prisma-setup.prisma).

### The solution

```prisma
model Task {
  id        String   @id @default(cuid())
  title     String
  done      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

Run `npx prisma migrate dev --name init` to apply it.

---

## 4. Creating List Page

See [`examples/02-list-page.tsx`](./examples/02-list-page.tsx).

### The solution

A Server Component fetches all tasks directly:

```tsx
export default async function TasksPage() {
  const tasks = await db.task.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title} {task.done && "✅"}</li>
      ))}
    </ul>
  );
}
```

---

## 5. Creating Add Form

See [`examples/04-add-form.tsx`](./examples/04-add-form.tsx).

### The solution

A form submits to the `createTask` Server Action via `useActionState`, showing validation errors and a pending state — see the full pattern in [Section 11](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md#6-pending-states).

---

## 6. Creating Server Actions

See [`examples/03-server-actions.ts`](./examples/03-server-actions.ts).

### The solution

One `actions/tasks.ts` module holds `createTask`, `updateTask`, `toggleTaskDone`, and `deleteTask`, each validating input and revalidating the list afterward:

```ts
"use server";
const TaskSchema = z.object({ title: z.string().min(1, "Title is required").max(200) });

export async function createTask(prevState: unknown, formData: FormData) {
  const parsed = TaskSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors.title?.[0] };
  await db.task.create({ data: { title: parsed.data.title } });
  revalidatePath("/tasks");
  redirect("/tasks");
}
```

---

## 7. Creating Edit Form

See [`examples/05-edit-form.tsx`](./examples/05-edit-form.tsx).

### The solution

The edit page loads the existing task by `id` (calling `notFound()` if missing) and pre-fills a form via `defaultValue`, binding the action to that specific task's `id` with `.bind()`:

```tsx
const updateWithId = updateTask.bind(null, task.id);
const [state, formAction] = useActionState(updateWithId, { error: null });
```

---

## 8. Updating Data

### The solution

`updateTask` (shown in Section 6 above) validates the new title and writes it with `db.task.update`.

---

## 9. Deleting Data

See [`examples/06-delete-with-confirmation.tsx`](./examples/06-delete-with-confirmation.tsx).

### The solution

A small Client Component wraps the delete action in a `confirm()` prompt before calling it:

```tsx
"use client";
import { deleteTask } from "@/app/actions/tasks";

export default function DeleteTaskButton({ id }: { id: string }) {
  return (
    <form action={async () => { if (confirm("Delete this task?")) await deleteTask(id); }}>
      <button type="submit">Delete</button>
    </form>
  );
}
```

---

## 10. Revalidating Pages

### The solution

Every mutation (`createTask`, `updateTask`, `deleteTask`, `toggleTaskDone`) calls `revalidatePath("/tasks")` right after writing to the database, so the list page reflects changes on the very next render — no manual refresh needed.

---

## 11. Adding Validation

### The solution

Every action validates its input with the same `TaskSchema` before touching the database — see [Section 11](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md#5-form-validation) for why server-side validation is non-negotiable.

---

## 12. Final Project Review

### Walkthrough

- **List page** — Server Component, fetches directly from Prisma
- **Add/Edit forms** — Client Components using `useActionState` for pending/error UI
- **Server Actions** — validate with Zod, mutate with Prisma, revalidate with `revalidatePath`
- **Delete** — confirmed via a native `confirm()` dialog before calling the action

### Possible extensions

- Add due dates and sorting
- Add optimistic UI updates for toggling `done` (see `useOptimistic` in React)
- Add pagination once the task list grows large

---

## ✅ Section Summary

- Prisma models the `Task` table; migrations apply schema changes
- All four CRUD operations are Server Actions, validated with Zod before touching the database
- `revalidatePath("/tasks")` after every mutation keeps the list in sync automatically
- Edit forms bind the action to a specific record's `id` via `.bind()`, keeping one action reusable across all tasks

---

## Review Questions

1. **Why does every Server Action in this project call `revalidatePath("/tasks")` after its mutation?**
   Because the tasks list page is statically cached by default — without revalidating, a create/update/delete would succeed in the database but the list page would keep showing stale cached data until the next natural revalidation window.

2. **Why use `.bind(null, task.id)` on the `updateTask` action inside the edit form?**
   It creates a version of the action pre-filled with the specific task's `id`, so the generic `updateTask(id, prevState, formData)` function can be reused for every task while `useActionState` only needs to manage `(prevState, formData)`.

---

**Previous:** [Section 22 — Project: Dashboard App](../Section%2022%20-%20Project%20Dashboard%20App/README.md)
**Next:** [Section 24 — Project: Mini E-Commerce App](../Section%2024%20-%20Project%20Mini%20E-Commerce%20App/README.md)
