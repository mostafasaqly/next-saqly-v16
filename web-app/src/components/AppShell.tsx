"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ScrollToTopOnNav from "./ScrollToTopOnNav";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LangContext";
import { strings } from "@/lib/i18n";
import type { SectionMeta } from "@/lib/sections";

export default function AppShell({
  sections,
  children,
}: {
  sections: SectionMeta[];
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang } = useLang();
  const t = strings[lang];

  return (
    <div className="flex min-h-full">
      <Sidebar sections={sections} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-h-full flex-1 flex-col">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur md:justify-end dark:border-neutral-800 dark:bg-neutral-900/90">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label={t.openMenu}
            aria-expanded={menuOpen}
            aria-controls="sidebar"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 md:hidden dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            ☰ {t.sections}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>
          </div>
        </div>

        <ScrollToTopOnNav />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
