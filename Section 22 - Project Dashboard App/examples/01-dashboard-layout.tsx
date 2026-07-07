// app/(dashboard)/layout.tsx — route group scopes this layout to dashboard pages only
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
