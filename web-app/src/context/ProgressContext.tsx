"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ProgressContextValue {
  completed: number[];
  isComplete: (id: number) => boolean;
  toggleComplete: (id: number) => void;
  percent: (total: number) => number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("progress");
    if (stored) {
      try {
        setCompleted(JSON.parse(stored));
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("progress", JSON.stringify(completed));
  }, [completed]);

  function isComplete(id: number) {
    return completed.includes(id);
  }

  function toggleComplete(id: number) {
    setCompleted((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function percent(total: number) {
    if (total === 0) return 0;
    return Math.round((completed.length / total) * 100);
  }

  return (
    <ProgressContext.Provider value={{ completed, isComplete, toggleComplete, percent }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
