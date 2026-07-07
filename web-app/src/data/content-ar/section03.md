# القسم 3: أساسيات Next.js

> **كورس Next.js** — القسم 3 من 25 · المستوى: مبتدئ

هذا هو الجوهر المفاهيمي لـ Next.js. بمجرد أن تفهم التوجيه القائم على الملفات (file-based routing)، والفرق بين Server Components و Client Components، واستراتيجيات العرض المختلفة، فإن كل ما سيأتي في الأقسام اللاحقة سيكون مجرد بناء فوق هذه الأفكار.

📁 **كود هذا القسم:** انظر مجلد [`examples/`](./examples).

---

## جدول المحتويات

1. [ما الذي يجعل Next.js مختلفاً؟](#1-ما-الذي-يجعل-nextjs-مختلفاً)
2. [React داخل Next.js](#2-react-داخل-nextjs)
3. [التوجيه القائم على الملفات](#3-التوجيه-القائم-على-الملفات)
4. [نظرة عامة على App Router](#4-نظرة-عامة-على-app-router)
5. [الصفحات والتخطيطات](#5-الصفحات-والتخطيطات)
6. [Server Components كإعداد افتراضي](#6-server-components-كإعداد-افتراضي)
7. [Client Components](#7-client-components)
8. [نظرة عامة على استراتيجيات العرض](#8-نظرة-عامة-على-استراتيجيات-العرض)

---

## 1. ما الذي يجعل Next.js مختلفاً؟

### المشكلة

React الخالصة (عبر Vite أو Create React App) تمنحك المكونات وشجرة DOM الافتراضية — لكن بدون توجيه، بدون عرض من الخادم، وبدون تحسين مدمج. سيتوجب عليك اختيار وربط موجّه (router)، ونمط لجلب البيانات، ومسار لمعالجة الصور، وأداة تجميع (bundler) بنفسك.

### الحل

Next.js **قائم على الاصطلاحات (convention-based)**: المجلدات والملفات تحت `app/` تصبح تلقائياً مسارات، وكل مكون يُعرَض من الخادم ما لم تختر خلاف ذلك، ويتم تحسين الصور/الخطوط/السكربتات دون إعدادات إضافية.

> 💡 **نصيحة:** فكّر في Next.js على أنه "React، بالإضافة إلى القرارات التي تنتهي معظم الفرق إلى اتخاذها على أي حال، مُتخذة نيابةً عنك."

---

## 2. React داخل Next.js

### المشكلة

إذا كانت Next.js لا تزال تعرض مكونات React، فما الذي يختلف فعلياً في *أين* و*متى* تعمل؟

### الحل

يغيّر Next.js **بيئة التنفيذ** لمكوناتك: بعضها يعمل على الخادم (أثناء الطلب أو وقت البناء)، وبعضها يعمل في المتصفح. هذه هي أهم فكرة جديدة يجب استيعابها — انظر القسمين 6 و7 للقواعد الدقيقة.

---

## 3. التوجيه القائم على الملفات

انظر [`examples/03-file-based-routing.txt`](./examples/03-file-based-routing.txt).

### المشكلة

في React الخالصة، تُثبّت مكتبة موجّه (router) (مثل React Router) وتُعرّف يدوياً كل مسار ومكونه.

### الحل

في App Router، المجلدات *هي* المسارات. أنشئ `app/about/page.tsx` ويصبح `/about` موجوداً — بدون إعداد موجّه، وبدون جدول مسارات يجب مزامنته.

```text
app/
├── page.tsx            →  /
├── about/
│   └── page.tsx         →  /about
└── blog/
    ├── page.tsx          →  /blog
    └── [slug]/
        └── page.tsx       →  /blog/:slug
```

> ⚠️ **تحذير:** فقط الملف المُسمّى حرفياً `page.tsx` (أو `.jsx`/`.js`) يصبح مساراً. الملفات الأخرى في نفس المجلد (مكونات، دوال مساعدة) لا تُعرَض كروابط (URLs) — هذا مقصود ويتيح لك وضع الكود المرتبط في نفس المكان.

---

## 4. نظرة عامة على App Router

### المشكلة

كان لدى Next.js تاريخياً نظاما توجيه: الأقدم Pages Router (`pages/`) والحالي App Router (`app/`). قد تشير الدروس القديمة إلى النظام القديم.

### الحل

**استخدم دائماً App Router** للمشاريع الجديدة — إنه النظام الحالي الموصى به، مبني حول React Server Components، والتخطيطات المتداخلة (nested layouts)، والتدفق (streaming). يستخدم هذا الكورس بالكامل App Router حصرياً.

---

## 5. الصفحات والتخطيطات

انظر [`examples/01-first-page.tsx`](./examples/01-first-page.tsx) و[`examples/02-root-layout.tsx`](./examples/02-root-layout.tsx).

### المشكلة

كل مسار يحتاج إلى واجهة مستخدم، ومعظم المسارات تشترك في عناصر عامة (headers، navigation) لا ينبغي تكرارها في كل ملف.

### الحل

يُعرّف `page.tsx` المحتوى الفريد للمسار؛ ويُغلّفه `layout.tsx` (وأي مسارات متداخلة) بواجهة مستخدم مشتركة تبقى ثابتة عبر التنقل دون إعادة تركيب (re-mounting).

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Next.js</h1>
      <p>This page is rendered on the server.</p>
    </main>
  );
}
```

```tsx
// app/layout.tsx — required at the root of every app
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

> 💡 **نصيحة:** `layout.tsx` الجذري هو *المكان الوحيد* المسموح فيه بعرض `<html>` و`<body>` — التخطيطات المتداخلة تُرجع فقط JSX الخاص بها المُغلِّف لـ `children`.

---

## 6. Server Components كإعداد افتراضي

### المشكلة

في React الخالصة، يُرسل كل مكون كود JavaScript الخاص به إلى المتصفح، سواء احتاج إلى تفاعلية أم لا — مما يضخّم حجم الحزمة (bundle) لمحتوى هو مجرد نص وتنسيق ثابت.

### الحل

في App Router، **كل مكون هو Server Component ما لم تختر خلاف ذلك**. تُعرَض Server Components على الخادم، ويمكنها الوصول مباشرة إلى موارد الخادم الخلفي (قواعد البيانات، نظام الملفات، الأسرار)، ولا ترسل أي كود JavaScript إلى العميل لذلك المكون.

```tsx
// This is a Server Component — no directive, no client JS shipped
export default async function PostList() {
  const posts = await db.post.findMany();
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

> ⚠️ **تحذير:** لا يمكنك استخدام `useState` أو `useEffect` أو واجهات برمجة المتصفح (browser APIs) داخل Server Component — فهو لا يعمل أبداً في المتصفح، لذا لا توجد حالة (state) للاحتفاظ بها ولا DOM لإرفاق مستمعي الأحداث (listeners) به.

---

## 7. Client Components

انظر [`examples/04-client-component.tsx`](./examples/04-client-component.tsx) و[`examples/05-server-renders-client.tsx`](./examples/05-server-renders-client.tsx).

### المشكلة

بعض الواجهات تحتاج فعلياً إلى تفاعلية — عداد، نموذج مع تحقق محلي (local validation)، قائمة منسدلة قابلة للتبديل — وهو ما يتطلب حالة ومعالجات أحداث تعمل في المتصفح.

### الحل

أضف `"use client"` في أعلى الملف لجعل ذلك المكون (وكل ما يستورده) يعمل ضمن العرض من جانب العميل:

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>;
}
```

يمكن لـ Server Component أن يعرض Client Component مباشرة — فقط كود JavaScript الخاص بـ Client Component يُرسل إلى المتصفح:

```tsx
import Counter from "./components/Counter";

export default function HomePage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Counter />
    </main>
  );
}
```

> 💡 **نصيحة:** ادفع `"use client"` إلى أسفل الشجرة قدر الإمكان. وضع علامة على صفحة كاملة كـ Client Component فقط لأن زراً واحداً يحتاج `onClick` يُفقد فوائد Server Component لكل شيء آخر في تلك الصفحة.

---

## 8. نظرة عامة على استراتيجيات العرض

### المشكلة

ليس لكل مسار نفس احتياجات الأداء — صفحة تسويقية لا تتغير أبداً، ولوحة تحكم تحتاج بيانات محدّثة في كل طلب، وقد تستفيد صفحة كبيرة من عرض محتوى جزئي بينما يُحمَّل الباقي.

### الحل

يختار Next.js تلقائياً بين:

- **العرض الساكن (Static rendering)** — لا توجد بيانات ديناميكية، يُعرَض مرة واحدة وقت البناء، ويُقدَّم من ذاكرة تخزين مؤقت (cache)
- **العرض الديناميكي (Dynamic rendering)** — يستخدم بيانات خاصة بالطلب (ملفات تعريف الارتباط، الرؤوس، معاملات البحث)، ويُعرَض بشكل محدّث لكل طلب
- **التدفق (Streaming)** — يُرسل HTML على دفعات بمجرد جاهزيتها، حتى لا تعطّل الأجزاء البطيئة الأجزاء السريعة

سترى بالضبط كيف يقرر Next.js أي استراتيجية تنطبق في القسم 10 (التخزين المؤقت وإعادة التحقق).

---

## ✅ ملخص القسم

- يستخدم Next.js **توجيهاً قائماً على الملفات** — المجلدات تحت `app/` تصبح أجزاء من الرابط (URL) تلقائياً
- **App Router** (وليس Pages Router القديم) هو المعيار الحالي، مبني على Server Components
- يُعرّف `page.tsx` محتوى المسار؛ ويوفّر `layout.tsx` واجهة مستخدم مشتركة وثابتة
- **Server Components هي الافتراضي** — بدون كود JavaScript للعميل، وصول مباشر للخادم الخلفي، بدون حالة/تأثيرات
- **Client Components** تُفعَّل عبر `"use client"` من أجل التفاعلية وواجهات برمجة المتصفح
- يختار Next.js تلقائياً العرض الساكن أو الديناميكي أو التدفقي لكل مسار

---

## Review Questions

1. **Why does only a file named `page.tsx` become a route, and not every file in that folder?**
   Because the App Router lets you colocate components, helpers, and other non-route files right next to the page that uses them — only files matching the special `page` convention are exposed as URLs.

2. **What happens if you add `useState` to a component without `"use client"`?**
   It errors at build/runtime — Server Components never execute in the browser, so there's no mechanism to hold React state or re-render in response to it. `"use client"` is required for any component using state, effects, or event handlers.

3. **Why should `"use client"` be placed as far down the component tree as possible?**
   Because everything a Client Component imports also becomes part of the client bundle. Marking a whole page as client just for one interactive button forces unrelated static content to ship as JS unnecessarily.

---

**السابق:** [القسم 2 — إعداد بيئة التطوير](../Section%2002%20-%20Development%20Environment%20Setup/README.md)
**التالي:** [القسم 4 — أساسيات App Router](../Section%2004%20-%20App%20Router%20Basics/README.md)
