// app/(dashboard)/dashboard/page.tsx
import { getDashboardMetrics } from "@/lib/metrics";

export default async function DashboardOverviewPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="cards-grid">
      <div className="card"><h3>Revenue</h3><p>${metrics.revenue}</p></div>
      <div className="card"><h3>Customers</h3><p>{metrics.customerCount}</p></div>
      <div className="card"><h3>Open Invoices</h3><p>{metrics.openInvoices}</p></div>
    </div>
  );
}
