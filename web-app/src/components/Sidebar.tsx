"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { SectionMeta } from "@/lib/sections";
import { useProgress } from "@/context/ProgressContext";
import { useLang } from "@/context/LangContext";
import { strings } from "@/lib/i18n";
import { sectionTitlesAr } from "@/lib/sectionTitles.ar";

const otherCourses = [
  {
    name: "React 19",
    href: "https://mostafasaqly.github.io/vue-saqly-v3/#section-1",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="#61DAFB">
        <circle cx="12" cy="12" r="2.2" />
        <g fill="none" stroke="#61DAFB" strokeWidth="1">
          <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        </g>
      </svg>
    ),
  },
  {
    name: "Angular 22",
    href: "https://mostafasaqly.github.io/angular-saqly-v22/section/1",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
        <path fill="#DD0031" d="M12 1.5 2 5l1.5 13L12 22.5 20.5 18 22 5 12 1.5Z" />
        <path
          fill="#fff"
          d="M12 3.6 10.5 7h3L12 3.6ZM12 3.6v15.9l6.5-3.6L20 5.6 12 3.6ZM9 14.5h6l-1-2.5H10l-1 2.5Zm.6-1.5H12l1.4-3.5L9.6 13Z"
        />
      </svg>
    ),
  },
  {
    name: "Vue 3",
    href: "https://mostafasaqly.github.io/vue-saqly-v3/#section-1",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
        <path fill="#41B883" d="M14 2 12 5.5 10 2H2l10 17L22 2h-8Z" />
        <path fill="#35495E" d="M14 2 12 5.5 10 2H6.5l5.5 9.5L17.5 2H14Z" />
      </svg>
    ),
  },
];

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

        <div className="mb-4 flex items-center gap-3 px-2">
          {otherCourses.map((course) => (
            <a
              key={course.name}
              href={course.href}
              target="_blank"
              rel="noopener noreferrer"
              title={course.name}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              {course.icon}
            </a>
          ))}
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
