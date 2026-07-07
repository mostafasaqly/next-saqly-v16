# Section 2: Development Environment Setup

> **Next.js Course** — Section 2 of 25 · Estimated time: ~30 minutes · Level: Beginner

Before writing any app code, you need Node.js installed and a Next.js project scaffolded. This section walks through setup end to end, including the prompts you'll see and the most common issues that trip up beginners.

---

## Table of Contents

1. [Installing Node.js](#1-installing-nodejs)
2. [Creating a Next.js Project](#2-creating-a-nextjs-project)
3. [Project Setup Options](#3-project-setup-options)
4. [Understanding the Project Structure](#4-understanding-the-project-structure)
5. [Running the Development Server](#5-running-the-development-server)
6. [Recommended VS Code Extensions](#6-recommended-vs-code-extensions)
7. [Common Setup Issues](#7-common-setup-issues)

---

## 1. Installing Node.js

### The problem

Next.js is a Node.js-based tool, so without Node installed (or with too old a version), `create-next-app` and the dev server simply won't run.

### The solution

Install Node.js **20.9 or later** (required by Next.js 16). The cleanest way is via a version manager so you can switch Node versions per project:

```bash
# install nvm (macOS/Linux) then:
nvm install 20
nvm use 20

# verify
node -v   # should print v20.9.0 or higher
npm -v
```

> 💡 **Tip:** On Windows, use `nvm-windows` or install Node directly from nodejs.org — either works fine for this course.

---

## 2. Creating a Next.js Project

### The problem

Setting up a Next.js project by hand (TypeScript config, ESLint, folder conventions) is tedious and easy to get subtly wrong.

### The solution

Use the official scaffolding tool, which asks a few questions and generates a correctly configured project:

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

---

## 3. Project Setup Options

`create-next-app` prompts for several choices. For this course, use:

```text
✔ TypeScript?                 Yes
✔ ESLint?                     Yes
✔ Tailwind CSS?               Yes
✔ src/ directory?             Yes
✔ App Router?                 Yes  (this is the only option in current Next.js)
✔ Turbopack for next dev?     Yes  (default)
✔ Import alias (@/*)?         Yes
```

> ⚠️ **Warning:** Older tutorials mention choosing between "App Router" and "Pages Router." Current Next.js scaffolds App Router only — Pages Router still exists for legacy projects but isn't offered to new ones.

---

## 4. Understanding the Project Structure

```text
my-app/
├── src/
│   └── app/
│       ├── layout.tsx     ← root layout (required)
│       ├── page.tsx       ← homepage ("/")
│       └── globals.css
├── public/                ← static files served as-is
├── next.config.ts
├── tsconfig.json
└── package.json
```

Everything under `app/` maps to routes and their UI. `public/` holds assets referenced by URL (e.g. `/logo.png`).

---

## 5. Running the Development Server

```bash
npm run dev
```

This starts the dev server at `http://localhost:3000`, powered by **Turbopack** by default — Next.js's Rust-based bundler, which gives near-instant startup and fast refresh compared to the older Webpack-based dev server.

> 💡 **Tip:** Turbopack now also powers `next build`, not just `next dev` — production builds are noticeably faster too.

---

## 6. Recommended VS Code Extensions

- **ESLint** — surfaces lint errors inline
- **Prettier** — consistent code formatting on save
- **Tailwind CSS IntelliSense** — autocomplete for utility classes
- The official **Next.js snippets** extension — quick scaffolds for `page.tsx`, `layout.tsx`, etc.

---

## 7. Common Setup Issues

| Symptom | Likely cause | Fix |
|---|---|---|
| `create-next-app` fails or hangs | Node version too old | Upgrade to Node 20.9+ |
| `Error: Port 3000 is already in use` | Another dev server running | Stop it, or run `next dev -p 3001` |
| Stale/broken UI after pulling changes | Corrupted `.next` cache | Delete the `.next` folder and restart `npm run dev` |
| TypeScript errors on a fresh clone | Missing `node_modules` | Run `npm install` |

---

## ✅ Section Summary

- Next.js 16 requires **Node.js 20.9+**
- Scaffold new projects with `npx create-next-app@latest`
- Choose TypeScript, ESLint, Tailwind, `src/`, App Router, and an import alias
- `next dev` now runs on **Turbopack** by default for fast startup and refresh
- Most setup issues trace back to Node version mismatches or a stale `.next` cache

---

## Review Questions

1. **Why does Next.js 16 require Node.js 20.9 or later?**
   Next.js relies on modern Node.js runtime features (and Turbopack's requirements) that aren't available in older Node versions — running an older version causes the CLI or dev server to fail unpredictably.

2. **What's the fastest fix when the dev server shows stale or broken UI after pulling new changes?**
   Delete the `.next` build cache folder and restart `npm run dev` — this forces Next.js to rebuild from scratch instead of reusing outdated cached output.

---

**Previous:** [Section 1 — Course Introduction](../Section%2001%20-%20Course%20Introduction/README.md)
**Next:** [Section 3 — Next.js Fundamentals](../Section%2003%20-%20Next.js%20Fundamentals/README.md)
