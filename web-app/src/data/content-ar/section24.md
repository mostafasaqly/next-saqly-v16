# القسم 24: مشروع — تطبيق متجر إلكتروني مصغر (Mini E-Commerce App)

> **دورة Next.js** — القسم 24 من 25 · مشروع تطبيقي 4 من 4

المشروع التطبيقي الأخير: متجر صغير يحتوي على قوائم منتجات، سلة تسوق ثابتة (persistent cart)، وتدفق دفع (checkout) كامل يتطلب تسجيل الدخول ويحفظ الطلب في قاعدة البيانات — يجمع بين الأقسام 14 و16 و17.

📁 **الكود الخاص بهذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على المشروع](#1-project-overview)
2. [صفحة المنتجات](#2-products-page)
3. [صفحة تفاصيل المنتج](#3-product-details-page)
4. [واجهة سلة التسوق](#4-cart-ui)
5. [الإضافة إلى السلة](#5-add-to-cart)
6. [تحديث كمية السلة](#6-update-cart-quantity)
7. [الحذف من السلة](#7-remove-from-cart)
8. [صفحة الدفع (Checkout)](#8-checkout-page)
9. [ملخص الطلب](#9-order-summary)
10. [تكامل المصادقة](#10-authentication-integration)
11. [حفظ الطلبات](#11-saving-orders)
12. [مراجعة المشروع النهائية](#12-final-project-review)

---

## 1. نظرة عامة على المشروع

### ما الذي نبنيه

متجر يحتوي على:

- شبكة منتجات وصفحة تفاصيل
- سلة تسوق محفوظة (persisted) في المتصفح (عبر Zustand + localStorage)، بحيث تبقى بعد إعادة التحميل
- تدفق دفع يتطلب تسجيل الدخول ويحسب المجموع الفرعي/الضريبة/الإجمالي
- حفظ الطلب في قاعدة البيانات عند نجاح عملية الدفع

---

## 2. صفحة المنتجات

انظر [`examples/01-products-page.tsx`](./examples/01-products-page.tsx).

### الحل

يقوم مكون خادم (Server Component) بجلب جميع المنتجات وعرض شبكة من `ProductCard`.

---

## 3. صفحة تفاصيل المنتج

انظر [`examples/02-product-detail.tsx`](./examples/02-product-detail.tsx).

### الحل

مسار ديناميكي `[id]` يقوم بجلب منتج واحد، مع استدعاء `notFound()` إذا لم يكن موجودًا، وعرض `AddToCartButton`.

---

## 4. واجهة سلة التسوق

انظر [`examples/04-cart-ui.tsx`](./examples/04-cart-ui.tsx).

### الحل

يقوم مكون عميل (Client Component) بقراءة السلة من مخزن Zustand مشترك وعرض كل عنصر مع عناصر التحكم في الكمية ومجموع فرعي متجدد.

---

## 5. الإضافة إلى السلة

انظر [`examples/03-cart-store.ts`](./examples/03-cart-store.ts).

### المشكلة

تحتاج السلة إلى أن تكون مشتركة عبر التطبيق بأكمله (صفحة المنتج، صفحة السلة، الدفع) وأن تبقى بعد إعادة تحميل الصفحة — وهي حالة يفشل فيها كل من Context وحده (بدون ثبات) أو `useState` المحلي (بدون مشاركة).

### الحل

مخزن Zustand مع middleware باسم `persist`، مدعوم بـ `localStorage`:

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

## 6. تحديث كمية السلة

### الحل

تقوم `updateQuantity(id, quantity)` في المخزن (الموضح أعلاه) بتحديث كمية عنصر واحد، مدفوعة بحقل إدخال رقمي في واجهة السلة.

---

## 7. الحذف من السلة

### الحل

تقوم `removeItem(id)` بتصفية العنصر من مصفوفة `items` الخاصة بالمخزن.

---

## 8. صفحة الدفع (Checkout)

انظر [`examples/05-checkout-order-summary.tsx`](./examples/05-checkout-order-summary.tsx).

### الحل

تتحقق صفحة الدفع من وجود جلسة قبل عرض النموذج، وتُعيد توجيه المستخدمين غير المصادَق عليهم لتسجيل الدخول أولًا (مع معامل `next` بحيث يعودون إلى صفحة الدفع بعد تسجيل الدخول):

```tsx
export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/checkout");
  return <CheckoutForm />;
}
```

---

## 9. ملخص الطلب

انظر [`examples/05-checkout-order-summary.tsx`](./examples/05-checkout-order-summary.tsx).

### الحل

احسب المجموع الفرعي والضريبة والإجمالي من جانب العميل من مخزن السلة للحصول على استجابة فورية عند تغيير الكميات:

```tsx
const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
const tax = subtotal * TAX_RATE;
const total = subtotal + tax;
```

---

## 10. تكامل المصادقة

### الحل

إعادة استخدام نمط الجلسة/الكوكيز من [القسم 14](../Section%2014%20-%20Authentication/README.md) — صفحة الدفع هي المكان الوحيد في هذا التطبيق الذي يتطلب مستخدمًا مسجل الدخول.

---

## 11. حفظ الطلبات

انظر [`examples/06-save-order-action.ts`](./examples/06-save-order-action.ts).

### الحل

يقوم Server Action بحفظ الطلب المكتمل، مرتبطًا بجلسة المستخدم المصادَق عليه:

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

## 12. مراجعة المشروع النهائية

### ملخص البنية المعمارية

- **المنتجات** — مكونات خادم، البيانات مباشرة من Prisma
- **السلة** — Zustand مع middleware باسم `persist`، من جانب العميل فقط، تبقى بعد إعادة التحميل
- **الدفع** — محمي بفحص الجلسة، يحسب الإجماليات من جانب العميل لتحقيق الاستجابة
- **حفظ الطلب** — Server Action واحد يكتب الطلب وعناصره بشكل ذري (atomically) عبر `create` المتداخل في Prisma

### اعتبارات التوسع

- إضافة تكامل مزود دفع (Stripe) في خطوة `placeOrder`
- نقل حساب الضريبة إلى جانب الخادم إذا أصبحت قواعد الضريبة تعتمد على الولاية القضائية
- إضافة فحوصات المخزون داخل `placeOrder` قبل تأكيد الطلب، لمنع البيع الزائد (overselling)

---

## ✅ ملخص القسم

- تعيش حالة السلة في Zustand مع `persist`، مما يوفر مشاركة عبر الصفحات وثباتًا في localStorage في مخزن واحد
- يتطلب الدفع مصادقة، مع إعادة التوجيه لتسجيل الدخول مع معامل `next` للعودة بعد ذلك
- يتم حساب إجماليات الطلب (المجموع الفرعي/الضريبة/الإجمالي) من مخزن السلة لاستجابة فورية في الواجهة
- `placeOrder` هو Server Action واحد يحفظ الطلب وعناصره معًا، مرتبطًا بمستخدم الجلسة

---

## Review Questions

1. **Why use Zustand with `persist` for the cart instead of React Context?**
   Context alone doesn't survive a page reload — its state resets to the provider's initial value. Zustand's `persist` middleware automatically syncs the store to `localStorage`, so the cart remains intact even after a full page refresh or browser restart.

2. **Why does the checkout page redirect to `/login?next=/checkout` instead of just `/login`?**
   The `next` param lets the login flow know where to send the user back to after a successful login, so they land back on checkout instead of an arbitrary default page — preserving their original intent.

---

**السابق:** [Section 23 — Project: Full Stack CRUD App](../Section%2023%20-%20Project%20Full%20Stack%20CRUD%20App/README.md)
**التالي:** [Section 25 — Final Review and Next Steps](../Section%2025%20-%20Final%20Review%20and%20Next%20Steps/README.md)
