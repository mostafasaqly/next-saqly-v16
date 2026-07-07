# Section 24: Project — Mini E-Commerce App

> **Next.js Course** — Section 24 of 25 · Capstone Project 4 of 4

The final capstone project: a small storefront with product listings, a persistent cart, and a full checkout flow that requires login and saves the order to the database — pulling together Sections 14, 16, and 17.

📁 **Code for this section:** see the [`examples/`](./examples) folder.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Products Page](#2-products-page)
3. [Product Details Page](#3-product-details-page)
4. [Cart UI](#4-cart-ui)
5. [Add to Cart](#5-add-to-cart)
6. [Update Cart Quantity](#6-update-cart-quantity)
7. [Remove from Cart](#7-remove-from-cart)
8. [Checkout Page](#8-checkout-page)
9. [Order Summary](#9-order-summary)
10. [Authentication Integration](#10-authentication-integration)
11. [Saving Orders](#11-saving-orders)
12. [Final Project Review](#12-final-project-review)

---

## 1. Project Overview

### What we're building

A storefront with:

- A products grid and detail page
- A cart persisted in the browser (via Zustand + localStorage), so it survives reloads
- A checkout flow that requires login and calculates subtotal/tax/total
- Order persistence to the database on successful checkout

---

## 2. Products Page

See [`examples/01-products-page.tsx`](./examples/01-products-page.tsx).

### The solution

A Server Component fetches all products and renders a grid of `ProductCard`s.

---

## 3. Product Details Page

See [`examples/02-product-detail.tsx`](./examples/02-product-detail.tsx).

### The solution

A dynamic `[id]` route fetches a single product, calling `notFound()` if it doesn't exist, and renders an `AddToCartButton`.

---

## 4. Cart UI

See [`examples/04-cart-ui.tsx`](./examples/04-cart-ui.tsx).

### The solution

A Client Component reads the cart from a shared Zustand store and renders each line item with quantity controls and a running subtotal.

---

## 5. Add to Cart

See [`examples/03-cart-store.ts`](./examples/03-cart-store.ts).

### The problem

The cart needs to be shared across the whole app (product page, cart page, checkout) and survive page reloads — a case where Context alone (no persistence) or local `useState` (no sharing) both fall short.

### The solution

A Zustand store with the `persist` middleware, backing it with `localStorage`:

```ts
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return { items: state.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      // ...
    }),
    { name: "cart-storage" }
  )
);
```

---

## 6. Update Cart Quantity

### The solution

`updateQuantity(id, quantity)` in the store (shown above) updates one item's quantity, driven by a number input in the Cart UI.

---

## 7. Remove from Cart

### The solution

`removeItem(id)` filters the item out of the store's `items` array.

---

## 8. Checkout Page

See [`examples/05-checkout-order-summary.tsx`](./examples/05-checkout-order-summary.tsx).

### The solution

The checkout page checks for a session before rendering the form, redirecting unauthenticated users to log in first (with a `next` param so they return to checkout after logging in):

```tsx
export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/checkout");
  return <CheckoutForm />;
}
```

---

## 9. Order Summary

See [`examples/05-checkout-order-summary.tsx`](./examples/05-checkout-order-summary.tsx).

### The solution

Calculate subtotal, tax, and total client-side from the cart store for immediate feedback as quantities change:

```tsx
const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
const tax = subtotal * TAX_RATE;
const total = subtotal + tax;
```

---

## 10. Authentication Integration

### The solution

Reuses the session/cookie pattern from [Section 14](../Section%2014%20-%20Authentication/README.md) — the checkout page is the one place in this app that requires a logged-in user.

---

## 11. Saving Orders

See [`examples/06-save-order-action.ts`](./examples/06-save-order-action.ts).

### The solution

A Server Action persists the completed order, tied to the authenticated user's session:

```ts
"use server";
export async function placeOrder(items: CartItemInput[]) {
  const session = await getSession();
  if (!session) redirect("/login");

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = await db.order.create({
    data: {
      userId: session.userId,
      total,
      items: { create: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })) },
    },
  });

  redirect(`/orders/${order.id}/confirmation`);
}
```

---

## 12. Final Project Review

### Architecture recap

- **Products** — Server Components, data straight from Prisma
- **Cart** — Zustand + `persist` middleware, client-only, survives reloads
- **Checkout** — gated by session check, calculates totals client-side for responsiveness
- **Order persistence** — a single Server Action writes the order and its line items atomically via Prisma's nested `create`

### Scaling considerations

- Add payment provider integration (Stripe) at the `placeOrder` step
- Move tax calculation server-side if tax rules become jurisdiction-dependent
- Add inventory checks inside `placeOrder` before committing the order, to prevent overselling

---

## ✅ Section Summary

- Cart state lives in Zustand with `persist`, giving cross-page sharing and localStorage persistence in one store
- Checkout requires authentication, redirecting to login with a `next` param to return afterward
- Order totals (subtotal/tax/total) are calculated from the cart store for instant UI feedback
- `placeOrder` is a single Server Action that persists the order and its items together, tied to the session's user

---

## Review Questions

1. **Why use Zustand with `persist` for the cart instead of React Context?**
   Context alone doesn't survive a page reload — its state resets to the provider's initial value. Zustand's `persist` middleware automatically syncs the store to `localStorage`, so the cart remains intact even after a full page refresh or browser restart.

2. **Why does the checkout page redirect to `/login?next=/checkout` instead of just `/login`?**
   The `next` param lets the login flow know where to send the user back to after a successful login, so they land back on checkout instead of an arbitrary default page — preserving their original intent.

---

**Previous:** [Section 23 — Project: Full Stack CRUD App](../Section%2023%20-%20Project%20Full%20Stack%20CRUD%20App/README.md)
**Next:** [Section 25 — Final Review and Next Steps](../Section%2025%20-%20Final%20Review%20and%20Next%20Steps/README.md)
