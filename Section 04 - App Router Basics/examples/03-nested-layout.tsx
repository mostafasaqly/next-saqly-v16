// app/dashboard/layout.tsx
// Nests inside the root layout — only applies to routes under /dashboard.

import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <nav>Dashboard Sidebar</nav>
      <section>{children}</section>
    </div>
  );
}
