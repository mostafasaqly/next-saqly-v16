# القسم 4: أساسيات App Router

> **كورس Next.js** — القسم 4 من 25 · المستوى: مبتدئ

يغطي هذا القسم الملفات الخاصة التي تمنح App Router سلوكه: `page`، `layout`، `template`، `loading`، `error`، و`not-found`. معاً، تتيح لك بناء واجهات متداخلة، ومجموعات مسارات (route groups)، وحالات تحميل/خطأ فورية بالاعتماد فقط على اصطلاحات الملفات.

📁 **كود هذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [فهم مجلد `app`](#1-فهم-مجلد-app)
2. [إنشاء صفحتك الأولى](#2-إنشاء-صفحتك-الأولى)
3. [إنشاء مسارات متداخلة](#3-إنشاء-مسارات-متداخلة)
4. [إنشاء تخطيطات مشتركة](#4-إنشاء-تخطيطات-مشتركة)
5. [التخطيط الجذري (Root Layout)](#5-التخطيط-الجذري-root-layout)
6. [التخطيطات المتداخلة](#6-التخطيطات-المتداخلة)
7. [القوالب (Templates)](#7-القوالب-templates)
8. [مجموعات المسارات (Route Groups)](#8-مجموعات-المسارات-route-groups)
9. [صفحات غير موجودة (Not Found)](#9-صفحات-غير-موجودة-not-found)
10. [واجهة التحميل (Loading UI)](#10-واجهة-التحميل-loading-ui)

---

## 1. فهم مجلد `app`

### المشكلة

بدون اصطلاح مشترك، يخترع كل فريق تنظيمه الخاص للمسارات، وحالات التحميل، وحدود الأخطاء (error boundaries) — مما يصعّب الانتقال بين المشاريع.

### الحل

يحجز Next.js أسماء ملفات محددة داخل `app/` يتحكم كل منها في جزء واحد من سلوك المسار:

| الملف | الغرض |
|---|---|
| `page.tsx` | واجهة المسار |
| `layout.tsx` | واجهة مشتركة تُغلّف هذا المسار وأبناءه |
| `template.tsx` | مثل layout، لكنه يُعاد تركيبه (re-mounts) عند التنقل |
| `loading.tsx` | واجهة تحميل فورية (حدود Suspense) |
| `error.tsx` | حدود خطأ (error boundary) لهذا الجزء من المسار |
| `not-found.tsx` | واجهة 404 مخصصة |

---

## 2. إنشاء صفحتك الأولى

### الحل

```tsx
// app/page.tsx
export default function HomePage() {
  return <h1>Homepage</h1>;
}
```

هذا وحده يجعل `/` يعرض `<h1>Homepage</h1>`.

---

## 3. إنشاء مسارات متداخلة

### الحل

المجلدات المتداخلة تُنشئ أجزاء رابط (URL) متداخلة تلقائياً:

```text
app/
└── blog/
    └── page.tsx    →  /blog
```

لا حاجة لإعداد موجّه (router) — هيكل المجلدات *هو* جدول المسارات.

---

## 4. إنشاء تخطيطات مشتركة

### المشكلة

لا ينبغي نسخ ولصق الرأس (header) والتذييل (footer) في كل `page.tsx`.

### الحل

ضع `layout.tsx` في مجلد أب مشترك — كل مسار متداخل تحته يُعرَض تلقائياً داخل ذلك التخطيط.

---

## 5. التخطيط الجذري (Root Layout)

### المشكلة

كل مستند HTML يحتاج بالضبط وسم `<html>` واحداً و`<body>` واحداً — لكن أين ينبغي أن يوجد ذلك في شجرة مكونات بها تخطيطات متداخلة كثيرة؟

### الحل

**التخطيط الجذري (root layout)** في `app/layout.tsx` إلزامي وهو التخطيط الوحيد المسموح له بعرض `<html>`/`<body>`:

```tsx
// app/layout.tsx
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

> ⚠️ **تحذير:** سيصدر Next.js خطأً إذا حاولت عرض `<html>` أو `<body>` في تخطيط متداخل (غير جذري).

---

## 6. التخطيطات المتداخلة

انظر [`examples/03-nested-layout.tsx`](./examples/03-nested-layout.tsx).

### الحل

التخطيطات الفرعية تتركّب داخل التخطيطات الأب، بحيث يمكن لأقسام مختلفة من تطبيقك أن تملك عناصر واجهة مميزة:

```tsx
// app/dashboard/layout.tsx — nests inside the root layout
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-shell">
      <nav>Dashboard Sidebar</nav>
      <section>{children}</section>
    </div>
  );
}
```

الآن كل مسار تحت `app/dashboard/` يُعرَض داخل غلاف الشريط الجانبي هذا، بالإضافة إلى التخطيط الجذري.

---

## 7. القوالب (Templates)

انظر [`examples/05-template.tsx`](./examples/05-template.tsx).

### المشكلة

`layout.tsx` يبقى ثابتاً عبر التنقل — الحالة بداخله لا تُعاد تهيئتها، ورسوم التحريك عند التركيب (mount animations) لا تُعاد تشغيلها عند الانتقال بين مسارات شقيقة.

### الحل

يتصرف `template.tsx` مثل التخطيط لكنه **يُعاد تركيبه في كل عملية تنقل**، مفيد لرسوم تحريك الدخول/الخروج أو إعادة تهيئة الحالة المحلية عند كل زيارة للصفحة:

```tsx
// app/template.tsx
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
```

> 💡 **نصيحة:** اعتمد افتراضياً على `layout.tsx`. استخدم `template.tsx` فقط عندما تحتاج تحديداً إلى سلوك إعادة التركيب.

---

## 8. مجموعات المسارات (Route Groups)

انظر [`examples/04-route-groups.txt`](./examples/04-route-groups.txt).

### المشكلة

تريد تخطيطات مختلفة لصفحات التسويق مثلاً مقابل صفحات التطبيق المصادَق عليها — لكن أسماء المجلدات لا ينبغي أن تتسرب إلى الرابط (URL).

### الحل

ضع اسم المجلد بين قوسين، مثل `(marketing)`، وسيستثنيه Next.js من الرابط بينما لا يزال يستخدمه لتحديد نطاق تخطيط:

```text
app/
├── (marketing)/
│   ├── layout.tsx
│   └── page.tsx         →  /
└── (app)/
    ├── layout.tsx
    └── dashboard/
        └── page.tsx       →  /dashboard
```

---

## 9. صفحات غير موجودة (Not Found)

انظر [`examples/01-not-found.tsx`](./examples/01-not-found.tsx) و[`examples/06-not-found-trigger.tsx`](./examples/06-not-found-trigger.tsx).

### المشكلة

الروابط غير المتطابقة والموارد المفقودة (مثل منتج محذوف) تحتاج كلاهما إلى صفحة 404 ودية، لا خطأ خام.

### الحل

عرّف `app/not-found.tsx` لواجهة 404 الافتراضية، واستدعِ `notFound()` يدوياً عندما يعود البحث عن مورد فارغاً:

```tsx
// app/not-found.tsx
export default function NotFound() {
  return <h2>404 — Page Not Found</h2>;
}
```

```tsx
// app/products/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return <h1>{product.name}</h1>;
}
```

---

## 10. واجهة التحميل (Loading UI)

انظر [`examples/02-loading.tsx`](./examples/02-loading.tsx).

### المشكلة

جلب بيانات بطيء يترك المستخدمين ينظرون إلى شاشة فارغة بدون أي ملاحظة.

### الحل

أضف `loading.tsx` بجانب `page.tsx` وسيغلّفه Next.js تلقائياً بحدود `<Suspense>`، معروضاً واجهة التحميل فوراً بينما يتم بث المحتوى الحقيقي:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <p>Loading dashboard…</p>;
}
```

> 💡 **نصيحة:** يُطبَّق `loading.tsx` لكل جزء من المسار — يمكن لكل مسار متداخل أن يملك واحداً خاصاً به، بحيث يظهر مؤشر التحميل فقط للجزء البطيء من الصفحة.

---

## ✅ ملخص القسم

- أسماء الملفات الخاصة (`page`، `layout`، `template`، `loading`، `error`، `not-found`) تُحدّد سلوك المسار عبر الاصطلاح
- يجب وجود `layout.tsx` جذري واحد بالضبط وهو المكان الوحيد الذي يمكن فيه عرض `<html>`/`<body>`
- التخطيطات المتداخلة تتركّب؛ `template.tsx` يُعاد تركيبه بدلاً من البقاء ثابتاً
- مجموعات المسارات `(name)` تنظّم الملفات دون إضافة جزء إلى الرابط (URL)
- يمنح `loading.tsx` ملاحظة فورية عبر حدود Suspense تلقائية؛ ويتعامل `not-found.tsx` مع `notFound()` مع الموارد المفقودة

---

## Review Questions

1. **Why is the root layout special compared to nested layouts?**
   It's the only layout allowed to render `<html>` and `<body>`, since a document can only have one of each — nested layouts just return ordinary JSX that composes inside it.

2. **When would you use `template.tsx` instead of `layout.tsx`?**
   When you need the wrapper to re-mount on every navigation — for exit/enter animations or to reset local component state each time the user visits, which `layout.tsx` won't do since it persists across navigations.

3. **What's the difference between the default 404 behavior and calling `notFound()` manually?**
   The default `not-found.tsx` renders automatically for URLs that don't match any route. Calling `notFound()` inside a page triggers that same UI on demand — useful when the *route* matches (e.g. `/products/123`) but the underlying data doesn't exist.

---

**السابق:** [القسم 3 — أساسيات Next.js](../Section%2003%20-%20Next.js%20Fundamentals/README.md)
**التالي:** [القسم 5 — التنقل والتوجيه](../Section%2005%20-%20Navigation%20and%20Routing/README.md)
