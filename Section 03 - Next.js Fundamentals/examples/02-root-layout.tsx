// app/layout.tsx
// The root layout is mandatory — it defines the <html> and <body> tags
// for the entire app, and wraps every page.

import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
