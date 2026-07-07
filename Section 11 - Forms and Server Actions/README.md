# Section 11: Forms and Server Actions

> **Next.js Course** — Section 11 of 25 · Level: Intermediate

Server Actions let a plain HTML `<form>` call server-side code directly — no separate API route, no manual `fetch` wiring for the common case of "submit this form, mutate some data."

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Forms in Next.js](#1-forms-in-nextjs)
2. [What are Server Actions?](#2-what-are-server-actions)
3. [Creating Your First Server Action](#3-creating-your-first-server-action)
4. [Using Server Actions with Forms](#4-using-server-actions-with-forms)
5. [Form Validation](#5-form-validation)
6. [Pending States](#6-pending-states)
7. [Error States](#7-error-states)
8. [Success Messages](#8-success-messages)
9. [Resetting Forms](#9-resetting-forms)
10. [Mutating Data with Server Actions](#10-mutating-data-with-server-actions)
11. [Revalidating Data After Mutation](#11-revalidating-data-after-mutation)

---

## 1. Forms in Next.js

### The problem

Traditionally, a form submission means: prevent default, read field values manually, `fetch` a JSON API, handle the response — all in client-side JavaScript.

### The solution

Native `<form>` elements can submit directly to a server-side function via the `action` prop — no client JavaScript required for the basic case.

---

## 2. What are Server Actions?

### The solution

A Server Action is an `async` function marked `"use server"` that runs exclusively on the server, callable from both Server and Client Components — including directly as a form's `action`.

---

## 3. Creating Your First Server Action

See [`examples/01-first-server-action.tsx`](./examples/01-first-server-action.tsx).

### The solution

```ts
// app/actions/notes.ts
"use server";

export async function createNote(formData: FormData) {
  const text = formData.get("text") as string;
  await db.note.create({ data: { text } });
}
```

```tsx
// app/page.tsx
import { createNote } from "./actions/notes";

export default function NotesPage() {
  return (
    <form action={createNote}>
      <input name="text" />
      <button type="submit">Add Note</button>
    </form>
  );
}
```

---

## 4. Using Server Actions with Forms

### The solution

The action receives the submitted `FormData` directly — no manual serialization needed. Read fields with `formData.get("fieldName")`.

---

## 5. Form Validation

See [`examples/02-validation-with-zod.tsx`](./examples/02-validation-with-zod.tsx).

### The problem

Client-side validation alone can be bypassed — the server must validate independently since it's the actual trust boundary.

### The solution

Validate with Zod (or similar) inside the action itself, before touching the database:

```ts
"use server";
import { z } from "zod";

const NoteSchema = z.object({ text: z.string().min(1, "Note cannot be empty").max(500) });

export async function createNote(prevState: unknown, formData: FormData) {
  const parsed = NoteSchema.safeParse({ text: formData.get("text") });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.text?.[0] };
  }
  await db.note.create({ data: { text: parsed.data.text } });
  return { success: true };
}
```

> ⚠️ **Warning:** Never trust client-side validation alone. A Server Action can be called directly (bypassing your UI), so server-side validation is the only validation that actually matters for correctness.

---

## 6. Pending States

See [`examples/03-use-action-state.tsx`](./examples/03-use-action-state.tsx) and [`examples/04-use-form-status.tsx`](./examples/04-use-form-status.tsx).

### The solution

`useActionState` wraps an action and gives you its returned state plus a pending flag:

```tsx
"use client";
import { useActionState } from "react";
import { createNote } from "../actions/notes";

export default function NoteForm() {
  const [state, formAction, isPending] = useActionState(createNote, { error: null, success: false });
  return (
    <form action={formAction}>
      <input name="text" disabled={isPending} />
      <button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Add Note"}</button>
    </form>
  );
}
```

Alternatively, `useFormStatus` reads pending state from the nearest parent `<form>`, useful for a reusable submit button component:

```tsx
"use client";
import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>;
}
```

> 💡 **Tip:** `useFormStatus` must be called in a component nested *inside* the `<form>`, not the component that renders the form itself.

---

## 7. Error States

### The solution

Return a structured error object from the action (as shown above) and render it from `state.error` after calling `useActionState`.

---

## 8. Success Messages

### The solution

Same pattern — return a `success` flag or message in the action's returned state, and render it conditionally in the form component.

---

## 9. Resetting Forms

### The solution

After a successful submission, reset the form using a `ref` (`formRef.current?.reset()`) or by changing a `key` prop to force a remount.

---

## 10. Mutating Data with Server Actions

See [`examples/05-mutate-and-revalidate.tsx`](./examples/05-mutate-and-revalidate.tsx).

### The solution

Perform the actual database write directly inside the action — this is the standard place for creates, updates, and deletes in the App Router:

```ts
export async function deleteNote(id: string) {
  await db.note.delete({ where: { id } });
  revalidatePath("/notes");
}
```

---

## 11. Revalidating Data After Mutation

### The problem

After a Server Action mutates data, any cached pages showing that data are now stale.

### The solution

Call `revalidatePath` or `revalidateTag` inside the action itself, right after the mutation, so the UI reflects the change immediately on the next render:

```ts
await db.note.create({ data: { text } });
revalidatePath("/notes");
```

---

## ✅ Section Summary

- Native `<form action={serverAction}>` submits directly to server-side code, no API route needed
- Server Actions are `async` functions marked `"use server"`, receiving `FormData`
- Always validate on the server (e.g. with Zod) — client-side validation alone isn't trustworthy
- `useActionState` and `useFormStatus` handle pending/error/success UI without manual state wiring
- Call `revalidatePath`/`revalidateTag` inside the action after a mutation to keep the UI in sync

---

## Review Questions

1. **Why is server-side validation required even if the form already validates on the client?**
   Because a Server Action can be invoked directly, bypassing the UI entirely — client-side validation only improves UX, it provides no actual security or data-integrity guarantee.

2. **What's the difference between `useActionState` and `useFormStatus`?**
   `useActionState` wraps a specific action and exposes its returned state plus a pending flag, typically used in the component that owns the form. `useFormStatus` reads pending status from the nearest ancestor `<form>` and is meant for reusable child components (like a submit button) that don't own the form themselves.

3. **Why call `revalidatePath` inside the Server Action instead of after the form submission on the client?**
   Because the action runs on the server right where the mutation happens — calling revalidation there guarantees the cache is invalidated as part of the same request, before the client even sees the response, rather than relying on a separate client-side step that could be skipped or delayed.

---

**Previous:** [Section 10 — Caching and Revalidation](../Section%2010%20-%20Caching%20and%20Revalidation/README.md)
**Next:** [Section 12 — Route Handlers and APIs](../Section%2012%20-%20Route%20Handlers%20and%20APIs/README.md)
