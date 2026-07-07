// app/page.tsx
import dynamic from "next/dynamic";

// Loaded only when this component actually renders, not in the initial bundle.
const HeavyChart = dynamic(() => import("./components/HeavyChart"), {
  loading: () => <p>Loading chart…</p>,
  ssr: false, // skip server-rendering it too, e.g. for a chart lib that needs `window`
});

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
}
