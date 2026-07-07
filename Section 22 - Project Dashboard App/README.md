# Section 22: Project — Dashboard App

> **Next.js Course** — Section 22 of 25 · Capstone Project 2 of 4

The second capstone project: an authenticated admin dashboard with a persistent sidebar, summary cards, a filterable data table, and route protection — combining Sections 4, 5, 9, 14, and 15.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Creating Dashboard Layout](#2-creating-dashboard-layout)
3. [Sidebar and Header](#3-sidebar-and-header)
4. [Dashboard Cards](#4-dashboard-cards)
5. [Data Table](#5-data-table)
6. [Search and Filters](#6-search-and-filters)
7. [Details Page](#7-details-page)
8. [Loading Skeletons](#8-loading-skeletons)
9. [Error Handling](#9-error-handling)
10. [Protected Dashboard Routes](#10-protected-dashboard-routes)
11. [Final Refactoring](#11-final-refactoring)

---

## 1. Project Overview

### What we're building

An admin dashboard with:

- A persistent sidebar/header shell for all dashboard pages
- Summary metric cards on the overview page
- A searchable, paginated customer table
- Route protection so only authenticated users can access `/dashboard/*`

---

## 2. Creating Dashboard Layout

See [`examples/01-dashboard-layout.tsx`](./examples/01-dashboard-layout.tsx).

### The solution

A route group `(dashboard)` scopes a distinct layout to just the dashboard section, without affecting the URL:

```tsx
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        {children}
      </div>
    </div>
  );
}
```

---

## 3. Sidebar and Header

See [`examples/02-sidebar.tsx`](./examples/02-sidebar.tsx).

### The solution

The sidebar highlights the active link using `usePathname`, following the pattern from [Section 5](../Section%2005%20-%20Navigation%20and%20Routing/README.md#4-active-links).

---

## 4. Dashboard Cards

See [`examples/03-summary-cards.tsx`](./examples/03-summary-cards.tsx).

### The solution

A Server Component fetches aggregate metrics and renders them as cards — no client JS needed for static summary numbers:

```tsx
export default async function DashboardOverviewPage() {
  const metrics = await getDashboardMetrics();
  return (
    <div className="cards-grid">
      <div className="card"><h3>Revenue</h3><p>${metrics.revenue}</p></div>
    </div>
  );
}
```

---

## 5. Data Table

See [`examples/04-data-table-with-filters.tsx`](./examples/04-data-table-with-filters.tsx).

### The solution

Render paginated rows fetched server-side, based on the current page number.

---

## 6. Search and Filters

### The solution

Filtering uses URL search params (from [Section 17](../Section%2017%20-%20State%20Management/README.md#5-url-state-with-search-params)) rather than client state, so filtered/paginated views are shareable and bookmarkable:

```tsx
export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ query?: string; page?: string }> }) {
  const { query = "", page = "1" } = await searchParams;
  const { customers, totalPages } = await getCustomers(query, Number(page));
  // ...
}
```

---

## 7. Details Page

### The solution

Add a dynamic `[id]` route under `dashboard/customers/[id]/page.tsx` following the same pattern as [Section 5](../Section%2005%20-%20Navigation%20and%20Routing/README.md#6-route-parameters), showing a single customer's full record.

---

## 8. Loading Skeletons

### The solution

Add a `loading.tsx` per dashboard sub-route rendering skeleton placeholders shaped like the real content, for a polished perceived-performance experience.

---

## 9. Error Handling

### The solution

Scoped `error.tsx` boundaries per dashboard sub-route, so a failure loading the customers table doesn't take down the whole dashboard shell — same pattern as [Section 13](../Section%2013%20-%20Error%20Handling/README.md).

---

## 10. Protected Dashboard Routes

See [`examples/05-protected-dashboard.tsx`](./examples/05-protected-dashboard.tsx).

### The solution

Gate the entire route group behind a `proxy.ts` session check, matching only dashboard paths:

```ts
export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
```

---

## 11. Final Refactoring

### The solution

- Consolidate data-fetching functions (`getDashboardMetrics`, `getCustomers`) into a shared `lib/` module
- Extract the `SearchInput` and pagination controls into reusable Client Components used across every filterable table
- Confirm the proxy's `matcher` covers every dashboard sub-route without over-matching unrelated public pages

---

## ✅ Section Summary

- Route groups give the dashboard its own layout (sidebar + header) without changing the URL
- Summary cards and tables are Server Components fetching data directly — no client-side loading state needed
- Filters and pagination live in the URL, making every view shareable
- `proxy.ts` gates the entire `/dashboard/*` route group behind a session check in one place

---

## Review Questions

1. **Why gate the dashboard with a single `proxy.ts` matcher instead of checking auth inside every individual dashboard page?**
   Centralizing the check in the proxy means every current and future route under `/dashboard/*` is automatically protected — checking inside each page individually is repetitive and easy to forget on a newly added route.

2. **Why store the customer table's search query and page number in the URL instead of component state?**
   So the exact filtered/paginated view can be bookmarked, shared, or reloaded without losing its state — component state would reset to the default view on every page reload.

---

**Previous:** [Section 21 — Project: Blog App](../Section%2021%20-%20Project%20Blog%20App/README.md)
**Next:** [Section 23 — Project: Full Stack CRUD App](../Section%2023%20-%20Project%20Full%20Stack%20CRUD%20App/README.md)
