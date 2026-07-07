// app/components/Accordion.tsx
"use client";

import { useState } from "react";

export default function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}>{title}</button>
      {open && <div>{children}</div>}
    </div>
  );
}
