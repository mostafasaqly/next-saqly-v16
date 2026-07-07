// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>404 — Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

// app/products/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound(); // renders the nearest not-found.tsx
  return <h1>{product.name}</h1>;
}
