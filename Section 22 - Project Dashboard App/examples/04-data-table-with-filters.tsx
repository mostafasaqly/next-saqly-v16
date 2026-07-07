// app/(dashboard)/dashboard/customers/page.tsx
import { getCustomers } from "@/lib/customers";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const { query = "", page = "1" } = await searchParams;
  const { customers, totalPages } = await getCustomers(query, Number(page));

  return (
    <div>
      {/* SearchInput is a small Client Component that updates ?query= in the URL */}
      <SearchInput defaultValue={query} />
      <table>
        <thead><tr><th>Name</th><th>Email</th></tr></thead>
        <tbody>
          {customers.map((c: { id: string; name: string; email: string }) => (
            <tr key={c.id}><td>{c.name}</td><td>{c.email}</td></tr>
          ))}
        </tbody>
      </table>
      <p>Page {page} of {totalPages}</p>
    </div>
  );
}
