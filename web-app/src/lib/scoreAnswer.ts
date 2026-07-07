function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'`]/g, "")
    .trim();
}

export function scoreAnswer(userAnswer: string, correctAnswer: string): number {
  const userWords = new Set(normalize(userAnswer).split(/\s+/).filter((w) => w.length >= 3));
  const correctWords = normalize(correctAnswer)
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  if (correctWords.length === 0) return 0;

  const hits = correctWords.filter((w) => userWords.has(w)).length;
  const denom = Math.min(correctWords.length, 8);

  return Math.min(100, Math.round((hits / denom) * 100));
}
