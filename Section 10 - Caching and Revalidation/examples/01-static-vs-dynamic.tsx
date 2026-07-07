// app/about/page.tsx — statically rendered: no dynamic data used
export default function AboutPage() {
  return <h1>About Us</h1>; // rendered once at build time, served from cache
}

// app/dashboard/page.tsx — dynamically rendered: reads cookies()
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies(); // reading cookies opts this route into dynamic rendering
  const theme = cookieStore.get("theme")?.value;
  return <p>Theme: {theme}</p>;
}
