# Section 20: Deployment

> **Next.js Course** — Section 20 of 25 · Level: Intermediate

The last step before a project is "done" — getting it running reliably somewhere other than your laptop.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Preparing Next.js for Production](#1-preparing-nextjs-for-production)
2. [Environment Variables](#2-environment-variables)
3. [Building the Project](#3-building-the-project)
4. [Deploying to Vercel](#4-deploying-to-vercel)
5. [Deploying to Netlify](#5-deploying-to-netlify)
6. [Deploying with Docker Overview](#6-deploying-with-docker-overview)
7. [Common Deployment Issues](#7-common-deployment-issues)
8. [Production Debugging](#8-production-debugging)

---

## 1. Preparing Next.js for Production

### The solution

Run `next build` locally first and resolve every build-time error or warning before pushing to a hosting platform — catching issues locally is much faster than debugging them in a CI log.

---

## 2. Environment Variables

See [`examples/01-env-variables.txt`](./examples/01-env-variables.txt).

### The solution

Use `.env.local` for secrets during development (never commit it). Only variables prefixed `NEXT_PUBLIC_` are exposed to the browser bundle:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"        # server-only
NEXT_PUBLIC_ANALYTICS_ID="UA-XXXXXXX"                       # exposed to the client
```

> ⚠️ **Warning:** Never prefix a secret (API key, database URL) with `NEXT_PUBLIC_` — it will be embedded directly into the client-side JavaScript bundle, visible to anyone who views source.

---

## 3. Building the Project

### The solution

```bash
next build
```

Compiles the app using Turbopack and prepares an optimized, deployment-ready output.

---

## 4. Deploying to Vercel

### The solution

Vercel is the platform built by the Next.js team — connecting a Git repository gives zero-config deployment, automatic preview URLs per pull request, and full support for every App Router feature (Server Actions, streaming, ISR).

---

## 5. Deploying to Netlify

### The solution

Netlify supports the App Router via its Next.js adapter, handling Server Actions and dynamic rendering — set the build command to `next build` and let the adapter handle the rest.

---

## 6. Deploying with Docker Overview

See [`examples/02-docker-standalone.txt`](./examples/02-docker-standalone.txt).

### The solution

For self-hosting, set `output: "standalone"` in `next.config.ts` — this produces a minimal, self-contained server bundle ideal for a small Docker image:

```ts
const nextConfig = { output: "standalone" };
```

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

---

## 7. Common Deployment Issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails with "Missing environment variable" | Env var set locally but not in the hosting platform's dashboard | Add it to the platform's environment variable settings |
| Different behavior locally vs. deployed | Node version mismatch between local and hosting environment | Pin the Node version explicitly in platform settings |
| Images fail to load in production | Remote image domain not in `next.config.ts` `remotePatterns` | Add the domain — see [Section 8](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md#4-image-optimization) |

---

## 8. Production Debugging

### The solution

Use the hosting platform's function/runtime logs to see server-side errors, integrate an error-tracking tool (e.g. Sentry) for structured crash reports, and enable source maps so stack traces point to your actual source rather than minified output.

---

## ✅ Section Summary

- Run `next build` locally first to catch errors before deploying
- Only `NEXT_PUBLIC_`-prefixed variables reach the browser — never prefix secrets this way
- Vercel offers the most complete, zero-config App Router support; Netlify supports it via an adapter
- `output: "standalone"` produces a minimal bundle for Docker/self-hosting
- Most deployment issues trace back to missing env vars, Node version mismatches, or unconfigured image domains

---

## Review Questions

1. **Why should a secret like `DATABASE_URL` never be prefixed with `NEXT_PUBLIC_`?**
   Because that prefix tells Next.js to inline the variable's value directly into the client-side JavaScript bundle at build time, making it visible to anyone who inspects the page source — secrets must stay server-only.

2. **What does `output: "standalone"` in `next.config.ts` change about the build?**
   It produces a minimal, self-contained server bundle (with only the dependencies actually used, plus a small Node server) instead of a build that expects a full `node_modules` install — ideal for keeping Docker images small.

---

**Previous:** [Section 19 — SEO and Production Readiness](../Section%2019%20-%20SEO%20and%20Production%20Readiness/README.md)
**Next:** [Section 21 — Project: Blog App](../Section%2021%20-%20Project%20Blog%20App/README.md)
