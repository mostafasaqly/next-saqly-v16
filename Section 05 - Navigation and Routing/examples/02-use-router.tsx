// app/components/SaveButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function SaveButton() {
  const router = useRouter();

  async function handleSave() {
    await fetch("/api/save", { method: "POST" });
    router.push("/dashboard"); // programmatic navigation
    router.refresh();          // re-fetch server data for the current route
  }

  return <button onClick={handleSave}>Save</button>;
}
