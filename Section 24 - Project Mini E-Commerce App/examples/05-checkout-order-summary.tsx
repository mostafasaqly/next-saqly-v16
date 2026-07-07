// app/checkout/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/checkout"); // require login before checkout

  return <CheckoutForm />;
}

// components/OrderSummary.tsx
"use client";

import { useCartStore } from "@/lib/store/cartStore";

const TAX_RATE = 0.08;

export default function OrderSummary() {
  const items = useCartStore((state) => state.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div>
      <p>Subtotal: ${subtotal.toFixed(2)}</p>
      <p>Tax: ${tax.toFixed(2)}</p>
      <p><strong>Total: ${total.toFixed(2)}</strong></p>
    </div>
  );
}
