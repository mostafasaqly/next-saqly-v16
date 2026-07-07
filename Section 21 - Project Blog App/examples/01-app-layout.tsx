// app/layout.tsx
import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: { default: "My Blog", template: "%s | My Blog" },
  description: "A statically-generated blog built with Next.js.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>My Blog</h1>
        </header>
        <main>{children}</main>
        <footer>© {new Date().getFullYear()} My Blog</footer>
      </body>
    </html>
  );
}
