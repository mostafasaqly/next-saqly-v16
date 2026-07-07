# القسم 13: معالجة الأخطاء

> **دورة Next.js** — القسم 13 من 25 · المستوى: متوسط

يقوم Next.js بدمج حدود الأخطاء (error boundaries) الخاصة بـ React مع ملفات خاصة بحيث يكون لكل مستوى في التطبيق — جزء من المسار (route segment)، شجرة التخطيط بأكملها، استدعاء API، إرسال نموذج — طريقة محددة للفشل بشكل سلس.

📁 **الكود الخاص بهذا القسم:** راجع مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [نظرة عامة على معالجة الأخطاء](#1-error-handling-overview)
2. [ملف error.tsx](#2-errortsx)
3. [الأخطاء على مستوى المسار](#3-route-level-errors)
4. [الأخطاء العامة (Global Errors)](#4-global-errors)
5. [الدالة notFound()](#5-notfound)
6. [صفحة 404 مخصصة](#6-custom-404-page)
7. [التعامل مع أخطاء API](#7-handling-api-errors)
8. [التعامل مع أخطاء Server Action](#8-handling-server-action-errors)
9. [أفضل ممارسات حدود الأخطاء](#9-error-boundaries-best-practices)

---

## 1. نظرة عامة على معالجة الأخطاء

### الحل

يستخدم Next.js حدود الأخطاء الخاصة بـ React تحت الغطاء، ويكشفها عبر ملفات خاصة: `error.tsx` لكل جزء من المسار، و `global-error.tsx` عند الجذر، بالإضافة إلى `notFound()`/`not-found.tsx` لحالات المورد المفقود.

---

## 2. ملف error.tsx

راجع [`examples/01-error-boundary.tsx`](./examples/01-error-boundary.tsx).

### الحل

يقوم ملف `error.tsx` الشقيق تلقائيًا بتغليف جزء المسار الخاص به في حدود خطأ (error boundary). **يجب** أن يكون Client Component (حدود الأخطاء تعتمد على دورة حياة React المتاحة فقط على جانب العميل):

```tsx
"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong on the dashboard.</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

تقوم `reset()` بإعادة عرض الجزء (segment)، مما يمنح المستخدم إمكانية إعادة المحاولة دون إعادة تحميل الصفحة بالكامل.

---

## 3. الأخطاء على مستوى المسار

### الحل

يمكن لكل جزء متداخل تعريف `error.tsx` الخاص به — يُلتقط الخطأ في عمق صفحة فرعية من لوحة التحكم محليًا، دون هدم هيكل لوحة التحكم بأكمله المحيط به.

---

## 4. الأخطاء العامة (Global Errors)

راجع [`examples/02-global-error.tsx`](./examples/02-global-error.tsx).

### المشكلة

الخطأ الذي يُطلق من التخطيط الجذري نفسه ليس له حدود أب تلتقطه.

### الحل

يلتقط `app/global-error.tsx` الأخطاء التي تفلت من كل حدود متداخلة. ولأنه يستبدل التخطيط الجذري عند تفعيله، يجب أن يعرض عناصر `<html>`/`<body>` الخاصة به:

```tsx
"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <h2>A critical error occurred.</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
```

---

## 5. الدالة notFound()

راجع [`examples/03-not-found-custom.tsx`](./examples/03-not-found-custom.tsx).

### الحل

استدعِ `notFound()` من `next/navigation` عندما يتطابق المسار لكن المورد الأساسي غير موجود:

```tsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return <h1>{product.name}</h1>;
}
```

---

## 6. صفحة 404 مخصصة

### الحل

عرّف `app/not-found.tsx` لاستبدال واجهة 404 الافتراضية الخاصة بـ Next.js، وتُستخدم لكل من عناوين URL غير المتطابقة واستدعاءات `notFound()` اليدوية.

---

## 7. التعامل مع أخطاء API

### الحل

أرجع رموز حالة ذات معنى وحمولات أخطاء من Route Handlers — راجع [القسم 12](../Section%2012%20-%20Route%20Handlers%20and%20APIs/README.md#9-handling-errors) للاطلاع على النمط.

---

## 8. التعامل مع أخطاء Server Action

راجع [`examples/04-server-action-error-state.tsx`](./examples/04-server-action-error-state.tsx).

### الحل

التقط الأعطال داخل الـ action وأرجعها كجزء من حالة الـ action، ثم اعرض تلك الحالة في واجهة النموذج عبر `useActionState`:

```ts
"use server";
export async function deleteNote(prevState: unknown, id: string) {
  try {
    await db.note.delete({ where: { id } });
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Could not delete note. Please try again." };
  }
}
```

---

## 9. أفضل ممارسات حدود الأخطاء

- أبقِ `error.tsx` قريبًا من مكان حدوث الأعطال فعليًا — لا ينبغي لخطأ في مسار فرعي للوحة التحكم أن يُسقط لوحة التحكم بأكملها
- قدّم دائمًا مسارًا لإعادة المحاولة (`reset()`)، وليس مجرد رسالة خطأ بلا مخرج
- لا تدع أبدًا Server Action يُطلق خطأً غير معالَج إلى العميل — التقطه وأرجع حالة خطأ منظّمة
- احتفظ بـ `global-error.tsx` كملاذ أخير شامل؛ يجب التقاط معظم الأخطاء بواسطة `error.tsx` أكثر محلية

> ⚠️ **تحذير:** لا يلتقط `error.tsx` الأخطاء التي تُطلق داخل Server Actions أو Route Handlers المستدعاة من تلك الصفحة — تلك تحتاج إلى try/catch الخاص بها، لأنها تُنفَّذ خارج شجرة عرض React التي يغلفها حدود الخطأ.

---

## ✅ ملخص القسم

- يغلف `error.tsx` جزء المسار في حدود خطأ؛ ويجب أن يكون Client Component
- يُعد `global-error.tsx` الحدود الملاذ الأخير ويجب أن يعرض عناصر `<html>`/`<body>` الخاصة به
- تتعامل `notFound()` و `not-found.tsx` مع حالات "المسار متطابق، لكن المورد غير موجود"
- تحتاج أخطاء Server Action و Route Handler إلى try/catch صريح — حدود الأخطاء لا تلتقطها تلقائيًا
- حافظ على حدود الأخطاء دقيقة (granular) وقدّم دائمًا خيار إعادة المحاولة

---

## Review Questions

1. **Why must `error.tsx` be a Client Component?**
   Error boundaries rely on React lifecycle methods (`getDerivedStateFromError`/`componentDidCatch`-equivalent behavior) that only exist in the client rendering runtime — Server Components have no such mechanism since they don't re-render in the browser.

2. **Why doesn't a route's `error.tsx` automatically catch an error thrown inside a Server Action called from that route?**
   Server Actions execute as server-side function calls outside of the React component tree that the error boundary wraps — the boundary only catches errors thrown during rendering, so Server Action errors must be caught explicitly with try/catch and returned as state.

3. **When would `notFound()` be more appropriate than throwing a generic error?**
   When the route itself is valid but the specific resource being requested doesn't exist — like a deleted blog post — since `notFound()` renders a proper 404 UI instead of triggering the generic error boundary meant for unexpected failures.

---

**السابق:** [القسم 12 — معالجات المسارات وواجهات البرمجة](../Section%2012%20-%20Route%20Handlers%20and%20APIs/README.md)
**التالي:** [القسم 14 — المصادقة](../Section%2014%20-%20Authentication/README.md)
