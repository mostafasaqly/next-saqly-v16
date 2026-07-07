"use client";

import { useProgress } from "@/context/ProgressContext";
import { useLang } from "@/context/LangContext";
import { strings } from "@/lib/i18n";
import QABlock from "./QABlock";
import type { QAItem } from "@/lib/sections";

export default function SectionFooter({ sectionId, qa }: { sectionId: number; qa: QAItem[] }) {
  const { isComplete, toggleComplete } = useProgress();
  const { lang } = useLang();
  const t = strings[lang];
  const done = isComplete(sectionId);

  return (
    <div className="mt-8 space-y-6">
      {qa.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold">{t.reviewQuestions}</h2>
          {qa.map((item, i) => (
            <QABlock key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      )}

      <button
        onClick={() => toggleComplete(sectionId)}
        className={
          "rounded-md px-4 py-2 text-sm font-medium transition-colors " +
          (done
            ? "bg-green-600/20 text-green-500 hover:bg-green-600/30"
            : "bg-blue-600 text-white hover:bg-blue-700")
        }
      >
        {done ? t.completed : t.markComplete}
      </button>
    </div>
  );
}
