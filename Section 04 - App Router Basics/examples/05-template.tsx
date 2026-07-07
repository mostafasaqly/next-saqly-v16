// app/template.tsx
// Like layout.tsx, but re-mounts on every navigation — useful for
// enter/exit animations or resetting state per-visit.

import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
