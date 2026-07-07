import fs from "fs";
import path from "path";
import matter from "gray-matter";

// The 25 course sections live as sibling folders one level above web-app/,
// each named "Section NN - Title" with a README.md and an examples/ folder.
const SECTIONS_ROOT = path.join(process.cwd(), "..");

export interface SectionMeta {
  id: number;
  slug: string;
  folderName: string;
  title: string;
}

export interface ExampleFile {
  name: string;
  code: string;
}

export interface SectionContent extends SectionMeta {
  markdown: string;
  examples: ExampleFile[];
  metaLine: SectionMetaLine | null;
  toc: TocItem[];
}

export interface QAItem {
  question: string;
  answer: string;
}

function listSectionFolders(): string[] {
  return fs
    .readdirSync(SECTIONS_ROOT)
    .filter((name) => /^Section \d{2} - /.test(name))
    .sort();
}

function parseFolderName(folderName: string): { id: number; title: string } {
  const match = folderName.match(/^Section (\d{2}) - (.+)$/);
  if (!match) throw new Error(`Unexpected section folder name: ${folderName}`);
  return { id: Number(match[1]), title: match[2] };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getAllSectionMeta(): SectionMeta[] {
  return listSectionFolders().map((folderName) => {
    const { id, title } = parseFolderName(folderName);
    return { id, slug: slugify(title), folderName, title };
  });
}

export function getSectionMetaBySlug(slug: string): SectionMeta | undefined {
  return getAllSectionMeta().find((s) => s.slug === slug);
}

export type ContentLang = "en" | "ar";

function readExamples(folderName: string): ExampleFile[] {
  const examplesDir = path.join(SECTIONS_ROOT, folderName, "examples");
  if (!fs.existsSync(examplesDir)) return [];
  return fs
    .readdirSync(examplesDir)
    .sort()
    .filter((name) => fs.statSync(path.join(examplesDir, name)).isFile())
    .map((name) => ({
      name,
      code: fs.readFileSync(path.join(examplesDir, name), "utf-8"),
    }));
}

export interface SectionMetaLine {
  segments: string[];
}

export interface TocItem {
  label: string;
  anchor: string;
}

function stripTitle(content: string): string {
  return content.replace(/^#\s+.+\n/, "").trimStart();
}

function stripMetaLine(content: string): { content: string; meta: SectionMetaLine | null } {
  const match = content.match(/^> \*\*.+?\*\*\s*—\s*(.+)$/m);
  if (!match) return { content, meta: null };
  const segments = match[1].split("·").map((s) => s.trim());
  return { content: content.replace(match[0], "").trimStart(), meta: { segments } };
}

function extractToc(content: string): TocItem[] {
  const tocMatch = content.match(/^## (?:Table of Contents|جدول المحتويات)\n([\s\S]*?)(?=\n---\n|\n## |$(?![\s\S]))/m);
  if (!tocMatch) return [];
  const items: TocItem[] = [];
  const lineRe = /^\d+\.\s*\[(.+?)\]\(#(.+?)\)/gm;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(tocMatch[1]))) {
    items.push({ label: m[1], anchor: m[2] });
  }
  return items;
}

function stripQASection(content: string): string {
  // Review Questions are rendered separately via the interactive QABlock,
  // so strip that section out of the plain markdown body.
  return content.replace(/## (Review Questions|أسئلة المراجعة)\n[\s\S]*?(?=\n---\n|$)/, "");
}

function stripToc(content: string): string {
  // The TOC is rendered separately as a styled lesson list, so strip the raw markdown version.
  return content.replace(/## (?:Table of Contents|جدول المحتويات)\n[\s\S]*?(?=\n---\n|\n## |$)/, "");
}

export function getSectionContent(slug: string, lang: ContentLang = "en"): SectionContent | null {
  const meta = getSectionMetaBySlug(slug);
  if (!meta) return null;

  const idPadded = String(meta.id).padStart(2, "0");

  if (lang === "ar") {
    const arPath = path.join(process.cwd(), "src", "data", "content-ar", `section${idPadded}.md`);
    if (fs.existsSync(arPath)) {
      const raw = fs.readFileSync(arPath, "utf-8");
      const { content: withoutMeta, meta: metaLine } = stripMetaLine(stripTitle(raw));
      const toc = extractToc(withoutMeta);
      const markdown = stripToc(stripQASection(withoutMeta));
      return { ...meta, markdown, examples: readExamples(meta.folderName), metaLine, toc };
    }
    // fall through to English if no translation exists yet for this section
  }

  const readmePath = path.join(SECTIONS_ROOT, meta.folderName, "README.md");
  if (!fs.existsSync(readmePath)) return null;

  const raw = fs.readFileSync(readmePath, "utf-8");
  const { content } = matter(raw);
  const { content: withoutMeta, meta: metaLine } = stripMetaLine(stripTitle(content));
  const toc = extractToc(withoutMeta);
  const markdown = stripToc(stripQASection(withoutMeta));

  return { ...meta, markdown, examples: readExamples(meta.folderName), metaLine, toc };
}

export function getSectionQA(id: number, lang: ContentLang = "en"): QAItem[] {
  const idPadded = String(id).padStart(2, "0");

  if (lang === "ar") {
    const arPath = path.join(process.cwd(), "src", "data", "qa-ar", `section${idPadded}.json`);
    if (fs.existsSync(arPath)) {
      return JSON.parse(fs.readFileSync(arPath, "utf-8"));
    }
  }

  const qaPath = path.join(process.cwd(), "src", "data", "qa", `section${idPadded}.json`);
  if (!fs.existsSync(qaPath)) return [];
  return JSON.parse(fs.readFileSync(qaPath, "utf-8"));
}
