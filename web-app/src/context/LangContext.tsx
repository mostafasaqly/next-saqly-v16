"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Lang = "ar" | "en";

const LangContext = createContext<{ lang: Lang; toggle: () => void } | null>(null);

const STORAGE_KEY = "lang";

function readStoredLang(): Lang | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "ar" || value === "en" ? value : null;
}

export function LangProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    const stored = readStoredLang();
    if (stored && stored !== lang) setLang(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  function toggle() {
    const next = lang === "ar" ? "en" : "ar";
    setLang(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return <LangContext.Provider value={{ lang, toggle }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
