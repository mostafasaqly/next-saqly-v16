# القسم 7: التنسيق في Next.js

> **دورة Next.js** — القسم 7 من 25 · المستوى: مبتدئ

يدعم Next.js عدة أساليب تنسيق (styling) جنبًا إلى جنب — CSS العام (Global CSS)، وحدات CSS (CSS Modules)، وTailwind، والخطوط المستضافة ذاتيًا — دون الحاجة إلى أي إعداد لأداة التجميع (bundler).

📁 **الكود الخاص بهذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [CSS العام](#1-global-css)
2. [وحدات CSS](#2-css-modules)
3. [الأصناف الديناميكية](#3-dynamic-classes)
4. [إعداد Tailwind CSS](#4-tailwind-css-setup)
5. [التخطيط المتجاوب](#5-responsive-layout)
6. [الخطوط في Next.js](#6-fonts-in-nextjs)
7. [استخدام الخطوط المحلية](#7-using-local-fonts)
8. [أفضل ممارسات التنسيق](#8-styling-best-practices)

---

## 1. CSS العام

انظر [`examples/01-global-css.tsx`](./examples/01-global-css.tsx).

### الحل

استورد ورقة أنماط (stylesheet) عامة واحدة في التخطيط الجذري (root layout) — تُطبَّق على مستوى التطبيق بأكمله:

```tsx
// app/layout.tsx
import "./globals.css";
```

> ⚠️ **تحذير:** لا يمكن استيراد CSS العام إلا في التخطيط الجذري (أو ملف آخر من المستوى الأعلى)، وليس داخل مكونات متداخلة عشوائية — يفرض Next.js هذا لتجنب تسرب الأنماط غير المتوقع.

---

## 2. وحدات CSS

انظر [`examples/02-css-modules.tsx`](./examples/02-css-modules.tsx).

### المشكلة

تتصادم أسماء الأصناف (class names) العامة بسهولة بمجرد أن يحتوي المشروع على أكثر من بضعة مكونات — إذا عرَّف ملفان كلاهما `.card` فسيحدث تعارض.

### الحل

أي ملف باسم `*.module.css` يحصل تلقائيًا على أسماء أصناف محصورة النطاق (scoped):

```css
/* Card.module.css */
.card {
  border-radius: 12px;
  padding: 16px;
}
```

```tsx
import styles from "./Card.module.css";

export default function Card({ children }: { children: React.ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}
```

---

## 3. الأصناف الديناميكية

انظر [`examples/03-dynamic-classes.tsx`](./examples/03-dynamic-classes.tsx).

### الحل

استخدم أداة صغيرة مثل `clsx` لدمج أسماء الأصناف بشكل شرطي وبطريقة نظيفة:

```tsx
import clsx from "clsx";

export default function Badge({ status }: { status: "active" | "inactive" }) {
  return (
    <span className={clsx("badge", { "badge--active": status === "active" })}>
      {status}
    </span>
  );
}
```

---

## 4. إعداد Tailwind CSS

انظر [`examples/04-tailwind-usage.tsx`](./examples/04-tailwind-usage.tsx).

### الحل

اختيار "Yes" لـ Tailwind أثناء `create-next-app` يقوم بربط كل شيء تلقائيًا — تعمل أصناف الأدوات المساعدة (utility classes) فورًا في أي مكون:

```tsx
export default function Button({ children }: { children: React.ReactNode }) {
  return <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{children}</button>;
}
```

يتم تكوين رموز التصميم (design tokens) (ألوان مخصصة، تباعد) في `tailwind.config` إذا احتجت إلى توسيع الإعدادات الافتراضية.

---

## 5. التخطيط المتجاوب

انظر [`examples/05-responsive-layout.tsx`](./examples/05-responsive-layout.tsx).

### الحل

تطبق بادئات نقاط التوقف (breakpoint) في Tailwind (`sm:`, `md:`, `lg:`) الأنماط بشكل شرطي حسب عرض نافذة العرض (viewport):

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {children}
</div>
```

---

## 6. الخطوط في Next.js

انظر [`examples/06-next-font-google.tsx`](./examples/06-next-font-google.tsx).

### المشكلة

تحميل خطوط جوجل (Google Fonts) بالطريقة التقليدية (وسم `<link>`) يعني طلبًا في وقت التشغيل إلى خوادم جوجل، وغالبًا ما يظهر انزياح واضح في التخطيط (layout shift) عند تبديل الخط.

### الحل

يقوم `next/font` بتنزيل ملف الخط واستضافته ذاتيًا **في وقت البناء (build time)** — لا يوجد طلب خارجي في وقت التشغيل، وصفر انزياح في التخطيط:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 7. استخدام الخطوط المحلية

انظر [`examples/07-next-font-local.tsx`](./examples/07-next-font-local.tsx).

### الحل

يطبق `next/font/local` نفس التحسين على ملفات الخطوط الخاصة بك:

```tsx
import localFont from "next/font/local";

const myFont = localFont({ src: "./fonts/MyFont-Regular.woff2", variable: "--font-my-font" });
```

---

## 8. أفضل ممارسات التنسيق

- حافظ على `globals.css` بسيطًا — فقط عمليات إعادة الضبط (resets)، ومتغيرات CSS، والقواعد التي تخص التطبيق بأكمله فعليًا
- فضّل وحدات CSS أو Tailwind للأنماط على مستوى المكون لتجنب التعارضات العامة
- ضع أنماط المكون بجانبه في نفس المكان (`Card.tsx` + `Card.module.css` في نفس المجلد)
- استخدم دائمًا `next/font` بدلًا من وسوم `<link>` اليدوية للخطوط — فهو أفضل تمامًا من ناحية الأداء واستقرار التخطيط

> 💡 **نصيحة:** مزج Tailwind مع وحدات CSS في نفس المشروع أمر لا بأس به — استخدم Tailwind لمعظم التخطيط والتباعد، ووحدات CSS لأي شيء معقد جدًا بحيث يصعب التعبير عنه بأصناف الأدوات المساعدة.

---

## ✅ ملخص القسم

- CSS العام: استيراد واحد فقط في التخطيط الجذري
- وحدات CSS (`*.module.css`) تحصر نطاق أسماء الأصناف تلقائيًا، دون تعارضات
- تُركّب `clsx` (أو ما شابه) أسماء الأصناف الشرطية بشكل نظيف
- يُربط Tailwind تلقائيًا عبر `create-next-app`
- يستضيف `next/font` خطوط جوجل أو الخطوط المحلية ذاتيًا بدون أي طلبات في وقت التشغيل ودون انزياح في التخطيط

---

## Review Questions

1. **Why can't global CSS be imported inside a random nested component?**
   Next.js restricts global stylesheet imports to top-level files (like the root layout) because global CSS affects the whole page — allowing it anywhere would make style application unpredictable and hard to reason about.

2. **What problem does `next/font` solve that a traditional Google Fonts `<link>` tag doesn't?**
   `next/font` downloads and self-hosts the font at build time, avoiding a runtime network request to an external server and eliminating the layout shift that happens when a fallback font is swapped for the real one after it loads.

---

**السابق:** [القسم 6 — Server Components و Client Components](../Section%2006%20-%20Server%20Components%20and%20Client%20Components/README.md)
**التالي:** [القسم 8 — الأصول والصور والبيانات الوصفية (Assets, Images, and Metadata)](../Section%2008%20-%20Assets%20Images%20and%20Metadata/README.md)
