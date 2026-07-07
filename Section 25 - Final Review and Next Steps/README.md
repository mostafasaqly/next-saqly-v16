# Section 25: Final Review and Next Steps

> **Next.js Course** — Section 25 of 25 · Level: All Levels

You've built a blog, a dashboard, a full CRUD app, and a mini e-commerce store — covering the entire App Router surface area. This final section reviews the journey, compares Next.js to its main alternatives, and points to what to learn next.

---

## Table of Contents

1. [Next.js Recap](#1-nextjs-recap)
2. [Common Next.js Interview Questions](#2-common-nextjs-interview-questions)
3. [Next.js vs React Router](#3-nextjs-vs-react-router)
4. [Next.js vs Remix](#4-nextjs-vs-remix)
5. [Next.js Career Path](#5-nextjs-career-path)
6. [What to Learn After Next.js](#6-what-to-learn-after-nextjs)
7. [Final Project Ideas](#7-final-project-ideas)
8. [Course Conclusion](#8-course-conclusion)

---

## 1. Next.js Recap

The course covered, in order:

- **App Router fundamentals** (Sections 3–5) — file-based routing, layouts, dynamic segments
- **Server vs Client Components** (Section 6) — the core mental model of the whole framework
- **Styling, assets, metadata** (Sections 7–8) — `next/font`, `next/image`, the Metadata API
- **Data** (Sections 9–13) — fetching, caching/revalidation, Server Actions, Route Handlers, error handling
- **Auth, middleware, database, state** (Sections 14–17) — sessions, `proxy.ts`, Prisma, Zustand
- **Performance, SEO, deployment** (Sections 18–20) — Turbopack, sitemaps, Vercel/Docker
- **Four capstone projects** (Sections 21–24) — a blog, a dashboard, a CRUD app, a mini store

---

## 2. Common Next.js Interview Questions

Practice explaining, in your own words:

- What's the difference between Server Components and Client Components, and when do you need `"use client"`?
- Walk through the four Next.js cache layers and how `revalidatePath`/`revalidateTag` interact with them
- Why are `params` and `searchParams` async in current Next.js?
- When would you use a Route Handler instead of a Server Action?
- How does Next.js decide whether a route is statically or dynamically rendered?

---

## 3. Next.js vs React Router

| | Next.js (App Router) | React + React Router |
|---|---|---|
| Routing | File-based, built in | Declarative routes you define in code |
| Rendering | Server Components by default, streaming, static/dynamic | Client-side only (unless paired with a separate SSR setup) |
| Data fetching | Built into the framework (`async` Server Components) | No built-in convention — typically a separate library |
| Backend | Route Handlers + Server Actions included | None — needs a separate API |

React Router is the right tool when you want a pure client-side SPA with full control and no server-rendering requirement. Next.js is the right tool when you want routing, rendering strategy, and backend logic handled by one integrated framework.

---

## 4. Next.js vs Remix

Both are full-stack React frameworks with similar philosophies (server-first, nested routing), differing mainly in data-loading conventions:

- **Next.js** — `async` Server Components fetch data directly in the component; Server Actions handle mutations
- **Remix** — `loader`/`action` functions per route handle data fetching and mutations, with a slightly different caching model

Both are strong choices; Next.js has a larger ecosystem and Vercel's first-party hosting integration.

---

## 5. Next.js Career Path

Next.js skills feed directly into roles like:

- **Frontend Engineer** — building product UI with a framework, not just a component library
- **Full-Stack Engineer** — since Next.js blurs the frontend/backend line via Server Actions and Route Handlers
- **React/Next.js Specialist** — consulting or platform teams standardizing on this stack

---

## 6. What to Learn After Next.js

- **Advanced caching / Cache Components** — deeper control over partial pre-rendering and cache boundaries
- **Testing** — component tests (Vitest/Testing Library) and end-to-end tests (Playwright) for App Router apps
- **Monorepos** — structuring multiple Next.js apps/packages together (Turborepo, Nx)
- **AI-agent tooling** — Next.js 16.3 (preview) is introducing AI-agent-oriented features worth tracking as they stabilize

---

## 7. Final Project Ideas

Beyond the four built in this course, consider:

- A **multi-tenant SaaS app** with per-organization data isolation
- A **real-time collaboration tool** (using WebSockets or a service like Pusher/Ably alongside Next.js)
- A **content platform with role-based publishing workflows** (draft → review → publish)
- A **portfolio site** using Cache Components and static generation, deployed on Vercel

---

## 8. Course Conclusion

You now have hands-on experience with every major App Router concept and four deployable projects to show for it. The fastest way to solidify this knowledge is to build one more project of your own design, applying these patterns without a course guiding each step.

### Where to go from here

- Re-read the sections that felt hardest (commonly: caching, and the Server/Client Component boundary) after a short break — they land better the second time
- Deploy at least one of the four capstone projects publicly and put it in your portfolio
- Join the Next.js GitHub Discussions or Discord to stay current as the framework evolves

Thank you for taking this course — good luck building.

---

**Previous:** [Section 24 — Project: Mini E-Commerce App](../Section%2024%20-%20Project%20Mini%20E-Commerce%20App/README.md)
