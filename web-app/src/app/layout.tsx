import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { getAllSectionMeta } from "@/lib/sections";
import { ThemeProvider } from "@/context/ThemeContext";
import { LangProvider } from "@/context/LangContext";
import { ProgressProvider } from "@/context/ProgressContext";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: { default: "Next.js Course", template: "%s | Next.js Course" },
  description: "A 25-section crash course on Next.js, from fundamentals to four capstone projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sections = getAllSectionMeta();
  const initialLang = "en";

  return (
    <html
      lang={initialLang}
      dir="ltr"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200"
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <LangProvider initialLang={initialLang}>
            <ProgressProvider>
              <AppShell sections={sections}>{children}</AppShell>
            </ProgressProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
