"use client";

import Link from "next/link";
import Markdown from "@/components/Markdown";
import SectionFooter from "@/components/SectionFooter";
import CodeBlock from "@/components/CodeBlock";
import { strings } from "@/lib/i18n";
import { useLang } from "@/context/LangContext";
import type { SectionContent, SectionMeta, QAItem, ContentLang } from "@/lib/sections";

export interface SectionBundle {
  content: Record<ContentLang, SectionContent>;
  qa: Record<ContentLang, QAItem[]>;
  prev: SectionMeta | null;
  next: SectionMeta | null;
}

export default function SectionClient({ bundle }: { bundle: SectionBundle }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const section = bundle.content[lang];
  const qa = bundle.qa[lang];
  const t = strings[lang];
  const { prev, next } = bundle;

  return (
    <article dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-blue-600/15 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
          {isAr ? `القسم ${section.id}` : `Section ${section.id}`}
        </span>
        {section.metaLine?.segments
          .filter((seg) => !/^(Section|القسم)\s/.test(seg))
          .map((seg) => (
            <span
              key={seg}
              className="inline-flex items-center rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {seg}
            </span>
          ))}
      </div>

      <h1 className="mt-3 text-3xl font-bold text-neutral-900 dark:text-white">{section.title}</h1>

      {section.toc.length > 0 && (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t.lessonsInSection}</h2>
          <ol className="mt-2 space-y-1.5">
            {section.toc.map((item, i) => (
              <li key={item.anchor}>
                <a
                  href={`#${item.anchor}`}
                  className="text-sm text-neutral-700 hover:text-blue-600 hover:underline dark:text-neutral-300 dark:hover:text-blue-400"
                >
                  {i + 1}. {item.label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="prose dark:prose-invert mt-8 max-w-none prose-pre:bg-transparent prose-pre:p-0">
        <Markdown markdown={section.markdown} />
      </div>

      {section.examples.length > 0 && (
        <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {t.exampleFilesHeading} ({section.examples.length})
          </h2>
          <div dir="ltr" className="mt-2 space-y-4">
            {section.examples.map((file) => (
              <div key={file.name} id={`example-${file.name}`} className="scroll-mt-20">
                <p className="mb-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  examples/{file.name}
                </p>
                <CodeBlock code={file.code} filename={file.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      <SectionFooter sectionId={section.id} qa={qa} />

      <nav className="mt-10 flex justify-between border-t border-neutral-200 pt-6 text-sm dark:border-neutral-800">
        {prev ? (
          <Link href={`/sections/${prev.slug}`} className="text-blue-600 hover:underline dark:text-blue-400">
            {isAr ? `→ ${prev.title}` : `← ${prev.title}`}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/sections/${next.slug}`} className="text-blue-600 hover:underline dark:text-blue-400">
            {isAr ? `${next.title} ←` : `${next.title} →`}
          </Link>
        )}
      </nav>
    </article>
  );
}
