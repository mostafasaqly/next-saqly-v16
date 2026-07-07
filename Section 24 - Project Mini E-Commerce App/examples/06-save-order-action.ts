// app/actions/orders.ts
"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

interface CartItemInput {
  productId: string;
  quantity: number;
  price: number;
}

export async function placeOrder(items: CartItemInput[]) {
  const session = await getSession();
  if (!session) redirect("/login");

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await db.order.create({
    data: {
      userId: session.userId,
      total,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
  });

  redirect(`/orders/${order.id}/confirmation`);
}
