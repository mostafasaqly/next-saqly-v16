import { notFound } from "next/navigation";
import { getAllSectionMeta, getSectionContent, getSectionQA } from "@/lib/sections";
import SectionClient from "./SectionClient";

export function generateStaticParams() {
  return getAllSectionMeta().map((section) => ({ slug: section.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const section = getSectionContent(slug, "en");
    return section ? { title: section.title } : {};
  });
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const en = getSectionContent(slug, "en");
  const ar = getSectionContent(slug, "ar");
  if (!en || !ar) notFound();

  const allSections = getAllSectionMeta();
  const index = allSections.findIndex((s) => s.slug === slug);
  const prev = index > 0 ? allSections[index - 1] : null;
  const next = index < allSections.length - 1 ? allSections[index + 1] : null;

  const bundle = {
    content: { en, ar },
    qa: { en: getSectionQA(en.id, "en"), ar: getSectionQA(en.id, "ar") },
    prev,
    next,
  };

  return <SectionClient bundle={bundle} />;
}
