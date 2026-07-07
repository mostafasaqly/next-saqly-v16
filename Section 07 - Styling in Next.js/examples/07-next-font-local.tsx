// app/layout.tsx
import localFont from "next/font/local";

const myFont = localFont({
  src: "./fonts/MyFont-Regular.woff2",
  variable: "--font-my-font",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={myFont.variable}>
      <body>{children}</body>
    </html>
  );
}
