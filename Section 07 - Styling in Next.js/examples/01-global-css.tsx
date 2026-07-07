// app/layout.tsx
import "./globals.css"; // imported once, in the root layout only

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
