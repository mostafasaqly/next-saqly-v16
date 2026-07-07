// app/products/page.tsx — filter state lives in the URL, not useState
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const products = await getProducts(category);

  return (
    <div>
      <p>Filter: {category ?? "all"}</p>
      <ul>{products.map((p: { id: string; name: string }) => <li key={p.id}>{p.name}</li>)}</ul>
    </div>
  );
}
// Because the filter lives in the URL (?category=shoes), the page is
// shareable and bookmarkable — reloading or sending the link preserves state.
