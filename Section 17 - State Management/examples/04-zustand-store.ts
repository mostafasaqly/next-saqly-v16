// lib/store/cartStore.ts
"use client";

import { create } from "zustand";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}));

// app/components/CartBadge.tsx
"use client";
import { useCartStore } from "@/lib/store/cartStore";

export default function CartBadge() {
  const itemCount = useCartStore((state) => state.items.length);
  return <span>{itemCount} items</span>;
}
