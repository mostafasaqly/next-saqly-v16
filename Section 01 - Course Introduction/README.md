# Section 1: Course Introduction

> **Next.js Course** — Section 1 of 25 · Estimated time: ~30 minutes · Level: Beginner

Welcome to the course! This first section sets the stage. There's no code to write yet — instead, we'll cover what Next.js is, what you'll build, what you need to know before starting, and how the 25 sections fit together. By the end you'll have a clear mental map of the journey ahead.

---

## Table of Contents

1. [Welcome to Next.js Crash Course](#1-welcome-to-nextjs-crash-course)
2. [What You Will Build in This Course](#2-what-you-will-build-in-this-course)
3. [Course Prerequisites](#3-course-prerequisites)
4. [Course Roadmap](#4-course-roadmap)
5. [What is Next.js?](#5-what-is-nextjs)
6. [Next.js vs React](#6-nextjs-vs-react)
7. [When to Use Next.js](#7-when-to-use-nextjs)

---

## 1. Welcome to Next.js Crash Course

This course teaches Next.js from the ground up using the **App Router**, the current and recommended way to build Next.js applications. You'll learn by building real, working code in every section, culminating in four hands-on projects.

The teaching method follows a **problem → solution** pattern throughout: every lesson opens with a problem you'd actually run into, shows why the naive approach falls short, then introduces the correct Next.js way to solve it.

---

## 2. What You Will Build in This Course

Four progressively more advanced projects are built across Sections 21–24:

| Project | Section | What it covers |
|---|---|---|
| **Blog App** | 21 | Static generation, dynamic `[slug]` routes, metadata |
| **Dashboard App** | 22 | Auth-gated routes, data tables, search/filter via URL state |
| **Full Stack CRUD App** | 23 | Prisma + Postgres, Server Actions, full create/read/update/delete flow |
| **Mini E-Commerce App** | 24 | Cart state, checkout flow, order persistence |

Each project is portfolio-ready and deployable.

---

## 3. Course Prerequisites

This course assumes:

- Comfortable reading and writing **JavaScript or TypeScript**
- Basic **React** knowledge: components, props, hooks (`useState`, `useEffect`)
- No prior Next.js experience needed — we start from zero

If React itself is new to you, it's worth spending a few hours on React fundamentals first — Next.js builds directly on top of React's component model.

---

## 4. Course Roadmap

The 25 sections build in layers:

- **Sections 1–2** — introduction and environment setup
- **Sections 3–8** — App Router fundamentals: routing, layouts, components, styling, assets
- **Sections 9–13** — data: fetching, caching, forms, APIs, error handling
- **Sections 14–17** — authentication, middleware, databases, state
- **Sections 18–20** — performance, SEO, deployment
- **Sections 21–24** — four capstone projects
- **Section 25** — final review, career path, next steps

Each section's `README.md` is self-contained, with a `examples/` folder alongside it whenever there's runnable code to accompany the lesson.

---

## 5. What is Next.js?

### The problem

Building a production React app from scratch means wiring up a bundler, a router, a rendering strategy (client vs. server), image optimization, code splitting, and more — all before writing a single feature.

### The solution

**Next.js** is a React framework that provides all of this out of the box: file-based routing, both server and client rendering, built-in optimization for images/fonts/scripts, and conventions for data fetching and mutations. You focus on features; Next.js handles the plumbing.

> 💡 **Tip:** Next.js isn't a replacement for React — it's React *plus* the infrastructure every real app eventually needs.

---

## 6. Next.js vs React

| | React | Next.js |
|---|---|---|
| What it is | UI library | Full-stack framework built on React |
| Routing | Requires a separate router (e.g. React Router) | File-based routing built in |
| Rendering | Client-side by default | Server Components by default, with static/dynamic/streaming options |
| Data fetching | No built-in convention | `async` Server Components, caching, revalidation |
| Backend logic | None — needs a separate API | Route Handlers and Server Actions included |
| Optimization | Manual (bundler config, image handling) | Automatic (`next/image`, `next/font`, code splitting) |

> ⚠️ **Warning:** Don't think of this as "React is bad, Next.js is better." They're not competitors — Next.js *is* React, with a framework layer on top.

---

## 7. When to Use Next.js

Next.js is a strong fit when:

- **SEO matters** — server-rendered HTML is crawlable and fast
- You need **full-stack logic** — database access, auth, mutations — without standing up a separate backend
- Your team wants an **opinionated, batteries-included** setup instead of assembling one from scratch

It's less necessary for apps that are purely client-side (e.g. an internal tool behind a login wall with no SEO needs), though many teams use it there too for the developer experience.

---

## ✅ Section Summary

- Next.js is a React framework adding routing, rendering strategies, and full-stack conventions
- This course builds skills in layers across 25 sections, ending in four real projects
- Prerequisite: comfortable JS/TS + basic React
- Next.js shines for SEO-sensitive and full-stack apps; it's still just React underneath

---

## Review Questions

1. **What is the main difference between React and Next.js?**
   React is a UI library for building components; Next.js is a full-stack framework built on React that adds routing, rendering strategies, data-fetching conventions, and production tooling.

2. **Why might a team choose Next.js over plain React + a router?**
   Because Next.js provides file-based routing, server rendering, image/font optimization, and backend capabilities (Route Handlers, Server Actions) out of the box, removing the need to assemble and maintain that infrastructure separately.

---

**Next:** [Section 2 — Development Environment Setup](../Section%2002%20-%20Development%20Environment%20Setup/README.md)
