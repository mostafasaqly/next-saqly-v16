"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { SectionMeta } from "@/lib/sections";
import { useProgress } from "@/context/ProgressContext";
import { useLang } from "@/context/LangContext";
import { strings } from "@/lib/i18n";
import { sectionTitlesAr } from "@/lib/sectionTitles.ar";

export default function Sidebar({
  sections,
  isOpen,
  onClose,
}: {
  sections: SectionMeta[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { isComplete, percent } = useProgress();
  const { lang } = useLang();
  const t = strings[lang];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav
        id="sidebar"
        aria-label={t.sections}
        className={clsx(
          "fixed inset-y-0 z-40 w-72 shrink-0 overflow-y-auto border-r border-neutral-200 bg-neutral-50 p-4 transition-transform md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 dark:border-neutral-800 dark:bg-neutral-950",
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full md:translate-x-0 md:rtl:translate-x-0"
        )}
      >
        <div className="mb-4 px-2 text-lg font-semibold text-neutral-900 dark:text-white">
          {t.courseTitle}
        </div>

        <div className="mb-4 px-2">
          <div className="mb-1 flex justify-between text-xs text-neutral-500">
            <span>{t.progress}</span>
            <span>{percent(sections.length)}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percent(sections.length)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
          >
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${percent(sections.length)}%` }}
            />
          </div>
        </div>

        <ol className="space-y-1">
          {sections.map((section) => {
            const href = `/sections/${section.slug}`;
            const isActive = pathname === href;
            return (
              <li key={section.id}>
                <Link
                  href={href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={clsx(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-blue-600/20 text-blue-600 dark:text-blue-400"
                      : "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  )}
                >
                  <span className="w-6 shrink-0 text-xs text-neutral-500">
                    {isComplete(section.id) ? "✓" : String(section.id).padStart(2, "0")}
                  </span>
                  {lang === "ar" ? sectionTitlesAr[section.slug] ?? section.title : section.title}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
