// app/cart/page.tsx
"use client";

import { useCartStore } from "@/lib/store/cartStore";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      {items.map((item) => (
        <div key={item.id} className="cart-row">
          <span>{item.name}</span>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
          />
          <span>${(item.price * item.quantity).toFixed(2)}</span>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <p>Subtotal: ${subtotal.toFixed(2)}</p>
    </div>
  );
}
