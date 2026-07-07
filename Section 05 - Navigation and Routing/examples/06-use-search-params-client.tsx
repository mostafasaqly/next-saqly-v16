// app/components/SearchBox.tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function SearchBox() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) params.set("q", term);
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <input
      defaultValue={searchParams.get("q") ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Search…"
    />
  );
}
