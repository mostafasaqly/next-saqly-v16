"use client";

import { useState } from "react";
import { useLang } from "@/context/LangContext";
import { strings } from "@/lib/i18n";
import { scoreAnswer } from "@/lib/scoreAnswer";

type Mode = "idle" | "writing" | "checked" | "revealed";

export default function QABlock({ question, answer }: { question: string; answer: string }) {
  const { lang } = useLang();
  const t = strings[lang];

  const [mode, setMode] = useState<Mode>("idle");
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);

  function handleCheck() {
    setScore(scoreAnswer(userAnswer, answer));
    setMode("checked");
  }

  const label = score >= 70 ? t.great : score >= 40 ? t.good : t.reviewIt;
  const color = score >= 70 ? "text-green-400" : score >= 40 ? "text-yellow-400" : "text-red-400";

  return (
    <div
      role="region"
      aria-label={question}
      className="my-3 overflow-hidden rounded-lg border border-neutral-800"
    >
      <button
        onClick={() => setMode(mode === "idle" ? "writing" : "idle")}
        className="flex w-full items-center gap-2 bg-neutral-900 px-4 py-3 text-left text-sm font-medium text-neutral-200 hover:bg-neutral-800"
      >
        <span>❓</span>
        {question}
      </button>

      {mode !== "idle" && (
        <div className="space-y-3 border-t border-neutral-800 bg-neutral-950 p-4">
          {(mode === "writing" || mode === "checked") && (
            <>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t.typeYourAnswer}
                rows={3}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 p-2 text-sm text-neutral-200 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCheck}
                  disabled={!userAnswer.trim()}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  {t.check}
                </button>
                <button
                  onClick={() => setMode("revealed")}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
                >
                  {t.showAnswer}
                </button>
              </div>
            </>
          )}

          {mode === "checked" && (
            <p className={`text-sm font-medium ${color}`}>
              {score}% — {label}
            </p>
          )}

          {mode === "revealed" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {userAnswer.trim() && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-neutral-500">{t.yourAnswer}</p>
                  <p className="text-sm text-neutral-300">{userAnswer}</p>
                </div>
              )}
              <div>
                <p className="mb-1 text-xs font-semibold text-neutral-500">{t.correctAnswer}</p>
                <p className="text-sm text-neutral-300">{answer}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
