// app/admin/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard"); // not authorized for this role

  return <h1>Admin Panel</h1>;
}
