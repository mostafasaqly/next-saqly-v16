// app/products/page.tsx
// Server Component: read searchParams (also async in Next.js 16)

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page = "1" } = await searchParams;

  return (
    <p>
      Category: {category ?? "all"} — Page: {page}
    </p>
  );
}
