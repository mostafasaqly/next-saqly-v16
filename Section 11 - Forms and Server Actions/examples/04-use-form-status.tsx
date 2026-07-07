// app/components/SubmitButton.tsx
"use client";

import { useFormStatus } from "react-dom";

// Must be rendered INSIDE the <form>, not the same component as the form itself,
// since useFormStatus reads the status of the nearest parent <form>.
export default function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>;
}
