# Section 17: State Management

> **Next.js Course** — Section 17 of 25 · Level: Intermediate

The central design question in a Next.js app isn't "how do I manage state" in the abstract — it's **where does each piece of state actually belong**: the server, the URL, or the browser.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [State Management in Next.js](#1-state-management-in-nextjs)
2. [Server State vs Client State](#2-server-state-vs-client-state)
3. [Local Component State](#3-local-component-state)
4. [Context API](#4-context-api)
5. [URL State with Search Params](#5-url-state-with-search-params)
6. [Server Actions for Mutations](#6-server-actions-for-mutations)
7. [Using Zustand](#7-using-zustand)
8. [When to Use Global State](#8-when-to-use-global-state)
9. [State Management Best Practices](#9-state-management-best-practices)

---

## 1. State Management in Next.js

### The solution

Every piece of state should be placed in the "cheapest" location that satisfies its requirements: server state for data that lives in a database, URL state for shareable UI state, and client state only for things that are truly ephemeral and local to one browser tab.

---

## 2. Server State vs Client State

### The solution

**Server state** lives in the database and is fetched fresh per request (or per cache window) — it's naturally consistent across users and devices. **Client state** lives only in the browser and resets on reload — appropriate for things like "is this dropdown open."

---

## 3. Local Component State

See [`examples/01-local-state.tsx`](./examples/01-local-state.tsx).

### The solution

`useState`/`useReducer` inside a Client Component, for state that's genuinely isolated to one UI element:

```tsx
"use client";
export default function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}>{title}</button>
      {open && <div>{children}</div>}
    </div>
  );
}
```

---

## 4. Context API

See [`examples/02-context-api.tsx`](./examples/02-context-api.tsx).

### The solution

Share client state across a component tree without prop drilling — the Provider must be a Client Component:

```tsx
"use client";
const ThemeContext = createContext<{ theme: string; toggle: () => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
```

> ⚠️ **Warning:** Context is scoped to Client Components only — a Server Component cannot consume a Context created in a Client Component.

---

## 5. URL State with Search Params

See [`examples/03-url-state.tsx`](./examples/03-url-state.tsx).

### The solution

Store shareable UI state (filters, active tab, page number) in the URL query string instead of `useState`:

```tsx
export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const products = await getProducts(category);
  return <p>Filter: {category ?? "all"}</p>;
}
```

> 💡 **Tip:** If a user should be able to bookmark or share a specific view, that view's state belongs in the URL, not in component state.

---

## 6. Server Actions for Mutations

### The solution

Treat Server Actions as the primary way to change **server-owned** state — see [Section 11](../Section%2011%20-%20Forms%20and%20Server%20Actions/README.md) for the full pattern. Don't duplicate server data into client state just to mutate it locally; mutate on the server and let revalidation refresh the UI.

---

## 7. Using Zustand

See [`examples/04-zustand-store.ts`](./examples/04-zustand-store.ts).

### The problem

Context re-renders every consumer on any state change, which becomes a performance problem for frequently-updated, widely-shared state (like a shopping cart).

### The solution

Zustand is a lightweight external store with selective subscriptions — components only re-render when the specific slice they read changes:

```ts
"use client";
import { create } from "zustand";

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));

// consuming component only re-renders when items.length changes
const itemCount = useCartStore((state) => state.items.length);
```

---

## 8. When to Use Global State

### The solution

Reach for global client state (Context or Zustand) only when multiple, otherwise-unrelated components need the same client-only data — a cart, a theme, an open/closed modal shared across the tree. If only one component tree needs it, local state is simpler and sufficient.

---

## 9. State Management Best Practices

- Default to **server state** (database) and **URL state** (search params) — they require no client JavaScript to stay in sync
- Add **local client state** only for state that's genuinely ephemeral and component-scoped
- Reach for **global client state** (Context/Zustand) only when several unrelated components truly need to share it
- Don't mirror server data into client state "just in case" — refetch or revalidate instead, so there's one source of truth

---

## ✅ Section Summary

- Prefer server state (database) and URL state (search params) — both survive reloads and are shareable for free
- `useState`/`useReducer` for local, single-component state
- Context API for shared client state, scoped to Client Components
- Zustand for frequently-updated shared state where Context's re-render behavior becomes a problem
- Server Actions remain the primary way to mutate server-owned state

---

## Review Questions

1. **Why is URL state (search params) often preferable to `useState` for filters and tabs?**
   Because URL state survives page reloads and can be copied, bookmarked, or shared with someone else and reproduce the exact same view — `useState` resets the moment the page reloads and can't be shared as a link.

2. **When would Zustand be a better choice than the Context API for shared client state?**
   When the shared state updates frequently and is read by many components, since Context re-renders every consumer on any change to the provided value, while Zustand lets components subscribe to only the specific slice of state they need, avoiding unnecessary re-renders.

---

**Previous:** [Section 16 — Database Integration](../Section%2016%20-%20Database%20Integration/README.md)
**Next:** [Section 18 — Performance Optimization](../Section%2018%20-%20Performance%20Optimization/README.md)
