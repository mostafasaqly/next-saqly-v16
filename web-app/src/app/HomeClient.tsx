"use client";

import Link from "next/link";
import { useLang } from "@/context/LangContext";
import type { SectionMeta } from "@/lib/sections";

export default function HomeClient({ sections }: { sections: SectionMeta[] }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const first = sections[0];

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
        {isAr ? "كورس Next.js" : "Next.js Course"}
      </h1>
      <p className="mt-3 text-neutral-600 dark:text-neutral-400">
        {isAr
          ? "كورس مكثف من 25 قسماً يغطي App Router وServer Components وجلب البيانات والتخزين المؤقت والمصادقة وأربعة مشاريع عملية كاملة."
          : "A 25-section crash course covering the App Router, Server Components, data fetching, caching, auth, and four hands-on capstone projects."}
      </p>
      {first && (
        <Link
          href={`/sections/${first.slug}`}
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {isAr ? "ابدأ بالقسم الأول ←" : "Start with Section 1 →"}
        </Link>
      )}
    </div>
  );
}
