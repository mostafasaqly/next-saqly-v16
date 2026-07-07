// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://analytics.example.com/script.js"
          strategy="afterInteractive" // loads after the page becomes interactive, not blocking initial render
        />
      </body>
    </html>
  );
}
