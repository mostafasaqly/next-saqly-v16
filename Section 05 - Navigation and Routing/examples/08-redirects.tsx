// app/old-path/page.tsx
import { redirect } from "next/navigation";

export default function OldPathPage() {
  redirect("/new-path"); // throws internally, stops rendering, sends 307/303
}

// next.config.ts — static redirects defined at the config level
const nextConfig = {
  async redirects() {
    return [
      { source: "/old-blog/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
