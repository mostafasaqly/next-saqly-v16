// app/products/[id]/page.tsx
// Manually trigger the nearest not-found.tsx when a resource doesn't exist.

import { notFound } from "next/navigation";

async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`);
  if (res.status === 404) return null;
  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound(); // renders the nearest not-found.tsx
  }

  return <h1>{product.name}</h1>;
}
