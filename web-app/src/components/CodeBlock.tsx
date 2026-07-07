"use client";

import { useMemo, useState } from "react";
import { tokenize } from "@/lib/highlight";
import { useLang } from "@/context/LangContext";

const LABELS = {
  en: { copy: "Copy", copied: "✓ Copied", error: "✗ Failed" },
  ar: { copy: "نسخ", copied: "✓ تم النسخ", error: "✗ فشل النسخ" },
};

export default function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const tokens = useMemo(() => tokenize(code), [code]);
  const { lang } = useLang();
  const t = LABELS[lang];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  const label = status === "idle" ? t.copy : status === "copied" ? t.copied : t.error;

  return (
    <div dir="ltr" className="my-4 ml-1 overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          {filename && <span className="font-mono text-xs text-neutral-400">{filename}</span>}
        </div>
        <button
          onClick={handleCopy}
          aria-label={t.copy}
          className={
            "rounded-md border px-2.5 py-0.5 text-xs transition-colors " +
            (status === "copied"
              ? "border-green-500/40 bg-green-500/15 text-green-400"
              : status === "error"
              ? "border-red-500/40 bg-red-500/15 text-red-400"
              : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:bg-blue-600 hover:text-white")
          }
        >
          {label}
        </button>
      </div>
      <pre className="m-0 py-4! pl-8! pr-6! text-[14.5px] leading-relaxed">
        <code className="whitespace-pre-wrap wrap-break-word text-[#e6edf3]">
          {tokens.map((tok, i) => (
            <span key={i} className={`tok-${tok.type}`}>
              {tok.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
