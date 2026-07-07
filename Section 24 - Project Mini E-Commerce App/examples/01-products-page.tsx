// app/products/page.tsx
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default async function ProductsPage() {
  const products = await db.product.findMany();

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
