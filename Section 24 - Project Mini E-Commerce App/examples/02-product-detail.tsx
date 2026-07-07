// app/products/[id]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
      <AddToCartButton product={product} />
    </div>
  );
}
