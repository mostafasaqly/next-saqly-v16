# Section 7: Styling in Next.js

> **Next.js Course** — Section 7 of 25 · Level: Beginner

Next.js supports several styling approaches side by side — global CSS, CSS Modules, Tailwind, and self-hosted fonts — with no bundler configuration required.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Global CSS](#1-global-css)
2. [CSS Modules](#2-css-modules)
3. [Dynamic Classes](#3-dynamic-classes)
4. [Tailwind CSS Setup](#4-tailwind-css-setup)
5. [Responsive Layout](#5-responsive-layout)
6. [Fonts in Next.js](#6-fonts-in-nextjs)
7. [Using Local Fonts](#7-using-local-fonts)
8. [Styling Best Practices](#8-styling-best-practices)

---

## 1. Global CSS

See [`examples/01-global-css.tsx`](./examples/01-global-css.tsx).

### The solution

Import one global stylesheet in the root layout — it applies app-wide:

```tsx
// app/layout.tsx
import "./globals.css";
```

> ⚠️ **Warning:** Global CSS can only be imported in the root layout (or another top-level file), not inside arbitrary nested components — Next.js enforces this to avoid unpredictable style leakage.

---

## 2. CSS Modules

See [`examples/02-css-modules.tsx`](./examples/02-css-modules.tsx).

### The problem

Global class names collide easily once a project has more than a few components — two files both defining `.card` will conflict.

### The solution

Any file named `*.module.css` gets scoped class names automatically:

```css
/* Card.module.css */
.card {
  border-radius: 12px;
  padding: 16px;
}
```

```tsx
import styles from "./Card.module.css";

export default function Card({ children }: { children: React.ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}
```

---

## 3. Dynamic Classes

See [`examples/03-dynamic-classes.tsx`](./examples/03-dynamic-classes.tsx).

### The solution

Use a small utility like `clsx` to conditionally combine class names cleanly:

```tsx
import clsx from "clsx";

export default function Badge({ status }: { status: "active" | "inactive" }) {
  return (
    <span className={clsx("badge", { "badge--active": status === "active" })}>
      {status}
    </span>
  );
}
```

---

## 4. Tailwind CSS Setup

See [`examples/04-tailwind-usage.tsx`](./examples/04-tailwind-usage.tsx).

### The solution

Choosing "Yes" to Tailwind during `create-next-app` wires up everything automatically — utility classes work immediately in any component:

```tsx
export default function Button({ children }: { children: React.ReactNode }) {
  return <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{children}</button>;
}
```

Design tokens (custom colors, spacing) are configured in `tailwind.config` if you need to extend the defaults.

---

## 5. Responsive Layout

See [`examples/05-responsive-layout.tsx`](./examples/05-responsive-layout.tsx).

### The solution

Tailwind's breakpoint prefixes (`sm:`, `md:`, `lg:`) apply styles conditionally by viewport width:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {children}
</div>
```

---

## 6. Fonts in Next.js

See [`examples/06-next-font-google.tsx`](./examples/06-next-font-google.tsx).

### The problem

Loading Google Fonts the traditional way (a `<link>` tag) means a runtime request to Google's servers and often visible layout shift as the font swaps in.

### The solution

`next/font` downloads and self-hosts the font file **at build time** — no external request at runtime, and zero layout shift:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 7. Using Local Fonts

See [`examples/07-next-font-local.tsx`](./examples/07-next-font-local.tsx).

### The solution

`next/font/local` applies the same optimization to your own font files:

```tsx
import localFont from "next/font/local";

const myFont = localFont({ src: "./fonts/MyFont-Regular.woff2", variable: "--font-my-font" });
```

---

## 8. Styling Best Practices

- Keep `globals.css` minimal — resets, CSS variables, and truly app-wide rules only
- Prefer CSS Modules or Tailwind for component-level styles to avoid global collisions
- Colocate a component's styles next to it (`Card.tsx` + `Card.module.css` in the same folder)
- Always use `next/font` instead of manual `<link>` font tags — it's strictly better for both performance and layout stability

> 💡 **Tip:** Mixing Tailwind with CSS Modules in the same project is fine — use Tailwind for most layout/spacing and Modules for anything too complex to express as utility classes.

---

## ✅ Section Summary

- Global CSS: one import in the root layout only
- CSS Modules (`*.module.css`) scope class names automatically, no collisions
- `clsx` (or similar) cleanly composes conditional class names
- Tailwind is wired up automatically via `create-next-app`
- `next/font` self-hosts Google or local fonts with zero runtime requests and no layout shift

---

## Review Questions

1. **Why can't global CSS be imported inside a random nested component?**
   Next.js restricts global stylesheet imports to top-level files (like the root layout) because global CSS affects the whole page — allowing it anywhere would make style application unpredictable and hard to reason about.

2. **What problem does `next/font` solve that a traditional Google Fonts `<link>` tag doesn't?**
   `next/font` downloads and self-hosts the font at build time, avoiding a runtime network request to an external server and eliminating the layout shift that happens when a fallback font is swapped for the real one after it loads.

---

**Previous:** [Section 6 — Server Components and Client Components](../Section%2006%20-%20Server%20Components%20and%20Client%20Components/README.md)
**Next:** [Section 8 — Assets, Images, and Metadata](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md)
