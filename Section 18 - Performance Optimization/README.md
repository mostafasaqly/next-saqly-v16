# Section 18: Performance Optimization

> **Next.js Course** — Section 18 of 25 · Level: Advanced

Most of Next.js's performance wins are automatic — Server Components, code splitting, image/font optimization. This section covers the remaining levers you pull manually: dynamic imports, script loading strategy, and bundle analysis.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Next.js Performance Overview](#1-nextjs-performance-overview)
2. [Code Splitting](#2-code-splitting)
3. [Lazy Loading Components](#3-lazy-loading-components)
4. [Dynamic Imports](#4-dynamic-imports)
5. [Image Optimization](#5-image-optimization)
6. [Font Optimization](#6-font-optimization)
7. [Script Optimization](#7-script-optimization)
8. [Bundle Analysis](#8-bundle-analysis)
9. [Turbopack Overview](#9-turbopack-overview)
10. [Performance Best Practices](#10-performance-best-practices)

---

## 1. Next.js Performance Overview

### The solution

The biggest performance levers, roughly in order of impact: rendering strategy (Server Components by default), bundle size (what actually ships as client JS), and asset handling (images/fonts/scripts).

---

## 2. Code Splitting

### The solution

Next.js automatically splits your app's JavaScript per route — visiting `/dashboard` doesn't download the code for `/checkout`. This happens with zero configuration.

---

## 3. Lazy Loading Components

### The solution

Defer loading non-critical components (a modal, a chart, a rich text editor) until they're actually needed, rather than including them in the initial bundle.

---

## 4. Dynamic Imports

See [`examples/01-dynamic-import.tsx`](./examples/01-dynamic-import.tsx).

### The solution

`next/dynamic` loads a Client Component on demand, and can disable server-side rendering for components that only work in the browser:

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./components/HeavyChart"), {
  loading: () => <p>Loading chart…</p>,
  ssr: false,
});
```

> 💡 **Tip:** Use `ssr: false` for components that depend on browser-only globals (like a charting library that reads `window` at import time) — otherwise the server render would crash.

---

## 5. Image Optimization

### The solution

`next/image` handles resizing, format conversion, and lazy loading automatically — see [Section 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#3-next-image-component) for the full pattern.

---

## 6. Font Optimization

### The solution

`next/font` self-hosts fonts at build time, eliminating render-blocking font requests and layout shift — see [Section 7](../Section%2007%20-%20Styling%20in%20Next.js/README.md#6-fonts-in-nextjs).

---

## 7. Script Optimization

See [`examples/02-script-optimization.tsx`](./examples/02-script-optimization.tsx).

### The problem

A third-party `<script>` tag placed carelessly can block the browser from rendering the page while it downloads and executes.

### The solution

`next/script` controls loading strategy explicitly:

```tsx
import Script from "next/script";

<Script src="https://analytics.example.com/script.js" strategy="afterInteractive" />
```

| Strategy | When it loads |
|---|---|
| `beforeInteractive` | Before any page JS, blocking — use sparingly, only for critical scripts |
| `afterInteractive` (default) | After the page becomes interactive |
| `lazyOnload` | During idle browser time, lowest priority |

---

## 8. Bundle Analysis

See [`examples/03-bundle-analyzer.ts`](./examples/03-bundle-analyzer.ts).

### The solution

`@next/bundle-analyzer` visualizes what's actually inside your client bundles as an interactive treemap, making it easy to spot an unexpectedly large dependency:

```ts
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default withBundleAnalyzer({ /* next config */ });
```

Run with `ANALYZE=true npm run build`.

---

## 9. Turbopack Overview

### The solution

Turbopack, Next.js's Rust-based bundler, is the **default for both `next dev` and `next build`** in current Next.js — giving faster cold starts, faster refresh, and faster production builds than the older Webpack pipeline, with no configuration needed to enable it.

---

## 10. Performance Best Practices

- Favor Server Components — they ship zero JS for content that doesn't need interactivity
- Keep Client Component boundaries small and pushed as far down the tree as possible
- Use `next/dynamic` for large, non-critical, or browser-only components
- Measure with **Core Web Vitals** (LCP, INP, CLS) rather than guessing — real user data beats intuition

> ⚠️ **Warning:** Optimizing without measuring first often targets the wrong thing. Check Core Web Vitals or a bundle analysis before assuming a specific component or dependency is the bottleneck.

---

## ✅ Section Summary

- Code splitting per route happens automatically; `next/dynamic` adds on-demand loading for specific components
- `next/image` and `next/font` handle the two biggest historical performance pain points automatically
- `next/script` gives explicit control over third-party script loading priority
- `@next/bundle-analyzer` reveals what's actually shipping in your client bundles
- Turbopack now powers both dev and build by default — no config needed

---

## Review Questions

1. **When would you set `ssr: false` on a `next/dynamic` import?**
   When the component depends on browser-only APIs (like `window` or `document`) at module load time — rendering it on the server would throw, so disabling SSR defers it entirely to the client.

2. **Why is `next/script`'s `strategy` prop important for third-party scripts?**
   Because an unmanaged `<script>` tag can block the browser from parsing and rendering the page while it downloads; choosing `afterInteractive` or `lazyOnload` lets the page become interactive first, improving perceived load performance.

---

**Previous:** [Section 17 — State Management](../Section%2017%20-%20State%20Management/README.md)
**Next:** [Section 19 — SEO and Production Readiness](../Section%2019%20-%20SEO%20and%20Production%20Readiness/README.md)
