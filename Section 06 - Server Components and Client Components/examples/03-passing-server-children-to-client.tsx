// app/components/Modal.tsx
"use client";

import { useState } from "react";
import type { ReactNode } from "react";

// A Client Component can still accept a Server Component as `children` —
// the Server Component is rendered on the server and passed down as
// already-rendered content, so it doesn't need to become a Client Component itself.
export default function Modal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <div className="modal">{children}</div>}
    </>
  );
}

// app/page.tsx
import Modal from "./components/Modal";
import ServerRenderedStats from "./components/ServerRenderedStats"; // a Server Component

export default function HomePage() {
  return (
    <Modal>
      <ServerRenderedStats />
    </Modal>
  );
}
